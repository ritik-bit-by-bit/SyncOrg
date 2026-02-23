import dbConnect from "@/lib/dbConnect";
import UserModel from '@/model/user'

export async function POST(request: Request) {
    console.log("VerifyCode route called");
    
    try {
        await dbConnect();
        const { username, code } = await request.json();
        const decodedUsername = decodeURIComponent(username);
        
        console.log("Verifying code for user:", decodedUsername, "with code:", code);
        
        const user = await UserModel.findOne({ username: decodedUsername });
        
        if (!user) {
            console.log("User not found:", decodedUsername);
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            });
        }
        
        console.log("User found, checking verification code");
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        
        console.log("Code validation:", { isCodeValid, isCodeNotExpired });
        
        if (!isCodeValid || !isCodeNotExpired) {
            console.log("Invalid or expired code");
            return Response.json({
                success: false,
                message: "Invalid code or code has expired"
            }, {
                status: 400
            });
        }
        
        // Code is valid, verify the user
        console.log("Code is valid, verifying user");
        user.isVerified = true;
        await user.save();
        
        console.log("User verified successfully");
        return Response.json({
            success: true,
            message: "Email verified successfully"
        }, {
            status: 200
        });
        
    } catch (error) {
        console.error("Error in VerifyCode route:", error);
        return Response.json({
            success: false,
            message: "Error verifying code"
        }, {
            status: 500
        });
    }
}

