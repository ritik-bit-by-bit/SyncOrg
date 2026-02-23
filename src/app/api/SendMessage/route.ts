import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import { MessageSchema } from "@/Schemas/messageSchema";
import {Message} from "@/model/user"
import QnAModel from "@/model/qa";
import { NextRequest } from "next/server";
import crypto from "crypto";

// Check moderation
async function checkModeration(content: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/moderation/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Moderation check error:', error);
  }
  
  // Default: safe
  return { safe: true, toxicity: 0.1, categories: [] };
}

function generateQnAId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export async function POST(request:NextRequest){
   await dbConnect();
   const {username,content, anonVisitorId, deviceInfo, linkId} = await request.json();
   try {
    const user =await UserModel.findOne({username});
    if(!user){
        return Response.json({
            success:false,
            message:"user not found"
        },{
            status:404
        
        })
        
      } 
      else{
        if(!user.isAcceptingMessage){
            return Response.json({
                success:false,
                message:"user is not accepting messages"
            },{
                status:400
            })
        }
        else{
            // Check moderation
            const moderationResult = await checkModeration(content);
            
            // Block toxic messages
            if (!moderationResult.safe || moderationResult.toxicity > 0.7) {
              return Response.json({
                success: false,
                message: "Message was flagged as inappropriate",
                flagged: true
              }, {
                status: 400
              });
            }
            
            const newMessage: any = {
                content: content,
                createdAt: new Date(),
                isFlagged: moderationResult.toxicity > 0.5,
                moderationResult: {
                  toxicity: moderationResult.toxicity,
                  categories: moderationResult.categories || []
                },
                status: 'new',
                priority: 'medium',
                category: 'general',
                anonVisitorId: anonVisitorId || undefined,
                deviceInfo: deviceInfo || undefined
            }
            user.messages.push(newMessage as Message);
            await user.save();
            
            // If QA mode is enabled, create a QnA entry
            if (user.qaModeEnabled) {
              try {
                const savedMessage = user.messages[user.messages.length - 1];
                const qnaId = generateQnAId();
                
                const qna = new QnAModel({
                  qnaId: qnaId,
                  linkId: linkId || undefined,
                  ownerUserId: user._id,
                  questionId: savedMessage._id,
                  questionText: content,
                  anonVisitorId: anonVisitorId || undefined,
                  createdAt: new Date(),
                  isPublic: true
                });
                
                await qna.save();
              } catch (error) {
                console.error('Error creating QnA entry:', error);
                // Don't fail the message send if QnA creation fails
              }
            }
            
            // Log analytics (only if user has analytics enabled)
            try {
              const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
              await fetch(`${baseUrl}/api/analytics/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username,
                  eventType: 'submit',
                  page: 'message-send',
                  anonVisitorId
                })
              });
            } catch (error) {
              console.error('Analytics logging error:', error);
            }
            
            // Send email notification if enabled
            if (user.settings && user.settings.emailNotifications && user.email) {
              try {
                const nodemailer = (await import('nodemailer')).default;
                const transporter = nodemailer.createTransport({
                  host: 'smtp.gmail.com',
                  port: 587,
                  secure: false,
                  auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                  },
                  tls: {
                    rejectUnauthorized: false
                  }
                });
                
                await transporter.sendMail({
                  from: `"True Feedback" <${process.env.EMAIL_USER}>`,
                  to: user.email,
                  subject: 'New Anonymous Message Received',
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #6366f1;">You received a new anonymous message!</h2>
                      <p style="color: #333;">Someone sent you a message through your True Feedback link.</p>
                      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #666; font-style: italic;">"${content.substring(0, 200)}${content.length > 200 ? '...' : ''}"</p>
                      </div>
                      <p style="color: #666;">View all your messages at: <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard">Dashboard</a></p>
                    </div>
                  `
                });
              } catch (error) {
                console.error('Email notification error:', error);
                // Don't fail the message send if email fails
              }
            }
            
            return Response.json({
                success:true,
                message:"message sent"
            },{
                status:200
            })  
        }
      }
    }catch (error) {
    console.log(error);
    return Response.json({
        success:false,
        message:"something went wrong"
    },{
        status:500
    })
   }
}
