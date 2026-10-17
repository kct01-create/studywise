// Supabase Edge Function: generates a study plan with Google Gemini.
// Secrets: GEMINI_API_KEY (required), GEMINI_MODEL (optional). Keep "Verify JWT" ON.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
const FAIL = "Could not generate a plan right now. Please try again in a moment.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { prompt } = await req.json();
    if (typeof prompt !== "string" || prompt.length < 20 || prompt.length > 4000)
      return json({ error: "Invalid request." }, 400);
    const key = (Deno.env.get("GEMINI_API_KEY") ?? "").trim();
    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.8-flash";
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4000 },
        }),
      },
    );
    const raw = await r.text();
    if (!r.ok) { console.error("Gemini error", r.status, raw.slice(0, 500)); return json({ error: FAIL }, 502); }
    const data = JSON.parse(raw);
    const t: string = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b < a) { console.error("No JSON in reply", t.slice(0, 300)); return json({ error: FAIL }, 502); }
    return json(JSON.parse(t.slice(a, b + 1)));
  } catch (e) {
    console.error(e);
    return json({ error: FAIL }, 500);
  }
});
