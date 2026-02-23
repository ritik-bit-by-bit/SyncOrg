import dbConnect from '@/lib/dbConnect';
import AnalyticsModel from '@/model/analytics';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { NextRequest } from 'next/server';

function getDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

async function getCountryFromIP(ip: string): Promise<string | undefined> {
  try {
    // Using a free IP geolocation service
    const response = await fetch(`https://ipapi.co/${ip}/country/`);
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error('Error fetching country:', error);
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const { linkId, username, eventType, page, anonVisitorId } = body;
    
    // Check if user has analytics enabled
    if (username) {
      const UserModel = (await import('@/model/user')).default;
      const user = await UserModel.findOne({ username });
      if (user && user.settings && user.settings.analyticsOptIn === false) {
        // User has opted out of analytics
        return Response.json({
          success: true,
          message: 'Analytics disabled by user',
          skipped: true
        });
      }
    }
    
    // Get IP from request
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = getDeviceType(userAgent);
    
    // Get country (async, don't block)
    const country = await getCountryFromIP(ip.split(',')[0].trim());
    
    const analytics = new AnalyticsModel({
      linkId,
      username,
      timestamp: new Date(),
      anonVisitorId,
      ip: ip.split(',')[0].trim(),
      country,
      deviceType,
      eventType,
      page
    });
    
    await analytics.save();
    
    return Response.json({
      success: true,
      message: 'Analytics event logged'
    });
  } catch (error) {
    console.error('Error logging analytics:', error);
    return Response.json({
      success: false,
      message: 'Failed to log analytics'
    }, { status: 500 });
  }
}

