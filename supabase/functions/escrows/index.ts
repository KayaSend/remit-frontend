import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory mock data store
const mockEscrows: Record<string, any> = {};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  try {
    // POST /escrows - Create new escrow
    if (req.method === 'POST') {
      const body = await req.json();
      const { recipientPhone, totalAmountUsd, categories } = body;

      // Validation
      if (!recipientPhone || typeof recipientPhone !== 'string') {
        return new Response(
          JSON.stringify({ error: 'recipientPhone is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!totalAmountUsd || typeof totalAmountUsd !== 'number' || totalAmountUsd <= 0) {
        return new Response(
          JSON.stringify({ error: 'totalAmountUsd must be a positive number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return new Response(
          JSON.stringify({ error: 'categories must be a non-empty array' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const escrowId = crypto.randomUUID();
      
      // Store mock escrow data
      mockEscrows[escrowId] = {
        escrowId,
        recipientPhone,
        totalAmountUsd,
        categories,
        status: 'active',
        spentUsd: 0,
        createdAt: new Date().toISOString()
      };

      console.log(`[ESCROWS] Created escrow: ${escrowId}`, mockEscrows[escrowId]);

      return new Response(
        JSON.stringify({
          escrowId,
          status: "active",
          totalAmountUsd
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /escrows/:id - Get escrow by ID
    if (req.method === 'GET') {
      // Extract ID from path or query params
      const escrowId = pathParts[pathParts.length - 1] !== 'escrows' 
        ? pathParts[pathParts.length - 1] 
        : url.searchParams.get('id');

      if (!escrowId || escrowId === 'escrows') {
        return new Response(
          JSON.stringify({ error: 'Escrow ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[ESCROWS] Fetching escrow: ${escrowId}`);

      // Return mock data (simulating DB lookup)
      const mockCategories = [
        { name: "electricity", remainingUsd: 60 },
        { name: "groceries", remainingUsd: 30 },
        { name: "transport", remainingUsd: 10 }
      ];

      return new Response(
        JSON.stringify({
          escrowId,
          status: "active",
          spentUsd: 40,
          categories: mockCategories
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[ESCROWS] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
