const nodemailer = require('nodemailer');

const createTransporter = async () => {
  // If no SMTP settings are in .env, use a testing account from Ethereal
  if (!process.env.SMTP_USER) {
    console.log('No SMTP_USER found in .env. Creating Ethereal testing account...');
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  // Use real credentials if provided
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEscalationEmail = async ({ to, subject, htmlContent }) => {
  try {
    const transporter = await createTransporter();
    
    let info = await transporter.sendMail({
      from: '"CSARMS Automated System" <no-reply@csarms.edu>',
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);
    
    // If using Ethereal, log the preview URL so developers can see the email locally
    if (!process.env.SMTP_USER) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEscalationEmail };
