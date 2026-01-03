import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory mock data store
const mockPaymentRequests: Record<string, any> = {};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  try {
    // POST /payment-requests - Create new payment request
    if (req.method === 'POST') {
      const body = await req.json();
      const { escrowId, category, amountKes } = body;

      // Validation
      if (!escrowId || typeof escrowId !== 'string') {
        return new Response(
          JSON.stringify({ error: 'escrowId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!category || typeof category !== 'string') {
        return new Response(
          JSON.stringify({ error: 'category is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!amountKes || typeof amountKes !== 'number' || amountKes <= 0) {
        return new Response(
          JSON.stringify({ error: 'amountKes must be a positive number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentRequestId = crypto.randomUUID();

      // Store mock payment request
      mockPaymentRequests[paymentRequestId] = {
        paymentRequestId,
        escrowId,
        category,
        amountKes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log(`[PAYMENT-REQUESTS] Created payment request: ${paymentRequestId}`, mockPaymentRequests[paymentRequestId]);

      return new Response(
        JSON.stringify({
          paymentRequestId,
          status: "pending"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /payment-requests/:id - Get payment request by ID
    if (req.method === 'GET') {
      // Extract ID from path or query params
      const paymentRequestId = pathParts[pathParts.length - 1] !== 'payment-requests'
        ? pathParts[pathParts.length - 1]
        : url.searchParams.get('id');

      if (!paymentRequestId || paymentRequestId === 'payment-requests') {
        return new Response(
          JSON.stringify({ error: 'Payment request ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[PAYMENT-REQUESTS] Fetching payment request: ${paymentRequestId}`);

      // Return mock data
      return new Response(
        JSON.stringify({
          paymentRequestId,
          status: "pending"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[PAYMENT-REQUESTS] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
