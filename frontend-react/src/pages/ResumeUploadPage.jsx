import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, BrainCircuit, Trash2, Zap, Shield, Star, MapPin, Mail, Phone, ExternalLink, GraduationCap, Briefcase, Code, User } from 'lucide-react';
import { apiService } from '../services/api';
import { getResumeData, saveResumeData, clearResumeData } from '../utils/resumeStorage';

const ResumeUploadPage = () => {
    const [resumeData, setResumeData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        const loadInitialData = async () => {
            // Priority 1: LocalStorage (Fastest)
            const saved = getResumeData();
            if (saved) {
                setResumeData(saved);
                return;
            }

            // Priority 2: Database (Recovery)
            const email = localStorage.getItem('userEmail');
            if (email) {
                try {
                    const dbProfile = await apiService.getProfile(email);
                    if (dbProfile) {
                        saveResumeData(dbProfile);
                        setResumeData(dbProfile);
                    }
                } catch (e) {
                    console.error("Failed to recover profile from DB", e);
                }
            }
        };

        loadInitialData();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setStatus('uploading');

        try {
            const res = await apiService.parseResume(file);
            if (res.resume_data) {
                // Save locally for speed
                saveResumeData(res);
                
                // Save to DB for persistence
                const email = localStorage.getItem('userEmail') || res.resume_data.email;
                if (email) {
                    await apiService.saveProfile(email, res);
                }

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
        clearResumeData();
        setResumeData(null);
        setStatus('idle');
    };

    return (
        <div className="resume-page-outer">
            {/* Removed noisy background blobs */}

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
                        {!resumeData ? (
                            <AnimatePresence>
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
                            </AnimatePresence>
                        ) : (
                            <motion.div
                                className="resume-data-display"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="data-section">
                                    <h4 className="section-title"><User size={16} /> Identity & Contact</h4>
                                    <div className="data-grid-mini">
                                        <div className="data-item-row" style={{ color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                            <strong>{resumeData.resume_data?.name || resumeData.name}</strong>
                                        </div>
                                        {resumeData.resume_data?.email && (
                                            <div className="data-item-row"><Mail size={14} /> <span>{resumeData.resume_data.email}</span></div>
                                        )}
                                        {resumeData.resume_data?.phone && (
                                            <div className="data-item-row"><Phone size={14} /> <span>{resumeData.resume_data.phone}</span></div>
                                        )}
                                        {resumeData.resume_data?.location && (
                                            <div className="data-item-row"><MapPin size={14} /> <span>{resumeData.resume_data.location}</span></div>
                                        )}
                                        {resumeData.resume_data?.linkedin && (
                                            <div className="data-item-row"><ExternalLink size={14} /> <span>LinkedIn Profile</span></div>
                                        )}
                                    </div>
                                </div>

                                <div className="data-section">
                                    <h4 className="section-title"><BrainCircuit size={16} /> Top Skills</h4>
                                    <div className="skills-cloud-medium">
                                        {resumeData.resume_data?.skills?.length > 0 ? (
                                            resumeData.resume_data.skills.map((s, i) => (
                                                <span key={i} className="skill-pill-refined">{s}</span>
                                            ))
                                        ) : (
                                            <p className="text-muted">No skills detected</p>
                                        )}
                                    </div>
                                </div>

                                <div className="data-section">
                                    <h4 className="section-title"><Briefcase size={16} /> Experience Overview</h4>
                                    <div className="exp-mini-card">
                                        <div className="exp-total"><strong>{resumeData.resume_data?.experience_years || 0}</strong> years of history detected.</div>
                                        {resumeData.resume_data?.recent_jobs?.length > 0 && (
                                            <ul className="recent-jobs-list">
                                                {resumeData.resume_data.recent_jobs.map((j, i) => (
                                                    <li key={i}>{j}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <div className="data-section">
                                    <h4 className="section-title"><GraduationCap size={16} /> Education</h4>
                                    <p className="edu-tag-main">{resumeData.resume_data?.education_level || "Unknown"}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResumeUploadPage;
