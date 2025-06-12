const nodemailer = require("nodemailer");
// Nodemailer is package which is used to send the email using SMTP
require('dotenv').config()


const sendEmail = async ({ to, subject, html }) => {
    // html is the content of the email body like links 
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            // Gmail SMTP service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        const mailOptions = {
            from: `"Campus Collab" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        // Returning an success object
        return { success: true, message: "Email sent", response: info.response };

    } catch (error) {
        console.error("Error sending email: ", error.message);
        return { success: false, message: error.message };
    }
};

module.exports = sendEmail;
