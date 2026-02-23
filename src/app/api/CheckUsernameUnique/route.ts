import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import UserModel from "@/model/user";
import { usernameValidation } from "@/Schemas/signup";

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET (request:Request) {
    await dbConnect();
    try {
        const {searchParams} = new URL(request.url);
        const queryParam ={username: searchParams.get('username')}
        const result = usernameQuerySchema.safeParse(queryParam)
        if(!result.success){
            return Response.json({success:false,message:'Invalid username'},{status:400})
        }
        const {username} = result.data;
        const existingUser = await UserModel.findOne({username,isVerified:true})
        console.log(existingUser);
        if(existingUser){
            return Response.json({success:false,message:'Username is not unique'},{status:400})
        }
        return Response.json({success:true,message:'Username is unique'},{status:200})
    }
    catch(error){
        console.log(error);
        return Response.json({success:false,message:'Internal server error'},{status:500})
    }
}
