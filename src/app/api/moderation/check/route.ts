import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return Response.json({
        success: false,
        message: 'Text is required'
      }, { status: 400 });
    }
    
    // Check if OpenAI API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      // Fallback: simple keyword-based moderation
      const toxicKeywords = ['hate', 'kill', 'die', 'stupid', 'idiot'];
      const lowerText = text.toLowerCase();
      const hasToxicKeyword = toxicKeywords.some(keyword => lowerText.includes(keyword));
      
      return Response.json({
        success: true,
        safe: !hasToxicKeyword,
        toxicity: hasToxicKeyword ? 0.7 : 0.1,
        categories: hasToxicKeyword ? ['toxicity'] : [],
        method: 'keyword'
      });
    }
    
    // Use OpenAI Moderation API
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({ input: text })
      });
      
      if (!response.ok) {
        throw new Error('OpenAI API error');
      }
      
      const data = await response.json();
      const result = data.results[0];
      
      return Response.json({
        success: true,
        safe: !result.flagged,
        toxicity: result.categories.toxicity ? 0.9 : 0.1,
        categories: Object.keys(result.categories).filter(key => result.categories[key]),
        method: 'openai'
      });
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      // Fallback to keyword check
      const toxicKeywords = ['hate', 'kill', 'die'];
      const lowerText = text.toLowerCase();
      const hasToxicKeyword = toxicKeywords.some(keyword => lowerText.includes(keyword));
      
      return Response.json({
        success: true,
        safe: !hasToxicKeyword,
        toxicity: hasToxicKeyword ? 0.7 : 0.1,
        categories: hasToxicKeyword ? ['toxicity'] : [],
        method: 'keyword-fallback'
      });
    }
  } catch (error) {
    console.error('Moderation check error:', error);
    return Response.json({
      success: false,
      message: 'Failed to check moderation'
    }, { status: 500 });
  }
}

