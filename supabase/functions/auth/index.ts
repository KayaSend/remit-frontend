import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock Privy client initialization (would be real in production)
const privyClient = {
  initialized: true,
  sendOtp: async (phone: string) => {
    console.log(`[MOCK PRIVY] Sending OTP to ${phone}`);
    return { success: true };
  },
  verifyOtp: async (phone: string, otp: string) => {
    console.log(`[MOCK PRIVY] Verifying OTP ${otp} for ${phone}`);
    return { valid: true };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();

    if (path === 'send-otp' || url.pathname.includes('send-otp')) {
      const { phone } = body;
      
      if (!phone || typeof phone !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Phone number is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[AUTH] send-otp requested for phone: ${phone}`);
      
      // Mock Privy OTP send
      await privyClient.sendOtp(phone);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === 'verify-otp' || url.pathname.includes('verify-otp')) {
      const { phone, otp } = body;

      if (!phone || typeof phone !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Phone number is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!otp || typeof otp !== 'string') {
        return new Response(
          JSON.stringify({ error: 'OTP is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[AUTH] verify-otp requested for phone: ${phone}, otp: ${otp}`);

      // Mock Privy OTP verification
      await privyClient.verifyOtp(phone, otp);

      // Return mock JWT and userId
      const mockUserId = crypto.randomUUID();
      
      return new Response(
        JSON.stringify({
          token: "mock-jwt-token",
          userId: mockUserId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint. Use /send-otp or /verify-otp' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[AUTH] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
