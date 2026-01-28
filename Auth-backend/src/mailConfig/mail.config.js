import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: 2525,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Mail server connection failed:", error);
  } else {
    console.log("Mail server is ready to send emails");
  }
});

export default transporter;
