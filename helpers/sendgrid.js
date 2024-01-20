const sgMail = require('@sendgrid/mail');

// Set your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send a reset email
const sendResetEmail = async (toEmail, senderEmail, subject, htmlContent) => {
    const msg = {
        to: toEmail,
        from: {
            name: 'GDSC JSSATEN',
            email: senderEmail,  // Specify the sender's email address
        },
        subject: subject,
        html: htmlContent,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${toEmail}`);
        return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
        console.error(`Error sending email to ${toEmail}:`, error.response?.body || error.message);
        return { success: false, message: 'Error sending email.' };
    }
};

module.exports = sendResetEmail;

