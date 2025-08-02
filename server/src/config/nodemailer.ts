// This file configures the Nodemailer transporter for sending emails.
// server/src/config/nodemailer.ts
import nodemailer from 'nodemailer';

// Create a transporter using SMTP settings from environment variables
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465, // Change to 465
  secure: true, // Set secure to true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default transporter;