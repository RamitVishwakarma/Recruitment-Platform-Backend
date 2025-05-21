const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.in",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: process.env.ZEPTOMAIL_USER,
    pass: process.env.ZEPTOMAIL_PASS,
  },
});

// Function to send an email
const sendEmail = async (
  toEmail,
  subject,
  htmlContent,
  fromName = "GDSC JSSATEN",
  titleName = "noreply-recplat.ramitvishwakarma.in"
) => {
  // The 'from' address in mailOptions should ideally be a verified sender in ZeptoMail
  // Often, this can be the same as the bounce address used for authentication
  const mailOptions = {
    from: `"${fromName}" <${titleName}>`,
    to: toEmail,
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${toEmail}`);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error.message);
    if (error.response) {
      console.error("Error response:", error.response);
    }
    return { success: false, message: "Error sending email." };
  }
};

module.exports = sendEmail;
