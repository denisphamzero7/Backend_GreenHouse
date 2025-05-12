const asyncHandler = require('express-async-handler');
const nodemailer = require("nodemailer");

// Hàm gửi mail
const sendMail = asyncHandler(async ({ email, subject, html }) => {
  console.log('email:', email);
  console.log('html:', html);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, 
    },
    
  },);
  

  const info = await transporter.sendMail({
    from: '"Greenhouses" <no-reply@greenhouses.com>', // Sender address
    to: email, 
    subject: subject || "Account Verification", // Subject line
    html: html, // HTML content of email
  });
  console.log('Email sent:', info);
  return info;
});

// Hàm gửi OTP
const sendOtpEmail = asyncHandler(async (email, otp) => {

  const htmlContent = `
    <div>
      <h2>Hello, ${email}</h2>
      <p>Your OTP for account verification is:</p>
      <h3 style="color: #4CAF50;">${otp}</h3>
      <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      <p>Thank you,<br>Greenhouses Team</p>
    </div>
  `;
  const info = await sendMail({
    email,
    subject: "Your OTP Code for Verification",
    html: htmlContent,
  });
  return info;
});

module.exports = { sendMail, sendOtpEmail };
