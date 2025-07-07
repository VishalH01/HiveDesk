require('dotenv').config();
const nodemailer = require('nodemailer');

async function testBrevoConnection() {
  console.log('Testing Brevo SMTP connection...\n');
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"HiveDesk Test" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
      to: process.env.SENDER_EMAIL, // Send to yourself
      subject: 'Brevo SMTP Test',
      text: 'If you receive this email, your Brevo SMTP is working correctly!',
      html: '<h1>Brevo SMTP Test</h1><p>If you receive this email, your Brevo SMTP is working correctly!</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ SMTP connection failed:');
    console.error(error.message);
    
    if (error.responseCode === 502) {
      console.log('\n💡 This means your Brevo account is not activated yet.');
      console.log('Contact: contact@sendinblue.com');
    }
  }
}

testBrevoConnection(); 