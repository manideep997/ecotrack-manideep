import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, cityName } = await req.json();

  // Fetch user's recent activities to provide context to Gemini
  const activities = await prisma.activity.findMany({
    where: cityName ? { cityProfile: { name: cityName } } : {},
    orderBy: { date: 'desc' },
    take: 10
  });

  const contextStr = activities.map((a: any) => `${a.subcategory}: ${a.co2Emitted.toFixed(2)} kg CO2`).join(', ');
  
  let locationContext = cityName ? `The user is based in ${cityName}. Provide extremely specific location-aware advice (e.g., mention local public transit systems, local energy grid, or city-specific lifestyle tips). ` : "";

  const systemMessage = `You are the EcoTrack AI Assistant, an expert in sustainability. 
Your goal is to help the user reduce their carbon footprint.
${locationContext}
Here is the user's recent footprint data: ${contextStr || 'No recent data.'}
Provide short, actionable, and personalized advice. Be encouraging. Do not use markdown headers, just plain text with occasional bolding.`;

  const result = streamText({
    model: google('gemini-2.5-flash'), 
    system: systemMessage,
    messages,
  });

  // Convert textStream to the old DataStream format expected by @ai-sdk/react v3
  const stream = result.textStream;
  const encoder = new TextEncoder();
  
  const transform = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
    }
  });

  return new Response(stream.pipeThrough(transform), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'x-vercel-ai-data-stream': 'v1',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
