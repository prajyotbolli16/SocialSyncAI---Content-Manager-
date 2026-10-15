// Supabase Edge Function: analyze-fatigue
// Runs server-side fatigue metrics calculation and generates warning signals

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
    const { posts } = await req.json();

    // Calculate repetition
    const hashtagFrequency: Record<string, number> = {};
    (posts || []).forEach((p: any) => {
      (p.hashtags || []).forEach((h: string) => {
        hashtagFrequency[h] = (hashtagFrequency[h] || 0) + 1;
      });
    });

    const overused = Object.entries(hashtagFrequency)
      .filter(([_, count]) => count > 2)
      .map(([tag]) => tag);

    const contentScore = Math.min(overused.length * 20 + 25, 90);
    const audienceScore = 28;

    return new Response(
      JSON.stringify({
        contentFatigueScore: contentScore,
        audienceFatigueScore: audienceScore,
        audienceTrend: 'Stable',
        overusedHashtags: overused,
        recommendations: [
          'Diversify hook formats: use questions and contrarian viewpoints.',
          'Rotate top 3 hashtags every week.',
        ],
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
