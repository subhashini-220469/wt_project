import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, BrainCircuit, Trash2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

const ResumeUploadPage = () => {
    const [resumeData, setResumeData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error

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

        const formData = new FormData();
        formData.append('files', file);
        formData.append('jd_text', "General Resume Extraction"); // Dummy JD just for extraction

        try {
            // Reusing process endpoint just to get the parsed resume data
            const res = await apiService.processResumes(formData);
            if (res.top_candidates && res.top_candidates.length > 0) {
                const parsedData = res.top_candidates[0].details;
                // Note: The /process endpoint returns results in a specific format
                // In a production app, we'd have a specific /parse-only endpoint

                // Let's store the raw resume data from the backend result
                // We'll need to fetch the full resume data if needed, but for now
                // let's assume we save the name/skills/etc.
                const candidateInfo = res.top_candidates[0];
                localStorage.setItem('candidate_resume_data', JSON.stringify(candidateInfo));
                setResumeData(candidateInfo);
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
        <div className="resume-manager-container">
            <div className="manager-header">
                <h2>My Master Resume</h2>
                <p className="text-muted">Upload your resume once to instantly check match scores for any job.</p>
            </div>

            <div className="card manager-card">
                {resumeData ? (
                    <div className="resume-active-view">
                        <div className="active-icon">
                            <FileText size={40} className="text-primary" />
                        </div>
                        <div className="active-info">
                            <h3>{resumeData.name || "Your Resume"}</h3>
                            <p>Stored and ready for ATS checks.</p>
                            <div className="skills-preview-mini">
                                {resumeData.resume_data?.skills?.slice(0, 5).map((s, i) => (
                                    <span key={i} className="skill-tag-mini">{s}</span>
                                ))}
                                {resumeData.resume_data?.skills?.length > 5 && <span>+ more</span>}
                            </div>
                        </div>
                        <button className="btn-ghost text-red" onClick={clearResume}>
                            <Trash2 size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="resume-upload-zone">
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
                                    <BrainCircuit className="spin" size={48} />
                                    <p>AI is reading your profile...</p>
                                </div>
                            ) : (
                                <>
                                    <Upload size={48} />
                                    <p>Click to upload your Master Resume</p>
                                    <span>PDF or DOCX</span>
                                </>
                            )}
                        </label>
                    </div>
                )}
            </div>

            {status === 'success' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="success-banner-mini"
                >
                    <CheckCircle2 size={18} />
                    <span>Resume parsed successfully! You can now use "Check ATS" on any job.</span>
                </motion.div>
            )}

            <div className="tips-section card">
                <h3><BrainCircuit size={18} /> How it works</h3>
                <ul>
                    <li>Upload your most up-to-date resume here.</li>
                    <li>We'll extract your skills and experience.</li>
                    <li>When you browse jobs, click <strong>"Check ATS"</strong> to see how you match WITHOUT applying.</li>
                </ul>
            </div>
        </div>
    );
};

export default ResumeUploadPage;
