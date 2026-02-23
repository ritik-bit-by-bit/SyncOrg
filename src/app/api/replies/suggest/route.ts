import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { messageText } = await request.json();
    
    if (!messageText) {
      return Response.json({
        success: false,
        message: 'Message text is required'
      }, { status: 400 });
    }
    
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      // Fallback suggestions
      return Response.json({
        success: true,
        suggestions: [
          'Thank you for your message!',
          'I appreciate your feedback.',
          'Thanks for reaching out!'
        ]
      });
    }
    
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = `Generate 3 short, helpful reply suggestions for this anonymous message. Make them friendly, professional, and appropriate. Keep each suggestion under 50 words.

Message: "${messageText}"

Format: Return only the 3 suggestions, one per line, without numbering or bullets.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse suggestions
      const suggestions = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 3);
      
      // Fallback if parsing fails
      if (suggestions.length === 0) {
        return Response.json({
          success: true,
          suggestions: [
            'Thank you for your message!',
            'I appreciate your feedback.',
            'Thanks for reaching out!'
          ]
        });
      }
      
      return Response.json({
        success: true,
        suggestions
      });
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback suggestions
      return Response.json({
        success: true,
        suggestions: [
          'Thank you for your message!',
          'I appreciate your feedback.',
          'Thanks for reaching out!'
        ]
      });
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return Response.json({
      success: false,
      message: 'Failed to generate suggestions'
    }, { status: 500 });
  }
}

