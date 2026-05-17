import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rajeshwarprajapati303@gmail.com",
      pass: "emrh fzpo oyoi mobh"
    }
  });

  await transporter.sendMail({
    from: "AMS",
    to,
    subject: "Password Reset OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`
  });
};