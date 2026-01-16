const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"TeamFlow" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error("Email send failed:", err)
    throw new Error("Email service error")
  }
}

module.exports = sendEmail
