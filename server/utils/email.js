
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// const sendConfirmationEmail = (email, username, password) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Registration Confirmation",
//     text: `Your account has been successfully created.\nUsername: ${username}\nPassword: ${password}`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) console.error("Error sending email:", error);
//     else console.log("Email sent:", info.response);
//   });
// };

// module.exports = sendConfirmationEmail;


// Users/salehalkarabubi/works/project/website-karabubi/server/utils/email.js


// const nodemailer = require('nodemailer');

// // Configure Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   secure: true,
//   tls: {
//     rejectUnauthorized: false,
//   },
//   connectionTimeout: 10000,
//   socketTimeout: 10000,
// });

// // Send confirmation email to the user
// const sendConfirmationEmail = async (email, username, password) => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Registration Confirmation',
//       text: `Your account has been successfully created.\nUsername: ${username}\nPassword: ${password}`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Confirmation email sent to:', email);
//     return true;
//   } catch (error) {
//     console.error('Error sending confirmation email:', error);
//     return false;
//   }
// };

// // Send verification email to the admin
// const sendVerificationEmailToAdmin = async (userEmail) => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: process.env.EMAIL_USER,
//       subject: 'New User Email Verification',
//       text: `A new user has registered with the email: ${userEmail}. Please verify this email address.`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Verification email sent to admin.');
//     return true;
//   } catch (error) {
//     console.error('Error sending verification email to admin:', error);
//     return false;
//   }
// };

// module.exports = { sendConfirmationEmail, sendVerificationEmailToAdmin };



// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   connectionTimeout: 10000,
//   socketTimeout: 10000,
// });

// const sendConfirmationEmail = async (email, username, password) => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Registration Confirmation',
//       text: `Your account has been successfully created.\nUsername: ${username}\nPassword: ${password}`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Confirmation email sent to:', email);
//     return true;
//   } catch (error) {
//     console.error('Error sending confirmation email:', error);
//     return false;
//   }
// };

// const sendVerificationEmailToAdmin = async (userEmail) => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: process.env.EMAIL_USER,
//       subject: 'New User Email Verification',
//       text: `A new user has registered with the email: ${userEmail}. Please verify this email address.`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log('Verification email sent to admin.');
//     return true;
//   } catch (error) {
//     console.error('Error sending verification email to admin:', error);
//     return false;
//   }
// };

// module.exports = { sendConfirmationEmail, sendVerificationEmailToAdmin };


//------------

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: true,
  },
  connectionTimeout: 60000,
  socketTimeout: 60000,
  debug: true,
});

const sendConfirmationEmail = async (email, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Bestätigung deiner Registrierung',
      text: `Hallo ${username},\n\nDein Konto wurde erfolgreich erstellt.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Bestätigungs-E-Mail gesendet an:', email);
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Senden der Bestätigungs-E-Mail:', error);
    return false;
  }
};

const sendVerificationEmailToAdmin = async (userEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Neuer Benutzer registriert',
      text: `Ein neuer Benutzer hat sich mit der E-Mail ${userEmail} registriert.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verifizierungs-E-Mail an Admin gesendet.');
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Senden der Verifizierungs-E-Mail:', error);
    return false;
  }
};

// ✅ Stelle sicher, dass du die Funktionen richtig exportierst
module.exports = { sendConfirmationEmail, sendVerificationEmailToAdmin };
