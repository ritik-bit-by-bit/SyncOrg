import dbConnect from '@/lib/dbConnect';
import LinkModel from '@/model/link';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const { linkId } = body;
    
    if (!linkId) {
      return Response.json({
        success: false,
        message: 'Link ID is required'
      }, { status: 400 });
    }
    
    const link = await LinkModel.findOneAndUpdate(
      { linkId },
      { $inc: { messagesCount: 1 } },
      { new: true }
    );
    
    if (!link) {
      return Response.json({
        success: false,
        message: 'Link not found'
      }, { status: 404 });
    }
    
    return Response.json({
      success: true,
      message: 'Message count updated'
    });
  } catch (error) {
    console.error('Error incrementing link count:', error);
    return Response.json({
      success: false,
      message: 'Failed to update link count'
    }, { status: 500 });
  }
}



