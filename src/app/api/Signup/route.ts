import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/SendVerificationEmails";
export async function POST(request: Request) {
    try {
        console.log("Signup API called");
        await dbConnect();
        const { username, email, password } = await request.json();
        console.log("Received data:", { username, email, password: password ? "***" : "undefined" });
        console.log("Checking for existing verified user with username:", username);
        const existingUserVerfiedByusername = await UserModel.findOne({
            username,
            isVerified: true,
        })
        if (existingUserVerfiedByusername) {
            console.log("Username already taken by verified user");
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {
                status: 400,
            })
        }
        console.log("Checking for existing user with email:", email);
        const existingUserVerfiedByEmail = await UserModel.findOne({
            email
        })
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated verification code:", verifyCode);

        if (existingUserVerfiedByEmail) {
            if (existingUserVerfiedByEmail.isVerified) {
                console.log("Email already taken by verified user");
                return Response.json({
                    success: false,
                    message: "Email is already taken"
                }, {
                    status: 400
                })
            }
            else {
                console.log("Updating existing unverified user");
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserVerfiedByEmail.password = hashedPassword;
                existingUserVerfiedByEmail.verifyCode = verifyCode;
                existingUserVerfiedByEmail.verifyCodeExpiry = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
                await existingUserVerfiedByEmail.save();
                console.log("Existing user updated successfully");
            }
        }
        else {
            console.log("Creating new user");
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1);

            const newUser = new UserModel({
                username: username,
                email: email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            console.log("Saving new user to database...");
            await newUser.save();
            console.log("New user saved successfully with ID:", newUser._id);
        }
        console.log("Sending verification email...");
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        console.log("Email response:", emailResponse);
        if (!emailResponse.success) {
            console.log("Email sending failed:", emailResponse.message);
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {
                status: 500
            })
        }
        console.log("Signup completed successfully");
        return Response.json({
            success: true,
            message: "User registered successfully"
        }, {
            status: 201
        })
    }
    catch (error) {
        console.error('Error registering new user:', error);
        return Response.json({
            success: false,
            message: error instanceof Error ? error.message : 'Error registering new user'
        }, {
            status: 500
        });
    }
}