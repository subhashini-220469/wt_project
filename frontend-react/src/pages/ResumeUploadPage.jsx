import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, BrainCircuit, Trash2, Zap, Shield, Star } from 'lucide-react';
import { apiService } from '../services/api';

const ResumeUploadPage = () => {
    const [resumeData, setResumeData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        const saved = localStorage.getItem('candidate_resume_data');
        if (saved) {
            setResumeData(JSON.parse(saved));
        }
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setStatus('uploading');

        try {
            const res = await apiService.parseResume(file);
            if (res.resume_data) {
                localStorage.setItem('candidate_resume_data', JSON.stringify(res));
                setResumeData(res);
                setStatus('success');
            }
        } catch (error) {
            console.error("Upload failed", error);
            setStatus('error');
        } finally {
            setIsUploading(false);
        }
    };

    const clearResume = () => {
        localStorage.removeItem('candidate_resume_data');
        setResumeData(null);
        setStatus('idle');
    };

    return (
        <div className="resume-page-outer">
            {/* Animated background blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

            <motion.div
                className="resume-page-inner"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Header */}
                <motion.div
                    className="resume-page-hero"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                >
                    <div className="hero-badge">
                        <Zap size={13} />
                        <span>AI Powered</span>
                    </div>
                    <h1 className="resume-hero-title">
                        My <span className="hero-gradient-text">Resume</span>
                    </h1>
                    <p className="resume-hero-sub">
                        Upload once — get instant ATS match scores for any job.
                    </p>
                </motion.div>

                {/* Two-column layout */}
                <div className="resume-two-col">
                    {/* Left: Upload Area */}
                    <motion.div
                        className="resume-upload-card"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                    >
                        <AnimatePresence mode="wait">
                            {resumeData ? (
                                <motion.div
                                    key="active"
                                    className="resume-active-view"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="active-icon">
                                        <FileText size={40} />
                                    </div>
                                    <div className="active-info">
                                        <h3>{resumeData.name || "Your Resume"}</h3>
                                        <p>Stored and ready for ATS checks.</p>
                                        <div className="skills-preview-mini">
                                            {resumeData.resume_data?.skills?.slice(0, 6).map((s, i) => (
                                                <span key={i} className="skill-tag-mini">{s}</span>
                                            ))}
                                            {resumeData.resume_data?.skills?.length > 6 && <span className="skill-tag-mini">+ more</span>}
                                        </div>
                                    </div>
                                    <button className="btn-ghost text-red" onClick={clearResume}>
                                        <Trash2 size={20} />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload"
                                    className="resume-upload-zone"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <input
                                        type="file"
                                        id="master-resume"
                                        hidden
                                        accept=".pdf,.docx"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <label htmlFor="master-resume" className="file-drop-area">
                                        {isUploading ? (
                                            <div className="upload-loading">
                                                <BrainCircuit className="spin" size={56} />
                                                <p>AI is reading your profile...</p>
                                                <span>Analyzing skills & experience</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="upload-icon-ring">
                                                    <Upload size={36} />
                                                </div>
                                                <p>Click to upload your Resume</p>
                                                <span>PDF or DOCX supported</span>
                                            </>
                                        )}
                                    </label>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="success-banner-mini"
                            >
                                <CheckCircle2 size={18} />
                                <span>Resume parsed! You can now use "Check ATS" on any job.</span>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Right: Info Cards */}
                    <div className="resume-side-cards">
                        <motion.div
                            className="info-card"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <div className="info-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                                <BrainCircuit size={20} />
                            </div>
                            <div>
                                <h4>How it works</h4>
                                <ul className="how-list">
                                    <li>📄 Upload your most recent resume</li>
                                    <li>🤖 AI extracts your skills & experience</li>
                                    <li>✅ Click <strong>"Check ATS"</strong> on any job to score yourself</li>
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div
                            className="info-card"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <div className="info-card-icon" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4>Your data is safe</h4>
                                <p className="info-card-desc">Your resume is stored locally on your device. We never share your data.</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="info-card"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <div className="info-card-icon" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                                <Star size={20} />
                            </div>
                            <div>
                                <h4>Get matched faster</h4>
                                <p className="info-card-desc">Candidates with a stored resume get ATS scores instantly without re-uploading.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResumeUploadPage;
