import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { rfp_id } = await req.json();
    if (!rfp_id) throw new Error("rfp_id required");

    // Get RFP details
    const { data: rfp, error: rfpError } = await supabase
      .from("rfps")
      .select("*")
      .eq("id", rfp_id)
      .single();
    if (rfpError || !rfp) throw new Error("RFP not found");

    // Get sections
    const { data: sections } = await supabase
      .from("rfp_sections")
      .select("*")
      .eq("rfp_id", rfp_id)
      .order("section_order", { ascending: true });

    const sectionsText = (sections || [])
      .map((s: any) => `## ${s.title}\n${s.content || "No content"}`)
      .join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert proposal writer. Generate a professional executive summary and cover letter for an RFP response. Be concise, compelling, and focus on demonstrating capability and understanding of requirements.`,
          },
          {
            role: "user",
            content: `Generate an executive summary and cover letter for this RFP:

Title: ${rfp.title}
Agency: ${rfp.agency || "Not specified"}
Description: ${rfp.description || "Not provided"}
Deadline: ${rfp.deadline || "Not specified"}

RFP Sections:
${sectionsText || "No sections extracted yet."}

Return a structured response with:
1. Executive Summary (2-3 paragraphs)
2. Cover Letter (professional format)
3. Key themes to address
4. Recommended approach`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Get latest version
    const { data: existingDrafts } = await supabase
      .from("rfp_response_drafts")
      .select("version")
      .eq("rfp_id", rfp_id)
      .order("version", { ascending: false })
      .limit(1);

    const nextVersion = (existingDrafts?.[0]?.version || 0) + 1;

    // Save draft
    const { data: draft, error: draftError } = await supabase
      .from("rfp_response_drafts")
      .insert({
        rfp_id,
        content: {
          executive_summary: content,
          generated_at: new Date().toISOString(),
        },
        version: nextVersion,
        status: "draft",
      })
      .select()
      .single();

    if (draftError) throw draftError;

    return new Response(JSON.stringify({ draft, content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-rfp-cover-letter error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
