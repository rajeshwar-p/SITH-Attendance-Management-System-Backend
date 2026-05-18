import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {

  try {

    console.log("EMAIL USER:", process.env.EMAIL_USER);
    console.log("EMAIL PASS EXISTS:", !!process.env.EMAIL_PASS);

    const transporter = nodemailer.createTransport({

      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }

    });

    // VERIFY SMTP
    await transporter.verify();

    const info = await transporter.sendMail({

      from: `"SITH AMS" <${process.env.EMAIL_USER}>`,

      to,

      subject: "Password Reset OTP",

      html: `
      <div style="font-family:Arial;padding:30px;background:#f4f7fb;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">

          <h1 style="color:#4f46e5;text-align:center;">
            Attendance Management System
          </h1>

          <p>Hello,</p>

          <p>
            We received a request to reset your password.
          </p>

          <div style="
            text-align:center;
            padding:20px;
            background:#eef2ff;
            border-radius:10px;
            margin:20px 0;
          ">
            <span style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              color:#4f46e5;
            ">
              ${otp}
            </span>
          </div>

          <p>
            This OTP is valid for 5 minutes.
          </p>

          <p>
            Regards,<br/>
            SITH Computer Institute
          </p>

        </div>
      </div>
      `
    });

    console.log("EMAIL SENT:", info.messageId);

  } catch (error) {

    console.log("FULL EMAIL ERROR:", error);

    throw error;

  }

};