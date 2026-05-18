import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {

  try {

    console.log("EMAIL USER:", process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({

      host: "74.125.24.108", // ✅ Gmail IPv4 SMTP

      port: 587,

      secure: false,

      requireTLS: true,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },

      tls: {
        rejectUnauthorized: false
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

          <br/>

          <p>
            Regards,<br/>
            SITH Computer Institute
          </p>
        </div>
      `
    });

    console.log("EMAIL SENT:", info.messageId);

  } catch (error) {

    console.log("FULL EMAIL ERROR:", error);

    throw error;
  }
};