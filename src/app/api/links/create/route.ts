import dbConnect from '@/lib/dbConnect';
import LinkModel from '@/model/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

function generateLinkId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  const user = session?.user as User;
  
  if (!session || !user || !user._id) {
    return Response.json({
      success: false,
      message: 'Unauthorized'
    }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { mode, expiresAt, maxMessages, title, description } = body;
    
    const linkId = generateLinkId();
    
    // Calculate expiration date if provided
    let expirationDate: Date | null = null;
    if (expiresAt) {
      const hours = parseInt(expiresAt);
      if (!isNaN(hours) && hours > 0) {
        expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + hours);
      }
    }
    
    const link = new LinkModel({
      linkId,
      ownerUserId: user._id,
      mode: mode || 'message',
      expiresAt: expirationDate,
      maxMessages: maxMessages || null,
      messagesCount: 0,
      title: title || '',
      description: description || '',
      isActive: true
    });
    
    await link.save();
    
    return Response.json({
      success: true,
      message: 'Link created successfully',
      data: {
        linkId,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/l/${linkId}`,
        link: link.toObject()
      }
    });
  } catch (error) {
    console.error('Error creating link:', error);
    return Response.json({
      success: false,
      message: 'Failed to create link'
    }, { status: 500 });
  }
}

