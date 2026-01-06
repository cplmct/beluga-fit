import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WorkoutRequest {
  goal: string;
  experienceLevel: string;
  daysPerWeek: number;
  availableEquipment: string[];
  injuriesLimitations?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { goal, experienceLevel, daysPerWeek, availableEquipment, injuriesLimitations }: WorkoutRequest = await req.json();

    const equipmentList = availableEquipment.length > 0 ? availableEquipment.join(", ") : "bodyweight only";
    const limitations = injuriesLimitations ? `\n- Injuries/Limitations: ${injuriesLimitations}` : "";

    const prompt = `You are an expert fitness coach. Create a detailed ${daysPerWeek}-day per week workout plan with the following specifications:

- Goal: ${goal}
- Experience Level: ${experienceLevel}
- Days per Week: ${daysPerWeek}
- Available Equipment: ${equipmentList}${limitations}

Provide a comprehensive workout plan in JSON format with the following structure:
{
  "title": "Plan name",
  "description": "Brief overview",
  "weeklySchedule": [
    {
      "day": 1,
      "dayName": "Day name (e.g., Upper Body)",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "10-12",
          "rest": "60 seconds",
          "notes": "Form tips or modifications"
        }
      ]
    }
  ],
  "tips": ["General tips for following this plan"]
}

Ensure exercises are appropriate for the experience level and use only the available equipment. Include proper warm-up and cool-down recommendations.`;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert fitness coach who creates personalized workout plans. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate workout plan' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const planData = JSON.parse(openaiData.choices[0].message.content);

    return new Response(
      JSON.stringify({ plan: planData }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
