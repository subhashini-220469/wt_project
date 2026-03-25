import nodemailer from 'nodemailer';

export const sendOtp = async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required" });
    }

    try {
        let transporter;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            // Use Ethereal test account if no actual credentials provided
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        let info = await transporter.sendMail({
            from: '"HireAI Pro" <no-reply@hireaipro.com>',
            to: email,
            subject: "Your Verify Code",
            text: `Hello, your OTP code is ${otp}`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>HireAI Pro Verification</h2>
                    <p>Your one-time password (OTP) is:</p>
                    <h1 style="color: #0d9488; letter-spacing: 5px;">${otp}</h1>
                    <p>If you did not request this, please ignore this email.</p>
                   </div>`
        });

        console.log("Message sent: %s", info.messageId);
        if (!process.env.EMAIL_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};
