import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert math teacher who specializes in both traditional school methods and Vedic Mathematics.

When given a math problem (either as an image or text):
1. Identify the math problem clearly.
2. Solve using the TRADITIONAL school method step by step.
3. Solve using a VEDIC MATH shortcut/sutra step by step. Name the Vedic sutra.
4. Estimate time each method takes.

Respond ONLY in this exact JSON format — no markdown, no code blocks:
{
  "problem": "47 × 53",
  "traditional": {
    "steps": ["step 1", "step 2", "final answer"],
    "time": "45 seconds",
    "explanation_hi": "Hindi explanation",
    "explanation_en": "English explanation"
  },
  "vedic": {
    "method": "Vedic Sutra Name",
    "steps": ["step 1", "step 2", "final answer"],
    "time": "12 seconds",
    "explanation_hi": "Hindi explanation",
    "explanation_en": "English explanation"
  },
  "speedup": "3.75x",
  "difficulty": "Easy"
}
If no math problem found: {"error": "No math problem found"}`;

// Text-only models (different providers for redundancy)
const TEXT_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",   // Venice
  "google/gemma-3-27b-it:free",                // Google AI Studio
  "nvidia/nemotron-3-nano-30b-a3b:free",       // Nvidia
];

// Vision models for image problems (different providers)
const VISION_MODELS = [
  "mistralai/mistral-small-3.1-24b-instruct:free", // Venice
  "google/gemma-3-27b-it:free",                    // Google AI Studio
  "nvidia/nemotron-nano-12b-v2-vl:free",           // Nvidia
];

async function callOpenRouter(
  apiKey: string,
  messages: unknown[],
  models: string[],
): Promise<{ ok: boolean; data: unknown }> {
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://vedic-math-app.vercel.app",
        "X-Title": "Vedic Math App",
      },
      body: JSON.stringify({ model, messages }),
    });

    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }

    const errText = await res.text();
    console.error(`${model} error ${res.status}: ${errText}`);

    // Wait before trying next model on rate limit
    if (res.status === 429 && i < models.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  return { ok: false, data: { error: "quota_exceeded" } };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, textProblem } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    if (!imageBase64 && !textProblem) {
      return new Response(JSON.stringify({ error: "No input provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build messages — embed system prompt in user message (works with all models)
    let messages: unknown[];
    let models: string[];

    if (imageBase64) {
      const imageUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
      messages = [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: `${SYSTEM_PROMPT}\n\nSolve the math problem in this image. Return JSON only.` },
        ],
      }];
      models = VISION_MODELS;
    } else {
      messages = [{
        role: "user",
        content: `${SYSTEM_PROMPT}\n\nSolve: ${textProblem}. Return JSON only.`,
      }];
      models = TEXT_MODELS;
    }

    const { ok, data } = await callOpenRouter(OPENROUTER_API_KEY, messages, models);

    if (!ok) {
      return new Response(
        JSON.stringify({ error: "quota_exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract text from OpenRouter response (OpenAI-compatible format)
    const openRouterData = data as { choices?: { message?: { content?: string } }[] };
    const content = openRouterData.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(JSON.stringify({ error: "Empty response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    } catch {
      parsed = { error: "Could not parse AI response" };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("math-solver error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
