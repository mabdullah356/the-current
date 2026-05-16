import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }: { to: string; subject: string; text: string }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS,
        },
    });
    await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to,
        subject,
        text,
    });
};


export const sendVerificationEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

 const html = `
<div style="font-family: Arial, sans-serif; background:#0f172a; padding:20px; color:#fff;">
  <div style="max-width:500px; margin:auto; background:#020617; padding:24px; border-radius:12px;">
    
    <h1 style="text-align:center; margin-bottom:10px; font-size:20px; font-weight:bold;">
      PixelFeed
    </h1>

    <h2 style="text-align:center; margin-bottom:20px;">
      Verify Your Account
    </h2>

    <p style="font-size:14px; color:#cbd5f5; text-align:center;">
      Use the OTP below to complete your verification. This code will expire shortly.
    </p>

    <div style="text-align:center; margin:30px 0;">
      <span style="font-size:28px; letter-spacing:6px; font-weight:bold; background:#18181b; padding:12px 20px; border-radius:8px;">
        ${otp}
      </span>
    </div>

    <p style="font-size:12px; color:#94a3b8; text-align:center;">
      If you didn’t request this, you can safely ignore this email.
    </p>

    <p style="font-size:11px; color:#64748b; text-align:center; margin-top:20px;">
      © ${new Date().getFullYear()} PixelFeed. All rights reserved.
    </p>

  </div>
</div>
`;
  await transporter.sendMail({
    from: `"App Support" <${process.env.USER_EMAIL}>`,
    to,
    subject: "Verify your account",
    html,
  });
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

  const html = `
<div style="font-family: Arial, sans-serif; background:#0f172a; padding:20px; color:#fff;">
  <div style="max-width:500px; margin:auto; background:#020617; padding:24px; border-radius:12px;">
    <h1 style="text-align:center; margin-bottom:10px; font-size:20px; font-weight:bold;">
      PixelFeed
    </h1>
    <h2 style="text-align:center; margin-bottom:20px;">
      Reset Your Password
    </h2>
    <p style="font-size:14px; color:#cbd5f5; text-align:center;">
      Click the button below to reset your password. This link will expire in 15 minutes.
    </p>
    <div style="text-align:center; margin:30px 0;">
      <a href="${resetLink}" style="background:#2563eb; color:#fff; padding:12px 32px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:16px; display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="font-size:12px; color:#94a3b8; text-align:center;">
      If you didn't request this, you can safely ignore this email.
    </p>
    <p style="font-size:11px; color:#64748b; text-align:center; margin-top:20px;">
      © ${new Date().getFullYear()} PixelFeed. All rights reserved.
    </p>
  </div>
</div>`;

  await transporter.sendMail({
    from: `"App Support" <${process.env.USER_EMAIL}>`,
    to,
    subject: "Reset your password",
    html,
  });
};