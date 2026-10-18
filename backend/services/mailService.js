import nodemailer from "nodemailer";
import { AppError } from "../middleware/errors.js";

let transporter;

export function mailIsConfigured() {
  const port = Number(process.env.SMTP_PORT || 587);
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    Number.isInteger(port) &&
    port > 0 &&
    port <= 65535,
  );
}

export function requireMailConfiguration() {
  if (!mailIsConfigured()) {
    throw new AppError(
      503,
      "Password recovery is not available yet. Please contact the administrator.",
    );
  }
}

export async function sendPasswordCode(email, code) {
  requireMailConfiguration();
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }
  const result = await transporter.sendMail({
    from: process.env.SMTP_FROM || {
      name: "LearnHub",
      address: process.env.SMTP_USER,
    },
    to: { address: email },
    subject: "Your LearnHub password reset code",
    text:
      "Your LearnHub verification code is: " +
      code +
      "\n\nThis code expires in 10 minutes and can be used once." +
      "\nIf you did not request a password reset, ignore this email. Your password has not changed." +
      "\nNever share this code with anyone.",
    html: `<div style="font-family:Arial,sans-serif;background:#f3f4f6;padding:32px;color:#172033"><div style="max-width:480px;margin:auto;background:#ffffff;border:1px solid #d1d5db;border-radius:16px;padding:32px"><p style="font-size:13px;letter-spacing:2px;font-weight:bold">LEARNHUB</p><h1 style="font-size:26px">Reset your password</h1><p>Enter this verification code on the password recovery page.</p><div style="background:#172033;color:#ffffff;padding:20px;font-size:32px;letter-spacing:8px;text-align:center;border-radius:10px">${code}</div><p>This code expires in <strong>10 minutes</strong> and can be used once.</p><p style="color:#4b5563;font-size:13px">If you did not request this, ignore this email. Your password has not changed. Never share this code with anyone.</p></div></div>`,
  });
  if (!result.accepted?.length) {
    throw new Error("The mail provider did not accept the message.");
  }
}
