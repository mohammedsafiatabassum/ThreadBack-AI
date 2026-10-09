interface AnalyzeRequest {
  conversation: string;
  title: string;
  userName?: string;
}

interface Finding {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  sourceExcerpt: string;
  sourceReference?: string;
  assignee?: string;
  deadline?: string;
  deadlineConfirmed: boolean;
  uncertain: boolean;
}

interface AnalysisResultData {
  summary: {
    mainTopic: string;
    keyDevelopments: string[];
    currentStatus: string;
  };
  missedInformation: Finding[];
  actionItems: Finding[];
  allFindings: Finding[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are ThreadBack AI, an assistant that helps people catch up on conversations they missed (Slack threads, email chains, chat logs, meeting transcripts).

Your job is to analyze the provided conversation and extract:
1. A concise SUMMARY: main topic, important developments, and current status.
2. MISSED INFORMATION: announcements, decisions, requests, changes, and unresolved questions that someone returning from absence would need to know.
3. ACTION ITEMS: tasks with deadlines and assigned people — only when explicitly stated in the conversation.
4. PRIORITY: Categorize each finding as CRITICAL, HIGH, MEDIUM, or LOW.
5. SOURCE EVIDENCE: Every finding MUST include a short exact excerpt from the original conversation that supports it. Never fabricate quotes.

STRICT RULES:
- Never invent task owners, deadlines, or decisions. If something is ambiguous, mark it uncertain.
- If a deadline is explicitly confirmed, set deadlineConfirmed=true. If it's vague ("soon", "by next week" without a specific date), set deadlineConfirmed=false.
- Only include assignees when someone is explicitly named as responsible.
- Source excerpts must be real text from the input — do not paraphrase or invent.
- Keep titles concise (one sentence). Descriptions should explain why the finding matters.
- Generate stable IDs like "f1", "f2", "f3" etc.

Respond ONLY with valid JSON in this exact structure:
{
  "summary": {
    "mainTopic": "string",
    "keyDevelopments": ["string", "string"],
    "currentStatus": "string"
  },
  "missedInformation": [Finding],
  "actionItems": [Finding],
  "allFindings": [Finding]
}

Each Finding object must have:
{
  "id": "f1",
  "type": "decision" | "action_item" | "announcement" | "deadline" | "unresolved_question" | "change" | "request" | "note",
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "title": "string",
  "description": "string — why this matters",
  "sourceExcerpt": "exact quote from the conversation",
  "sourceReference": "optional — speaker name or message reference",
  "assignee": "optional — only if explicitly stated",
  "deadline": "optional — only if mentioned",
  "deadlineConfirmed": boolean,
  "uncertain": boolean
}`;

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { conversation, title, userName } = (await req.json()) as AnalyzeRequest;

    if (!conversation || conversation.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Please provide a longer conversation to analyze." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (conversation.length > 50000) {
      return new Response(
        JSON.stringify({ error: "Conversation is too long (max 50,000 characters). Please trim it." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiKey) {
      return new Response(
        JSON.stringify({
          error: "AI analysis is not configured. The GEMINI_API_KEY secret has not been set on the server. You can use the local demo mode to explore the interface with rule-based analysis.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userPrompt = userName
      ? `Conversation title: ${title}\nMy name: ${userName}\n\nAnalyze this conversation and help me catch up:\n\n${conversation}`
      : `Conversation title: ${title}\n\nAnalyze this conversation and help the user catch up:\n\n${conversation}`;

    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${geminiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);

      let safeMessage = "The AI analysis service returned an error.";
      try {
        const errorJson = JSON.parse(errorText);
        const errStatus = errorJson?.error?.status || "";
        const errMessage = errorJson?.error?.message || "";

        if (geminiResponse.status === 400 && errStatus === "INVALID_ARGUMENT") {
          safeMessage = `The AI provider rejected the request. ${errMessage ? errMessage : "The request format may be invalid."}`;
        } else if (geminiResponse.status === 403 || errStatus === "PERMISSION_DENIED") {
          safeMessage = "The AI provider rejected the API key (HTTP 403). The GEMINI_API_KEY secret is invalid or lacks permission.";
        } else if (geminiResponse.status === 404) {
          safeMessage = `The AI model "${GEMINI_MODEL}" was not found (HTTP 404). It may not be available for this API key.`;
        } else if (geminiResponse.status === 429 || errStatus === "RESOURCE_EXHAUSTED") {
          safeMessage = "The AI provider rate-limited the request (HTTP 429). Usage may have exceeded the free-tier quota. Please try again later.";
        } else if (geminiResponse.status === 503) {
          safeMessage = `The AI model "${GEMINI_MODEL}" is temporarily unavailable (HTTP 503). Google's servers may be overloaded — please try again in a moment.`;
        } else if (geminiResponse.status >= 500) {
          safeMessage = `The AI provider had a server error (HTTP ${geminiResponse.status}). Please try again.`;
        } else {
          safeMessage = `The AI provider returned HTTP ${geminiResponse.status}${errStatus ? ` (${errStatus})` : ""}.`;
        }
      } catch {
        safeMessage = `The AI provider returned HTTP ${geminiResponse.status}.`;
      }

      return new Response(
        JSON.stringify({ error: safeMessage }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiData = await geminiResponse.json();
    const content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      const finishReason = geminiData?.candidates?.[0]?.finishReason;
      if (finishReason === "SAFETY") {
        return new Response(
          JSON.stringify({ error: "The AI service blocked the response due to safety filters. Please try with different input." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: "The AI service returned an empty response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: AnalysisResultData;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse Gemini response as JSON. Raw content length:", content.length);
      return new Response(
        JSON.stringify({ error: "The AI service returned a malformed response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ result: parsed, provider: "ai" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred during analysis." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
