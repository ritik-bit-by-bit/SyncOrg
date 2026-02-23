import dbConnect from '@/lib/dbConnect';
import QnAModel from '@/model/qa';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

function generateQnAId(): string {
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
    const { qnaId, answerText } = body;
    
    if (!qnaId || !answerText) {
      return Response.json({
        success: false,
        message: 'Q&A ID and answer text are required'
      }, { status: 400 });
    }
    
    const qna = await QnAModel.findOne({ qnaId, ownerUserId: user._id });
    
    if (!qna) {
      return Response.json({
        success: false,
        message: 'Q&A not found'
      }, { status: 404 });
    }
    
    qna.answerText = answerText;
    qna.answeredAt = new Date();
    await qna.save();
    
    return Response.json({
      success: true,
      message: 'Answer saved successfully',
      data: qna.toObject()
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    return Response.json({
      success: false,
      message: 'Failed to save answer'
    }, { status: 500 });
  }
}

