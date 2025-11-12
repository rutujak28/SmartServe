import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, sessionId, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch menu data to provide context
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price,
        is_vegetarian,
        is_vegan,
        spice_level,
        ingredients,
        category_id,
        menu_categories(name)
      `)
      .eq('is_available', true);

    // Build menu context for AI
    const menuContext = menuItems?.map(item => {
      const category = Array.isArray(item.menu_categories) && item.menu_categories.length > 0 
        ? item.menu_categories[0].name 
        : 'Other';
      return `${item.name} (${category}) - ₹${item.price} - ${item.description || 'Delicious Indian dish'}${item.is_vegetarian ? ' [Vegetarian]' : ''}${item.is_vegan ? ' [Vegan]' : ''}${item.spice_level ? ` [Spice Level: ${item.spice_level}/5]` : ''}`;
    }).join('\n') || '';

    const systemPrompt = `You are SmartServe AI Waiter, a helpful assistant for a smart canteen ordering system serving authentic Indian cuisine. Your role is to:
- Help users discover food items and make personalized recommendations based on their preferences
- Answer questions about menu items, ingredients, spice levels, and nutritional information
- Suggest items based on dietary preferences (vegetarian, vegan, spicy, mild, etc.)
- Provide information about the ordering process and table service
- Be friendly, enthusiastic about Indian food, and conversational
- Use Indian food terminology naturally (like dosa, paratha, biryani, chaat, etc.)

AVAILABLE MENU ITEMS:
${menuContext}

Keep responses brief and conversational. When recommending food, be enthusiastic but natural. Always mention prices when suggesting items. If asked about items not on the menu, politely explain they're not available but suggest similar alternatives.`;

    // Log user message
    if (userId && sessionId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        await supabase.from('ai_conversations').insert({
          user_id: userId,
          session_id: sessionId,
          message: lastMessage.content,
          response: '',
          context: { timestamp: new Date().toISOString(), menu_items_count: menuItems?.length || 0 }
        });
      }
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream response and collect full text for logging
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            
            // Parse SSE data to extract content
            const text = new TextDecoder().decode(value);
            const lines = text.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ') && line.slice(6).trim() !== '[DONE]') {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) fullResponse += content;
                } catch {}
              }
            }
            
            controller.enqueue(value);
          }
          
          // Log AI response
          if (userId && sessionId && fullResponse) {
            await supabase.from('ai_conversations').insert({
              user_id: userId,
              session_id: sessionId,
              message: '',
              response: fullResponse,
              context: { timestamp: new Date().toISOString(), model: 'google/gemini-2.5-flash' }
            });
          }
          
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
