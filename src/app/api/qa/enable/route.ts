import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/user';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';

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
    const { enabled } = body;
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { qaModeEnabled: enabled },
      { new: true }
    );
    
    if (!updatedUser) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
    
    return Response.json({
      success: true,
      message: `Q&A mode ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        qaModeEnabled: updatedUser.qaModeEnabled
      }
    });
  } catch (error) {
    console.error('Error updating Q&A mode:', error);
    return Response.json({
      success: false,
      message: 'Failed to update Q&A mode'
    }, { status: 500 });
  }
}

