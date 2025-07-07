const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendOTP(email, otp, userName = 'User') {
    try {
      // Development mode: log OTP to console instead of sending email
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
        console.log(`\n📧 OTP for ${email}: ${otp}\n`);
        return { success: true, messageId: 'console-log' };
      }

      const mailOptions = {
        from: `"HiveDesk" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your HiveDesk Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">HiveDesk</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Verification Code</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello ${userName}!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for using HiveDesk. Please use the verification code below to complete your authentication:
              </p>
              
              <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <h1 style="margin: 0; font-size: 32px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                <strong>Important:</strong>
              </p>
              <ul style="color: #666; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0; padding-left: 20px;">
                <li>This code will expire in 5 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This is an automated message from HiveDesk. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
          HiveDesk Verification Code
          
          Hello ${userName}!
          
          Your verification code is: ${otp}
          
          This code will expire in 5 minutes.
          Do not share this code with anyone.
          
          If you didn't request this code, please ignore this email.
          
          Best regards,
          The HiveDesk Team
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // If SMTP fails, fall back to console logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n📧 OTP for ${email}: ${otp}\n`);
        console.log('⚠️  SMTP failed, but OTP logged to console for development\n');
        return { success: true, messageId: 'console-log-fallback' };
      }
      
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email, userName) {
    try {
      const mailOptions = {
        from: `"HiveDesk" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to HiveDesk!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HiveDesk!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello ${userName}!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Welcome to HiveDesk! Your account has been successfully created and verified.
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You can now access your dashboard and start using all the features of HiveDesk.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CORS_ORIGIN}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Go to Dashboard
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  Thank you for choosing HiveDesk!
                </p>
              </div>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService(); 