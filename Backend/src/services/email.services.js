import "dotenv/config";
import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth:{
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
})
export async function verifyEmailConnection() {
  await transporter.verify();
  console.log("SMTP connection verified");
}
export async function sendEmail({to, subject, text}) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text
  })
}