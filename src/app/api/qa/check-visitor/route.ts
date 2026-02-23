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
  
  try {
    const body = await request.json();
    const { anonVisitorId } = body;
    
    // If user is logged in, they are signed up
    if (session && user && user._id) {
      return Response.json({
        success: true,
        isSignedUp: true,
        userId: user._id.toString()
      });
    }
    
    // Check if anonVisitorId matches any user's stored visitor ID
    // This is a simple check - in a real scenario, you might want to store
    // visitor IDs when users sign up
    if (anonVisitorId) {
      // Check if any user has this visitor ID in their messages
      const userWithVisitorId = await UserModel.findOne({
        'messages.anonVisitorId': anonVisitorId
      });
      
      if (userWithVisitorId) {
        // Check if there's a user account associated with this visitor ID
        // For now, we'll just check if they're logged in
        return Response.json({
          success: true,
          isSignedUp: false,
          message: 'Visitor ID found but not associated with a signed-up account'
        });
      }
    }
    
    return Response.json({
      success: true,
      isSignedUp: false
    });
  } catch (error) {
    console.error('Error checking visitor:', error);
    return Response.json({
      success: false,
      message: 'Failed to check visitor status'
    }, { status: 500 });
  }
}



