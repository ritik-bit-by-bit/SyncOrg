import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/user';
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
    const dbUser = await UserModel.findById(user._id);
    
    if (!dbUser) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
    
    return Response.json({
      success: true,
      data: {
        settings: dbUser.settings || {
          defaultTheme: 'default',
          analyticsOptIn: true,
          emailNotifications: false
        },
        qaModeEnabled: dbUser.qaModeEnabled || false
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json({
      success: false,
      message: 'Failed to fetch settings'
    }, { status: 500 });
  }
}

