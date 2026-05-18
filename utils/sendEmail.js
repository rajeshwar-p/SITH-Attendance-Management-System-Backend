import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"SITH | Attendance Management System (AMS)" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset OTP",
    html: `
    <div style="font-family: Arial, sans-serif; background:#f4f7fb; padding:40px;">
      <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 5px 20px rgba(0,0,0,0.08);">

        <div style="background:#4f46e5; padding:25px; text-align:center;">
          <h1 style="color:white; margin:0;">Attendance Management System</h1>
          <p style="color:#dbeafe; margin-top:8px;">
            Secure Password Verification
          </p>
        </div>

        <div style="padding:35px;">
          <h2 style="color:#111827;">Hello,</h2>

          <p style="color:#374151; line-height:1.7;">
            We received a request to reset the password for your
            <strong>Attendance Management System (AMS)</strong> account.
          </p>

          <p style="color:#374151;">
            Please use the following One-Time Password (OTP):
          </p>

          <div style="
            background:#eef2ff;
            padding:20px;
            text-align:center;
            border-radius:10px;
            margin:30px 0;
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

          <p style="color:#374151;">
            This OTP is valid for the next <strong>5 minutes</strong>.
          </p>

          <div style="
            background:#f9fafb;
            padding:18px;
            border-radius:10px;
            margin-top:25px;
          ">
            <p style="margin:0; color:#6b7280; font-size:14px;">
              🔒 Do not share this OTP with anyone.<br>
              🔒 Our team will never ask for your OTP or password.<br>
              🔒 If you did not request this, please ignore this email.
            </p>
          </div>

          <p style="margin-top:35px; color:#374151;">
            Thank you for using AMS.
          </p>

          <p style="color:#111827; font-weight:600;">
            Warm Regards,<br>
            SITH Computer Institute
          </p>
        </div>

        <div style="
          background:#f3f4f6;
          padding:18px;
          text-align:center;
          font-size:13px;
          color:#6b7280;
        ">
          This is an automated system-generated email. Please do not reply.
        </div>

      </div>
    </div>
    `
  });
};