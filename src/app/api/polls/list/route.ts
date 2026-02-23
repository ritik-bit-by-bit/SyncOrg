import dbConnect from '@/lib/dbConnect';
import PollModel from '@/model/poll';
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
    const polls = await PollModel.find({
      ownerUserId: user._id
    }).sort({ createdAt: -1 });
    
    // Calculate stats for each poll
    const pollsWithStats = polls.map(poll => {
      const totalVotes = poll.votes.length;
      const results = poll.options.map(opt => ({
        optionId: opt.optionId,
        label: opt.label,
        votes: opt.votesCount,
        percentage: totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0
      }));
      
      const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false;
      
      return {
        ...poll.toObject(),
        totalVotes,
        results,
        isExpired,
        isActive: poll.isActive && !isExpired,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/poll/${poll.pollId}`
      };
    });
    
    return Response.json({
      success: true,
      data: pollsWithStats
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch polls'
    }, { status: 500 });
  }
}



