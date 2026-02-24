import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, textProblem } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert math teacher who specializes in both traditional school methods and Vedic Mathematics.

When given a math problem (either as an image or text):
1. First, identify the math problem clearly.
2. Solve it using the TRADITIONAL school method with detailed step-by-step solution.
3. Solve it using a VEDIC MATH shortcut/sutra with step-by-step solution. Name the specific Vedic sutra used.
4. Estimate the time each method would take for a student.

IMPORTANT: You MUST respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "problem": "the identified math problem as a string like 47 × 53",
  "traditional": {
    "steps": ["step 1", "step 2", "step 3", "final answer"],
    "time": "estimated time like 45 seconds",
    "explanation_hi": "Hindi me traditional method ka explanation ache se samjhao",
    "explanation_en": "English explanation of the traditional method in detail"
  },
  "vedic": {
    "method": "Name of the Vedic Sutra used",
    "steps": ["step 1", "step 2", "step 3", "final answer"],
    "time": "estimated time like 12 seconds",
    "explanation_hi": "Hindi me vedic method ka explanation ache se samjhao step by step",
    "explanation_en": "English explanation of the vedic method in detail"
  },
  "speedup": "3.75x",
  "difficulty": "Easy/Medium/Hard"
}

If there are multiple problems in the image, solve only the first/main one.
If you cannot identify a math problem, return: {"error": "No math problem found"}`;

    type ContentPart =
      | { type: "image_url"; image_url: { url: string } }
      | { type: "text"; text: string };
    const userContent: ContentPart[] = [];

    if (imageBase64) {
      // Remove data:image/...;base64, prefix if present
      const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      const mimeMatch = imageBase64.match(/data:(image\/[^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64Data}` },
      });
      userContent.push({
        type: "text",
        text: "Identify and solve this math problem using both traditional and vedic methods. Return JSON only.",
      });
    } else if (textProblem) {
      userContent.push({
        type: "text",
        text: `Solve this math problem using both traditional and vedic methods: ${textProblem}. Return JSON only.`,
      });
    } else {
      return new Response(JSON.stringify({ error: "No image or problem provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "Empty response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from the response, handling possible markdown code blocks
    let parsed: Record<string, unknown>;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { error: "Could not parse AI response", raw: content };
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
