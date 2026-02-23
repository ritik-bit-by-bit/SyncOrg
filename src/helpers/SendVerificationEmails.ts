import nodemailer from 'nodemailer';
import { ApiResponse } from '@/types/ApiResponse';
import VerificationEmail from '../../emails/verificationEmails'; // This returns React component

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Get email credentials from environment variables
    const emailUser = process.env.EMAIL_USER ;
    const emailPass = process.env.EMAIL_PASSWORD ;

    if (!emailUser || !emailPass) {
      console.error('Email credentials not configured');
      return { success: false, message: 'Email service not configured.' };
    }

    // 1. Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass, // Gmail App Password
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('Email transporter verified successfully');

    // Import ReactDOMServer only on the server
    const ReactDOMServer = await import('react-dom/server');

    // 2. Render the React email component to HTML
    const htmlContent = ReactDOMServer.renderToStaticMarkup(
      VerificationEmail({ username, otp: verifyCode })
    );

    // 3. Send email
    const info = await transporter.sendMail({
      from: `"True Feedback" <${emailUser}>`,
      to: email,
      subject: 'True Feedback - Verification Code',
      html: htmlContent,
    });

    console.log('Message sent:', info.messageId);
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError: any) {
    console.error('Error sending verification email:', emailError);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send verification email.';
    if (emailError.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials. Make sure you are using a Gmail App Password, not your regular password.';
    } else if (emailError.code === 'ECONNECTION') {
      errorMessage = 'Failed to connect to email server.';
    } else if (emailError.response) {
      errorMessage = `Email server error: ${emailError.response}`;
    }
    
    return { success: false, message: errorMessage };
  }
}
