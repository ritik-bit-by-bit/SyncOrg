import dbConnect from '@/lib/dbConnect';
import PollModel from '@/model/poll';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const { pollId, optionId, anonVisitorId } = body;
    
    if (!pollId || !optionId) {
      return Response.json({
        success: false,
        message: 'Poll ID and option ID are required'
      }, { status: 400 });
    }
    
    const poll = await PollModel.findOne({ pollId, isActive: true });
    
    if (!poll) {
      return Response.json({
        success: false,
        message: 'Poll not found'
      }, { status: 404 });
    }
    
    // Check if poll is expired
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return Response.json({
        success: false,
        message: 'Poll has expired'
      }, { status: 400 });
    }
    
    // Check if user already voted (if not allowing multiple)
    if (!poll.allowMultiple && anonVisitorId) {
      const hasVoted = poll.votes.some(vote => vote.anonVisitorId === anonVisitorId);
      if (hasVoted) {
        return Response.json({
          success: false,
          message: 'You have already voted'
        }, { status: 400 });
      }
    }
    
    // Check if option exists
    const option = poll.options.find(opt => opt.optionId === optionId);
    if (!option) {
      return Response.json({
        success: false,
        message: 'Invalid option'
      }, { status: 400 });
    }
    
    // Add vote
    poll.votes.push({
      anonVisitorId: anonVisitorId || 'anonymous',
      optionId,
      timestamp: new Date()
    });
    
    // Update vote count
    option.votesCount += 1;
    
    await poll.save();
    
    // Calculate results
    const totalVotes = poll.votes.length;
    const results = poll.options.map(opt => ({
      optionId: opt.optionId,
      label: opt.label,
      votes: opt.votesCount,
      percentage: totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0
    }));
    
    return Response.json({
      success: true,
      message: 'Vote recorded',
      data: {
        totalVotes,
        results
      }
    });
  } catch (error) {
    console.error('Error voting:', error);
    return Response.json({
      success: false,
      message: 'Failed to record vote'
    }, { status: 500 });
  }
}

