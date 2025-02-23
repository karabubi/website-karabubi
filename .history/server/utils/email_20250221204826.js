// // server/utils/email.js
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



const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendConfirmationEmail = (email, username, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Registration Confirmation",
    text: `Your account has been successfully created.\nUsername: ${username}\nPassword: ${password}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending email:", error);
    else console.log("Email sent:", info.response);
  });
};

module.exports = sendConfirmationEmail;