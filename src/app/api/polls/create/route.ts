import dbConnect from '@/lib/dbConnect';
import PollModel from '@/model/poll';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

function generatePollId(): string {
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
    const { question, options, allowMultiple, expiresAt } = body;
    
    if (!question || !options || options.length < 2) {
      return Response.json({
        success: false,
        message: 'Question and at least 2 options are required'
      }, { status: 400 });
    }
    
    const pollId = generatePollId();
    
    // Generate option IDs
    const pollOptions = options.map((label: string, index: number) => ({
      optionId: `opt_${index}`,
      label,
      votesCount: 0
    }));
    
    // Calculate expiration date if provided
    let expirationDate: Date | null = null;
    if (expiresAt) {
      const hours = parseInt(expiresAt);
      if (!isNaN(hours) && hours > 0) {
        expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + hours);
      }
    }
    
    const poll = new PollModel({
      pollId,
      ownerUserId: user._id,
      question,
      options: pollOptions,
      votes: [],
      allowMultiple: allowMultiple || false,
      expiresAt: expirationDate,
      isActive: true
    });
    
    await poll.save();
    
    return Response.json({
      success: true,
      message: 'Poll created successfully',
      data: {
        pollId,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/poll/${pollId}`,
        poll: poll.toObject()
      }
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    return Response.json({
      success: false,
      message: 'Failed to create poll'
    }, { status: 500 });
  }
}

