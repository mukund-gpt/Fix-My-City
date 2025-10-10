import nodemailer from "nodemailer";

export const sendMail = async (emails, subject, message) => {
  try {
    if (!emails) return;
    // Create transporter using your email service or SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use 'smtp.mailtrap.io' / custom SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare mail options
    const mailOptions = {
      from: `"FixMyCity" <${process.env.EMAIL_USER}>`,
      to: emails.join(","), // Convert list of emails to comma-separated string
      subject,
      html: `<p>${message}</p>`, // You can also use plain text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Emails sent:", info.accepted);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};
