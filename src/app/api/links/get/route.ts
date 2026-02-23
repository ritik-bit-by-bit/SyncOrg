import dbConnect from '@/lib/dbConnect';
import LinkModel from '@/model/link';
import UserModel from '@/model/user';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const url = new URL(request.url);
    const linkId = url.searchParams.get('linkId');
    
    if (!linkId) {
      return Response.json({
        success: false,
        message: 'Link ID is required'
      }, { status: 400 });
    }
    
    const link = await LinkModel.findOne({ linkId, isActive: true });
    
    if (!link) {
      return Response.json({
        success: false,
        message: 'Link not found or inactive'
      }, { status: 404 });
    }
    
    // Check if link is expired
    const now = new Date();
    if (link.expiresAt && new Date(link.expiresAt) < now) {
      return Response.json({
        success: false,
        message: 'Link has expired'
      }, { status: 400 });
    }
    
    // Check if max messages reached
    if (link.maxMessages && link.messagesCount >= link.maxMessages) {
      return Response.json({
        success: false,
        message: 'Link has reached maximum messages'
      }, { status: 400 });
    }
    
    // Get owner username
    const owner = await UserModel.findById(link.ownerUserId);
    
    if (!owner) {
      return Response.json({
        success: false,
        message: 'Link owner not found'
      }, { status: 404 });
    }
    
    // Check if owner is accepting messages
    if (!owner.isAcceptingMessage) {
      return Response.json({
        success: false,
        message: 'User is not accepting messages'
      }, { status: 400 });
    }
    
    return Response.json({
      success: true,
      data: {
        linkId: link.linkId,
        username: owner.username,
        mode: link.mode,
        title: link.title,
        description: link.description,
        expiresAt: link.expiresAt,
        maxMessages: link.maxMessages,
        messagesCount: link.messagesCount
      }
    });
  } catch (error) {
    console.error('Error fetching link:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch link'
    }, { status: 500 });
  }
}



