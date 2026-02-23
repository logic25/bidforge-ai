import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const url = new URL(req.url);

    if (req.method === "GET") {
      const type = url.searchParams.get("type");
      const token = url.searchParams.get("token");

      if (!token) {
        return new Response(JSON.stringify({ error: "Token required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (type === "rfi") {
        const { data, error } = await supabase
          .from("rfi_requests")
          .select("project_name, questions, status")
          .eq("response_token", token)
          .single();

        if (error || !data) {
          return new Response(JSON.stringify({ error: "RFI not found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Mark as viewed
        await supabase.from("rfi_requests").update({ status: "viewed" }).eq("response_token", token);

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (type === "partner") {
        const { data, error } = await supabase
          .from("rfp_partner_outreach")
          .select("partner_name, status, rfp_id, rfps(title, description, agency)")
          .eq("response_token", token)
          .single();

        if (error || !data) {
          return new Response(JSON.stringify({ error: "Outreach not found" }), {
            status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        await supabase.from("rfp_partner_outreach").update({ status: "viewed" }).eq("response_token", token);

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { type, token, answers, response } = body;

      if (!token) {
        return new Response(JSON.stringify({ error: "Token required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (type === "rfi") {
        const { error } = await supabase
          .from("rfi_requests")
          .update({ response_data: answers, status: "responded", responded_at: new Date().toISOString() })
          .eq("response_token", token);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (type === "partner") {
        const { error } = await supabase
          .from("rfp_partner_outreach")
          .update({ response_data: response, status: "responded", responded_at: new Date().toISOString() })
          .eq("response_token", token);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("partner-response error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
