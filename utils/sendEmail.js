import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {

  try {

    const transporter = nodemailer.createTransport({

      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }

    });

    const info = await transporter.sendMail({

      from: `"SITH AMS" <${process.env.EMAIL_USER}>`,

      to,

      subject: "Password Reset OTP",

      html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>Password Reset OTP</h2>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing:5px;color:#4f46e5;">
          ${otp}
        </h1>

        <p>
          This OTP is valid for 5 minutes.
        </p>

        <br>

        <p>
          Regards,<br>
          SITH AMS
        </p>
      </div>
      `
    });

    console.log("EMAIL SENT:", info.messageId);

  } catch (error) {

    console.log("EMAIL ERROR:", error);

    throw error;

  }

};