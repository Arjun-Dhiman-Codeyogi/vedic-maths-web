import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Different providers for redundancy
const CHAT_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",   // Venice
  "google/gemma-3-27b-it:free",                // Google AI Studio
  "nvidia/nemotron-3-nano-30b-a3b:free",       // Nvidia
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, problemContext } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const systemPrompt = `You are a friendly and expert Vedic Math teacher who helps students understand math concepts.

Context about the current problem being discussed:
${problemContext || "No specific problem context provided."}

Rules:
- Explain things clearly in simple language
- If the student asks in Hindi, respond in Hindi. If in English, respond in English.
- Use examples and analogies to make things easy to understand
- Encourage the student and be supportive
- Focus on both traditional and Vedic Math methods
- Keep responses concise but thorough
- Use markdown formatting for math steps`;

    // Embed system prompt in the first user message (works with all models including Gemma)
    const [firstMsg, ...restMsgs] = messages as { role: string; content: string }[];
    const augmentedMessages = [
      { role: firstMsg.role, content: `${systemPrompt}\n\n${firstMsg.content}` },
      ...restMsgs,
    ];

    // Try models in order, fallback on error
    for (let i = 0; i < CHAT_MODELS.length; i++) {
      const model = CHAT_MODELS[i];
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://vedic-math-app.vercel.app",
          "X-Title": "Vedic Math App",
        },
        body: JSON.stringify({
          model,
          messages: augmentedMessages,
          stream: true,
          temperature: 0.7,
        }),
      });

      if (response.ok && response.body) {
        // OpenRouter returns OpenAI-compatible SSE format — pipe directly
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      const errText = await response.text();
      console.error(`${model} stream error ${response.status}: ${errText}`);

      if (i < CHAT_MODELS.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    return new Response(JSON.stringify({ error: "AI service error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("solver-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
