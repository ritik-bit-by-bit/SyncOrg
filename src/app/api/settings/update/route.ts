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
    const { defaultTheme, analyticsOptIn, emailNotifications } = body;
    
    const updateData: any = {};
    
    if (defaultTheme !== undefined) {
      updateData['settings.defaultTheme'] = defaultTheme;
    }
    if (analyticsOptIn !== undefined) {
      updateData['settings.analyticsOptIn'] = analyticsOptIn;
    }
    if (emailNotifications !== undefined) {
      updateData['settings.emailNotifications'] = emailNotifications;
    }
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: updateData },
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
      message: 'Settings updated successfully',
      data: {
        settings: updatedUser.settings || {
          defaultTheme: 'default',
          analyticsOptIn: true,
          emailNotifications: false
        }
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return Response.json({
      success: false,
      message: 'Failed to update settings'
    }, { status: 500 });
  }
}

