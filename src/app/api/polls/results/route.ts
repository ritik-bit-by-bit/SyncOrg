import dbConnect from '@/lib/dbConnect';
import PollModel from '@/model/poll';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    const url = new URL(request.url);
    const pollId = url.searchParams.get('pollId');
    
    if (!pollId) {
      return Response.json({
        success: false,
        message: 'Poll ID is required'
      }, { status: 400 });
    }
    
    const poll = await PollModel.findOne({ pollId });
    
    if (!poll) {
      return Response.json({
        success: false,
        message: 'Poll not found'
      }, { status: 404 });
    }
    
    const totalVotes = poll.votes.length;
    const results = poll.options.map(opt => ({
      optionId: opt.optionId,
      label: opt.label,
      votes: opt.votesCount,
      percentage: totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0
    }));
    
    return Response.json({
      success: true,
      data: {
        question: poll.question,
        totalVotes,
        results,
        isActive: poll.isActive && (!poll.expiresAt || new Date(poll.expiresAt) > new Date()),
        expiresAt: poll.expiresAt
      }
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch poll results'
    }, { status: 500 });
  }
}

