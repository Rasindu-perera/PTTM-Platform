const nodemailer = require('nodemailer');

// Configure the transporter using Mailtrap credentials from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email notification to a user when they are assigned a new task.
 * @param {string} userEmail - The email address of the assigned user.
 * @param {string} taskTitle - The title of the task.
 * @param {string} projectName - The name of the project.
 */
const sendTaskAssignmentEmail = async (userEmail, taskTitle, projectName) => {
  try {
    const mailOptions = {
      from: '"PTTM Notifications" <no-reply@pttm.com>',
      to: userEmail,
      subject: `New Task Assigned: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">You have been assigned a new task!</h2>
          <p><strong>Task Title:</strong> ${taskTitle}</p>
          <p><strong>Project:</strong> ${projectName}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p>Please log in to your Project and Team Task Management Platform dashboard to view more details and update your progress.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${userEmail}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${userEmail}:`, error);
  }
};

module.exports = {
  sendTaskAssignmentEmail,
};
