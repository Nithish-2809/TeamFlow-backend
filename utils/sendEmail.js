require("dotenv").config()
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : process.env.USER_EMAIL,
        pass : process.env.USER_PASSWORD
    }
})


const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"TeamFlow" <${process.env.USER_EMAIL}>`,
      to,
      subject,
      html
    })
  } catch (err) {
    console.error("Email send failed:", err)
    throw new Error("Email service error")
  }
}

module.exports = sendEmail