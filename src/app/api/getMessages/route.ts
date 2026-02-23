import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/user';
import mongoose, { Types } from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User | null = session?.user;  // Explicitly handle the possibility of null

  if (!session || !_user || !_user._id) {
    return Response.json(
      { success: false, message: 'Not authenticated or user ID not found' },
      { status: 401 }
    );
  }

  // Ensure user._id is converted correctly
  let userId: mongoose.Types.ObjectId;
  if (typeof _user._id === 'string') {
    userId = new mongoose.Types.ObjectId(_user._id);  // Convert string to ObjectId
  } else {
    userId = _user._id;  // It's already an ObjectId
  }

  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } }, // Use the correctly formatted ObjectId
      { $unwind: '$messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: {
          _id: '$_id', // Group by the user's _id
          messages: { $push: '$messages' } // Push the messages into an array
      }},
    ]).exec();

    console.log("User aggregation result:", user);

    if (!user || user.length === 0) {
      return Response.json(
        { message: 'User  found', success: true },
        { status: 200 }
      );
    }

    return Response.json(
      { messages: user[0].messages },
      { status: 200 }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
