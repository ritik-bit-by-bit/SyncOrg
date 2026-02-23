import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import { User } from "next-auth";

export async function POST(request: Request) {
   await dbConnect();

 const session=await  getServerSession(authOptions);
 const user =session?.user;
 if(!session || !session.user){
    return Response.json({
        success:false,
        message:"Unauthorized"
    },{
  status:401
    })
 }
    const userId=user?._id
    const {acceptMessages}=await request.json();
    try {
     const updatedUser= await UserModel.findByIdAndUpdate(userId,{isAcceptingMessage: acceptMessages},{new:true});
      if(!updatedUser){
        return Response.json({
            success:false,
            message:"User not found"
        },{
      status:404
        })
    
      }
      else{
        return Response.json({
            success:true,
            message:"Message Accepted and Status updated successfully",
            data:updatedUser
        },{
      status:200
        })
      }
    } catch (error) {
        console.log("failed to update user Status to accept message");
        return Response.json({
            success:false,
            message:"Unauthorized",
        },{
      status:401
        })
    }
    
}

export async function GET(request: Request) {
dbConnect();

 const session=await  getServerSession(authOptions);
 const user =session?.user;
 if(!session || !session.user){
    return Response.json({
        success:false,
        message:"Unauthorized"
    },{
  status:401
    })
 }
 const userId=user?._id;
 try {
    const Founduser=await UserModel.findById(userId);
    if(!Founduser){
        return Response.json({
            success:false,
            message:"User Not Found"
        },{
      status:401
        })
     }
     else{
        return Response.json({
            success:true,
            message:"User Found",
            isAcceptingMessages:Founduser.isAcceptingMessage,
            data:user
        },{
      status:200
        })
     }
 }
 catch (error) {
    return Response.json({
        success:false,
        message:"Error in getting message accepting status"
    },{
  status:401
    })
 }
}