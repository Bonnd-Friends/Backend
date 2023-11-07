
const nodemailer = require('nodemailer');
require('dotenv').config()

// Configure the nodemailer transporter
function configureTransporter(emailAccount) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailAccount.email,
      pass: emailAccount.password,
    },
  });
}

const transporter = configureTransporter({
  email: process.env.NODEMAILER_EMAIL,
  password: process.env.NODEMAILER_PASSWORD,
});

// Function to send emails
function sendEmail(email, data) {
  console.log(email);
  if (email == undefined) {
    console.log("Failed")
    return
  }

  const mailOptions = {
    
    to: email,
    subject: 'RCOEM-Friends] Please verify your device',
    html: `
    Hey ${data.username},<br/>
    The OTP is ${data.otp}
    `,
  };



  transporter.sendMail(mailOptions, (error, info) => {

    if (error) {
      console.log(`Error sending email to ${email}:`, error);
    } else {
      console.log(`Email sent to ${email}:`, info.response);
    }

  });
}




//sendEmail('khobragadesm_1@rknec.edu', transporter);
//sendEmail('bagadiabm@rknec.edu',transporter)
//sendEmail('munotkg@rknec.edu', transporter);

//sendEmail('patilrp@rknec.edu', data)

module.exports = {sendEmail}