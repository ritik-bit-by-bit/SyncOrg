import dbConnect from '@/lib/dbConnect';
import QnAModel from '@/model/qa';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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
    const qnas = await QnAModel.find({ ownerUserId: user._id })
      .sort({ createdAt: -1 })
      .lean();
    
    return Response.json({
      success: true,
      data: qnas
    });
  } catch (error) {
    console.error('Error fetching Q&A list:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch Q&A list'
    }, { status: 500 });
  }
}



