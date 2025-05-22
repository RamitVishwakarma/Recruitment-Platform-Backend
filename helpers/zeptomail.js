const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZEPTOMAIL_USER,
    pass: process.env.ZEPTOMAIL_PASS,
  },
});

const sendEmail = async (
  toEmail,
  subject,
  htmlContent,
  fromName = "GDSC JSSATEN",
  addressName = "noreply@recruitment-platform.ramitvishwakarma.in"
) => {
  const mailOptions = {
    from: {
      name: fromName,
      address: addressName,
    },
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
