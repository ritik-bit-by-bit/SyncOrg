import dbConnect from '@/lib/dbConnect';
import LinkModel from '@/model/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from 'next-auth';

export async function GET(request: Request) {
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
    const links = await LinkModel.find({
      ownerUserId: user._id
    }).sort({ createdAt: -1 });
    
    // Check which links are expired
    const now = new Date();
    const linksWithStatus = links.map(link => {
      const isExpired = link.expiresAt ? new Date(link.expiresAt) < now : false;
      const isMaxReached = link.maxMessages ? link.messagesCount >= link.maxMessages : false;
      
      return {
        ...link.toObject(),
        isExpired,
        isMaxReached,
        isActive: link.isActive && !isExpired && !isMaxReached
      };
    });
    
    return Response.json({
      success: true,
      data: linksWithStatus
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch links'
    }, { status: 500 });
  }
}

