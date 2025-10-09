import { sendMail } from "./mailer.js";

export const notifyCreateComplaint = async (name, email, title) => {
  const citizenMsg = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>🙌 Thank you for contacting <span style="color:#2a7cf7;">FixMyCity!</span></h2>
      <p>Dear <b>${name}</b>,</p>
      <p>✅ We’ve successfully received your complaint titled <strong>“${title}”</strong>.</p>
      <p>🛠️ Our team is reviewing it and will take action as soon as possible.</p>
      <p>📬 You’ll receive an update once the issue is resolved.</p>
      <br>
      <p>Best regards,<br>
      <b>The FixMyCity Team 🌆</b></p>
    </div>
  `;

  await sendMail([email], "📩 Complaint Received – FixMyCity", citizenMsg);
};

export const staffComplaintTemplate = (staff, complaint) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>🧾 New Complaint Assigned</h2>
      <p>Dear ${staff.name} 👋,</p>
      <p>A new complaint has been assigned to you via the <b>FixMyCity</b> portal.</p>

      <h3>📍 Complaint Details</h3>
      <ul style="line-height:1.6;">
        <li><b>Title:</b> ${complaint.title}</li>
        <li><b>Reported On:</b> ${new Date(
          complaint.createdAt
        ).toLocaleString()}</li>
      </ul>

      <h3>👤 Citizen Information</h3>
      <ul style="line-height:1.6;">
        <li><b>Name:</b> ${complaint.citizen.name}</li>
        <li><b>Email:</b> ${complaint.citizen.email}</li>
      </ul>

      <p>🧭 Please log in to your FixMyCity dashboard to take necessary action.</p>

      <br>
      <p>Best regards,<br><b>FixMyCity Admin Team ⚙️</b></p>
    </div>
  `;
};
