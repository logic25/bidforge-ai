import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!firecrawlKey) {
      return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if a specific source_id was provided (for single agency scan)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No body = scan all sources
    }

    const specificSourceId = body?.source_id;

    // Get sources to scan
    let sourcesQuery = supabase
      .from("rfp_sources")
      .select("*, companies!inner(id, keywords, industries, states)")
      .eq("is_active", true);

    if (specificSourceId) {
      sourcesQuery = sourcesQuery.eq("id", specificSourceId);
    }

    const { data: sources, error: srcErr } = await sourcesQuery;
    if (srcErr) throw srcErr;

    let totalDiscovered = 0;

    for (const source of sources || []) {
      try {
        // Scrape the source URL
        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: source.url, formats: ["markdown"], onlyMainContent: true }),
        });

        if (!scrapeRes.ok) {
          console.error(`Failed to scrape ${source.url}:`, await scrapeRes.text());
          continue;
        }

        const scrapeData = await scrapeRes.json();
        const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";

        if (!markdown) continue;

        // Get monitoring rules for this company
        const { data: rules } = await supabase
          .from("rfp_monitoring_rules")
          .select("*")
          .eq("company_id", source.company_id)
          .eq("is_active", true);

        const keywords = rules?.flatMap((r: any) => r.keywords || []) || [];
        const companyKeywords = source.companies?.keywords || [];
        const allKeywords = [...keywords, ...companyKeywords];

        // Use AI to extract RFP listings from the scraped content
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `You extract RFP/bid opportunity listings from web content. For each RFP found, return a JSON array of objects with: title, agency, description, deadline (ISO format or null), value_estimate (number or null), source_url. Only return valid JSON array, no markdown.`
              },
              {
                role: "user",
                content: `Extract RFP listings from this procurement page content. Keywords to match: ${allKeywords.join(", ")}.\n\n${markdown.substring(0, 8000)}`
              }
            ],
            tools: [{
              type: "function",
              function: {
                name: "extract_rfps",
                description: "Extract RFP listings from content",
                parameters: {
                  type: "object",
                  properties: {
                    rfps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          agency: { type: "string" },
                          description: { type: "string" },
                          deadline: { type: "string" },
                          value_estimate: { type: "number" },
                        },
                        required: ["title"]
                      }
                    }
                  },
                  required: ["rfps"]
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "extract_rfps" } }
          }),
        });

        if (!aiRes.ok) {
          console.error("AI extraction failed:", await aiRes.text());
          continue;
        }

        const aiData = await aiRes.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall) continue;

        let rfps: any[];
        try {
          const parsed = JSON.parse(toolCall.function.arguments);
          rfps = parsed.rfps || [];
        } catch {
          continue;
        }

        // Score relevance and insert
        for (const rfp of rfps) {
          const text = `${rfp.title} ${rfp.description || ""} ${rfp.agency || ""}`.toLowerCase();
          let score = 0;
          for (const kw of allKeywords) {
            if (text.includes(kw.toLowerCase())) score += 20;
          }
          score = Math.min(score, 100);

          const matchReasons = allKeywords
            .filter((kw: string) => text.includes(kw.toLowerCase()))
            .map((kw: string) => `Matches keyword: ${kw}`);

          // Use source name as agency if agency-type source
          const agencyName = rfp.agency || (source.source_type === "agency" ? source.name : source.name);

          // Check for duplicates
          const { data: existing } = await supabase
            .from("discovered_rfps")
            .select("id")
            .eq("company_id", source.company_id)
            .eq("title", rfp.title)
            .limit(1);

          if (existing && existing.length > 0) continue;

          await supabase.from("discovered_rfps").insert({
            company_id: source.company_id,
            title: rfp.title,
            agency: agencyName,
            description: rfp.description,
            source_url: source.url,
            relevance_score: score,
            match_reason: matchReasons.join("; ") || "Found on monitored source",
            deadline: rfp.deadline || null,
            value_estimate: rfp.value_estimate || null,
          });
          totalDiscovered++;
        }

        // Update last_checked
        await supabase.from("rfp_sources").update({ last_checked: new Date().toISOString() }).eq("id", source.id);
      } catch (err) {
        console.error(`Error processing source ${source.name}:`, err);
      }
    }

    return new Response(JSON.stringify({ success: true, discovered: totalDiscovered }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("monitor-rfps error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
