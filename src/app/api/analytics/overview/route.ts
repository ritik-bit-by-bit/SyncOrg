import dbConnect from '@/lib/dbConnect';
import AnalyticsModel from '@/model/analytics';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from 'next-auth';

export async function GET(request: Request) {
  await dbConnect();
  
  const session = await getServerSession(authOptions);
  const user = session?.user as User;
  
  if (!session || !user) {
    return Response.json({
      success: false,
      message: 'Unauthorized'
    }, { status: 401 });
  }
  
  try {
    const username = user.username;
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '7d'; // 7d, 30d, 90d, all
    
    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    // Get analytics data
    const analytics = await AnalyticsModel.find({
      username,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });
    
    // Calculate stats
    const totalClicks = analytics.filter(a => a.eventType === 'visit').length;
    const totalMessages = analytics.filter(a => a.eventType === 'submit').length;
    const totalVotes = analytics.filter(a => a.eventType === 'vote').length;
    
    // Unique visitors
    const uniqueVisitors = new Set(analytics.map(a => a.anonVisitorId).filter(Boolean)).size;
    
    // Device breakdown
    const deviceBreakdown = analytics.reduce((acc, a) => {
      acc[a.deviceType] = (acc[a.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Country breakdown
    const countryBreakdown = analytics.reduce((acc, a) => {
      if (a.country) {
        acc[a.country] = (acc[a.country] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Time series data (last 7 days)
    const timeSeries = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayData = analytics.filter(a => {
        const aDate = new Date(a.timestamp);
        return aDate >= date && aDate < nextDate;
      });
      
      timeSeries.push({
        date: date.toISOString().split('T')[0],
        visits: dayData.filter(a => a.eventType === 'visit').length,
        messages: dayData.filter(a => a.eventType === 'submit').length,
        votes: dayData.filter(a => a.eventType === 'vote').length
      });
    }
    
    return Response.json({
      success: true,
      data: {
        totalClicks,
        totalMessages,
        totalVotes,
        uniqueVisitors,
        deviceBreakdown,
        countryBreakdown,
        timeSeries
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch analytics'
    }, { status: 500 });
  }
}

