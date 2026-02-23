import dbConnect from '@/lib/dbConnect';
import QnAModel from '@/model/qa';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  const user = session?.user as User;
  
  try {
    const body = await request.json();
    const { anonVisitorId } = body;
    
    if (!anonVisitorId) {
      return Response.json({
        success: false,
        message: 'Visitor ID is required'
      }, { status: 400 });
    }
    
    // Get all QnAs where this visitor asked questions
    const qnas = await QnAModel.find({ 
      anonVisitorId: anonVisitorId,
      answerText: { $ne: null } // Only return answered questions
    })
      .sort({ answeredAt: -1 })
      .lean();
    
    // If user is logged in, they can see all their questions and answers
    if (session && user && user._id) {
      const userQnas = await QnAModel.find({ 
        ownerUserId: user._id,
        answerText: { $ne: null }
      })
        .sort({ answeredAt: -1 })
        .lean();
      
      return Response.json({
        success: true,
        data: userQnas,
        isSignedUp: true
      });
    }
    
    // For anonymous visitors, only return answers to their questions
    return Response.json({
      success: true,
      data: qnas,
      isSignedUp: false
    });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch answers'
    }, { status: 500 });
  }
}



