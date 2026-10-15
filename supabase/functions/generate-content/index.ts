// Supabase Edge Function: generate-content
// Secure backend service that uses OPENAI_API_KEY from server env without exposing it to client.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { idea, tone, platforms } = await req.json();

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAiApiKey) {
      // Deterministic Server-side Mock Response when OpenAI key is not configured
      const caption = `[SocialSync AI] ${idea}\n\nTone: ${tone || 'Engaging'}\nOptimized for: ${(platforms || ['Instagram']).join(', ')}.\n\nSave this post for later insights! 📌`;
      const hashtags = ['#SocialSyncAI', '#GrowthStrategy', '#ContentCreator'];
      const alternativeHooks = [
        `What nobody tells you about ${idea.slice(0, 24)}...`,
        `The single best habit for ${idea.slice(0, 24)}:`,
      ];

      return new Response(
        JSON.stringify({
          caption,
          hashtags,
          alternativeHooks,
          isSimulated: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Call OpenAI if key is present
    const prompt = `Write a high-converting social media caption for this idea: "${idea}". Tone: ${tone}. Target platforms: ${platforms?.join(', ')}. Include 4 relevant hashtags.`;
    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await openAiRes.json();
    const resultText = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({
        caption: resultText,
        hashtags: ['#CreatorTips', '#SocialSync'],
        isSimulated: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
