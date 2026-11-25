import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Server configuration missing");

    const body = await req.json();
    const zone_name = String(body.zone_name ?? "").trim();
    const zone_code = String(body.zone_code ?? "").trim();
    const pin_start = String(body.pin_start ?? "").trim();
    const pin_end = String(body.pin_end ?? "").trim();

    if (!zone_name || !zone_code) throw new Error("Zone name and zone code are required");
    if (zone_name.length > 100 || zone_code.length > 20) throw new Error("Zone name or code is too long");
    if (!/^\d{6}$/.test(pin_start) || !/^\d{6}$/.test(pin_end)) throw new Error("PINs must contain exactly 6 digits");
    if (Number(pin_end) < Number(pin_start)) throw new Error("PIN End must be greater than or equal to PIN Start");
    if (Number(pin_end) - Number(pin_start) > 4999) throw new Error("Maximum 5,000 PIN codes allowed per zone");

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.rpc("create_zone_with_pins", {
      p_zone_name: zone_name,
      p_zone_code: zone_code,
      p_pin_start: pin_start,
      p_pin_end: pin_end,
    });
    if (error) throw error;

    return Response.json({ success: true, zone_id: data, message: "Zone and PIN codes created successfully" }, {
      status: 200, headers: corsHeaders,
    });
  } catch (error) {
    console.error("create-zone error:", error);
    return Response.json({ success: false, error: error instanceof Error ? error.message : "Internal server error" }, {
      status: 400, headers: corsHeaders,
    });
  }
});
