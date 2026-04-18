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