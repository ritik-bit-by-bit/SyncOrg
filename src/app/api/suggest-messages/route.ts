import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST() {
  console.log('=== Suggest Messages API Called ===');
  console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return new NextResponse('GEMINI_API_KEY is not configured', { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use the latest Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('Using model: gemini-2.0-flash');

    const prompt = `Generate exactly 3 short, friendly anonymous messages. Each message should be different and creative. Return them in this exact format with no additional text, labels, or explanations:
"Message 1||Message 2||Message 3"

Example format:
"Just thinking about you||Hope your day is amazing||Sending positive vibes your way"

Important: Use only '||' to separate messages. No line breaks, no bullet points, no numbering, no quotes around the entire string.`;

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();

    console.log("Gemini raw response:", text);
    console.log("Response length:", text.length);

    // Remove quotes if the response is wrapped in quotes
    text = text.replace(/^["']|["']$/g, '');
    
    // Clean up labels like "Message 1||", "1. ", etc.
    text = text
      .replace(/Message\s*\d+\s*[:.]?\s*\|\|/gi, '')  // remove "Message 1||", "Message 1: ||", etc.
      .replace(/\d+\.\s*/g, '')                       // remove "1. ", "2. ", etc.
      .replace(/\n/g, ' ')                            // remove newlines
      .replace(/\s*\|\|\s*/g, '||')                   // normalize separators
      .trim();

    console.log("Cleaned response:", text);

    // Ensure valid format
    if (!text.includes('||')) {
      console.error('No separator found in response');
      return new NextResponse(`Failed to parse response. No separator found. Raw: ${text}`, { status: 500 });
    }

    const messages = text.split('||');
    if (messages.length < 2) {
      console.error('Not enough messages in response');
      return new NextResponse(`Failed to parse response. Not enough messages. Raw: ${text}`, { status: 500 });
    }

    console.log('Successfully parsed', messages.length, 'messages');
    
    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error: any) {
    console.error("Suggest error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return new NextResponse(
      `Internal Server Error: ${error?.message || 'Unknown error'}`,
      { status: 500 }
    );
  }
}
