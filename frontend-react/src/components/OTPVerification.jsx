import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/OTPVerification.css';

const OTPVerification = ({ email, onVerify }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [expectedOtp, setExpectedOtp] = useState('');
    const inputRefs = useRef([]);

    useEffect(() => {
        sendNewOtp();
    }, [email]);

    const sendNewOtp = async () => {
        const generated = Math.floor(100000 + Math.random() * 900000).toString();
        setExpectedOtp(generated);
        // Send email via backend endpoint
        try {
            await fetch('http://localhost:5000/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: generated })
            });
            console.log("OTP sent to email");
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Failed to send OTP. Let's try simulating it instead.");
            setTimeout(() => alert(`SIMULATED EMAIL:\nOTP Code for ${email} is: ${generated}`), 500);
        }
    };

    const handleChange = (e, index) => {
        const val = e.target.value;
        if (isNaN(val)) return;
        
        const newOtp = [...otp];
        newOtp[index] = val.slice(-1);
        setOtp(newOtp);

        // Move focus forward
        if (val && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            const newOtp = [...otp];
            if (!newOtp[index] && index > 0 && inputRefs.current[index - 1]) {
                inputRefs.current[index - 1].focus();
            }
            newOtp[index] = '';
            setOtp(newOtp);
        }
    };

    const handleVerify = () => {
        const entered = otp.join('');
        if (entered.length < 6) {
            alert("Please enter all 6 digits.");
            return;
        }
        if (entered === expectedOtp) {
            onVerify();
        } else {
            alert("Invalid OTP code. Please try again.");
        }
    };

    const resendOtp = () => {
        setOtp(['', '', '', '', '', '']);
        if(inputRefs.current[0]) inputRefs.current[0].focus();
        sendNewOtp();
    };

    return (
        <div className="otp-modal-container">
            <motion.div 
                className="otp-card"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                {/* OTP Icon resembling the reference image rings */}
                <div className="otp-icon-wrapper">
                    <div className="otp-icon-outer">
                        <div className="otp-icon-inner">
                            <span>OTP</span>
                        </div>
                    </div>
                </div>
                
                <h2 className="otp-title">Verify OTP</h2>
                <p className="otp-subtitle">Enter the 6-digit code sent to {email || 'your email'}</p>
                
                <div className="otp-inputs">
                    {otp.map((digit, i) => (
                        <input 
                            key={i}
                            ref={el => inputRefs.current[i] = el}
                            type="text"
                            value={digit}
                            onChange={(e) => handleChange(e, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className="otp-box"
                            autoFocus={i === 0}
                            maxLength={1}
                        />
                    ))}
                </div>
                
                <p className="resend-text">
                    Didn't receive code? <span className="resend-link" onClick={resendOtp}>Resend OTP</span>
                </p>
                
                <button className="otp-verify-btn" onClick={handleVerify}>
                    Verify OTP
                </button>
            </motion.div>
        </div>
    );
};

export default OTPVerification;
