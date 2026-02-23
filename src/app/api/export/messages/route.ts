import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/user';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { User } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json'; // json, csv
    
    const dbUser = await UserModel.findById(user._id);
    
    if (!dbUser) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
    
    const messages = dbUser.messages || [];
    
    if (format === 'csv') {
      // Generate CSV
      const headers = 'Content,Date,Category,Priority,Status\n';
      const rows = messages.map(msg => {
        const content = `"${(msg.content || '').replace(/"/g, '""')}"`;
        const date = new Date(msg.createdAt).toISOString();
        const category = msg.category || 'general';
        const priority = msg.priority || 'medium';
        const status = msg.status || 'new';
        return `${content},${date},${category},${priority},${status}`;
      }).join('\n');
      
      const csv = headers + rows;
      
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="messages-${Date.now()}.csv"`
        }
      });
    } else {
      // Return JSON
      const jsonData = {
        username: dbUser.username,
        exportDate: new Date().toISOString(),
        totalMessages: messages.length,
        messages: messages.map(msg => ({
          content: msg.content,
          createdAt: msg.createdAt,
          category: msg.category || 'general',
          priority: msg.priority || 'medium',
          status: msg.status || 'new',
          isFlagged: msg.isFlagged || false
        }))
      };
      
      return new Response(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="messages-${Date.now()}.json"`
        }
      });
    }
  } catch (error) {
    console.error('Error exporting messages:', error);
    return Response.json({
      success: false,
      message: 'Failed to export messages'
    }, { status: 500 });
  }
}

