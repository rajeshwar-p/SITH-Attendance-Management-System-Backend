import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {

  try {

    const transporter = nodemailer.createTransport({

      host: "smtp.gmail.com",

      port: 587,

      secure: false,

      requireTLS: true,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000

    });

    const info = await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to,

      subject: "Password Reset OTP",

      html: `
        <h2>Your OTP is: ${otp}</h2>
      `
    });

    console.log(info);

  } catch (error) {

    console.log("EMAIL ERROR:", error);

    throw error;

  }

};