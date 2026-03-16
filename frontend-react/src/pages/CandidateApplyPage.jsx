import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    MapPin,
    ChevronLeft,
    Upload,
    FileText,
    CheckCircle2,
    BrainCircuit,
    AlertCircle,
    X,
    Star,
    Users,
    Smartphone,
    LayoutList,
    FileCheck
} from 'lucide-react';
import { apiService } from '../services/api';

const CandidateApplyPage = ({ job, onBack }) => {
    const [step, setStep] = useState(1); // 1: Questions, 2: Upload, 3: Result
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        answers: {}
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [useMaster, setUseMaster] = useState(false);

    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        const saved = localStorage.getItem('candidate_resume_data');
        
        let initialEmail = userEmail || '';
        let initialName = '';

        if (saved) {
            const data = JSON.parse(saved);
            // Use the flattened structure we established earlier
            initialName = data.resume_data?.name || data.name || '';
            initialEmail = data.resume_data?.email || initialEmail;
            setUseMaster(true);
        }

        setFormData(prev => ({
            ...prev,
            name: prev.name || initialName,
            email: prev.email || initialEmail
        }));
    }, []);

    const handleAnswerChange = (qId, value) => {
        setFormData(prev => ({
            ...prev,
            answers: { ...prev.answers, [qId]: value }
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
            setResumeFile(file);
            setUseMaster(false);
        } else {
            alert("Please upload a PDF or DOCX file.");
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            let resumeDataOverride = null;
            if (useMaster) {
                const saved = JSON.parse(localStorage.getItem('candidate_resume_data'));
                resumeDataOverride = saved.resume_data;
            }

            const res = await apiService.applyToJob(
                job._id,
                formData.name,
                formData.email,
                useMaster ? null : resumeFile,
                formData.answers,
                resumeDataOverride
            );
            setResult(res);
            setStep(3);
        } catch (error) {
            alert("Application failed: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderQuestions = () => (
        <div className="apply-step">
            <div className="apply-header">
                <button className="btn-ghost" onClick={onBack}><ChevronLeft size={20} /> Back to Jobs</button>
                <h2>Apply for {job.job_title}</h2>
                <p className="text-muted">{job.company} • {job.location}</p>
            </div>

            <div className="apply-form card">
                <div className="input-group">
                    <label>Full Name*</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    />
                </div>
                <div className="input-group">
                    <label>Email Address*</label>
                    <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    />
                </div>

                {job.screening_questions?.length > 0 && (
                    <div className="screening-section">
                        <h3>Screening Questions</h3>
                        {job.screening_questions.map((q) => (
                            <div key={q.id} className="input-group">
                                <label>{q.question}{q.is_required ? '*' : ''}</label>
                                {q.input_type === 'yes_no' ? (
                                    <div className="radio-group">
                                        <button
                                            className={`btn-tag ${formData.answers[q.id] === 'Yes' ? 'selected' : ''}`}
                                            onClick={() => handleAnswerChange(q.id, 'Yes')}
                                        >Yes</button>
                                        <button
                                            className={`btn-tag ${formData.answers[q.id] === 'No' ? 'selected' : ''}`}
                                            onClick={() => handleAnswerChange(q.id, 'No')}
                                        >No</button>
                                    </div>
                                ) : q.input_type === 'long_text' ? (
                                    <textarea
                                        rows="3"
                                        value={formData.answers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    />
                                ) : (
                                    <input
                                        type={q.input_type === 'numeric' ? 'number' : 'text'}
                                        value={formData.answers[q.id] || ''}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="apply-actions-final">
                    {useMaster ? (
                        <div className="fast-track-apply">
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleSubmit}
                                disabled={!formData.name || !formData.email || isSubmitting}
                            >
                                {isSubmitting ? 'Syncing Profile...' : 'Submit Application (Fast-Track)'}
                            </button>
                            <button
                                className="btn btn-ghost w-full"
                                style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                                onClick={() => setStep(2)}
                            >
                                Wait, I want to upload a different resume for this job
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary w-full"
                            onClick={() => setStep(2)}
                            disabled={!formData.name || !formData.email}
                        >
                            Continue to Resume Upload
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderUpload = () => (
        <div className="apply-step">
            <div className="apply-header">
                <button className="btn-ghost" onClick={() => setStep(1)}><ChevronLeft size={20} /> Back to Questions</button>
                <h2>Upload Your Resume</h2>
                <p className="text-muted">Showcase your skills for the {job.job_title} role.</p>
            </div>

            <div className="upload-section card">
                <input
                    type="file"
                    id="resume"
                    hidden
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                />
                <label htmlFor="resume" className="file-drop-area apply-drop">
                    {useMaster ? (
                        <>
                            <div className="active-badge-mini">Using Master Resume</div>
                            <FileText size={48} className="text-primary" />
                            <div className="file-info-apply">
                                <strong>Stored Profile</strong>
                                <span>Fast-track application active</span>
                            </div>
                            <button className="btn btn-outline" onClick={(e) => { e.preventDefault(); setUseMaster(false); }}>
                                Upload Different File
                            </button>
                        </>
                    ) : resumeFile ? (
                        <>
                            <FileText size={48} className="text-primary" />
                            <div className="file-info-apply">
                                <strong>{resumeFile.name}</strong>
                                <span>{(resumeFile.size / 1024).toFixed(1)} KB</span>
                            </div>
                            <button className="btn btn-outline" onClick={(e) => { e.preventDefault(); setResumeFile(null); }}>
                                Change File
                            </button>
                        </>
                    ) : (
                        <>
                            <Upload size={48} />
                            <p>Drag or click to upload PDF/DOCX</p>
                            <span className="text-xs">Max size: 5MB</span>
                        </>
                    )}
                </label>

                <button
                    className="btn btn-primary w-full mt-2"
                    onClick={handleSubmit}
                    disabled={(!resumeFile && !useMaster) || isSubmitting}
                >
                    {isSubmitting ? 'Processing Application...' : 'Submit Application'}
                </button>
                {isSubmitting && (
                    <div className="ai-status-mini">
                        <BrainCircuit className="spin" size={20} />
                        <span>AI is analyzing your profile against the JD...</span>
                    </div>
                )}
            </div>
        </div>
    );

    const [activeTab, setActiveTab] = useState('summary');

    const renderResult = () => {
        return (
            <div className="apply-step result-step">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="success-view-container"
                    style={{ 
                        textAlign: 'center', 
                        padding: '4rem 2rem', 
                        background: 'var(--card-bg)', 
                        borderRadius: '32px',
                        border: '1px solid var(--border-color)',
                        maxWidth: '600px',
                        margin: '2rem auto'
                    }}
                >
                    <div className="success-icon-wrapper" style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        borderRadius: '100px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 2rem',
                        color: '#10b981'
                    }}>
                        <CheckCircle2 size={40} />
                    </div>

                    <h2 style={{ fontSize: '2.25rem', fontWeight: 850, color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                        Application <span style={{ color: 'var(--primary)' }}>Successful!</span>
                    </h2>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                        You have successfully applied to the <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{job.job_title}</span> role at <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{job.company}</span>.
                    </p>

                    <div className="next-steps-info" style={{ 
                        background: 'var(--secondary)', 
                        padding: '1.5rem', 
                        borderRadius: '20px', 
                        marginBottom: '2.5rem',
                        textAlign: 'left'
                    }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>What happens next?</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.8, margin: 0 }}>
                            The hiring team will review your application. You can track your real-time status and match score in your dashboard.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={onBack} style={{ padding: '0.8rem 2rem' }}>
                            Browse More Jobs
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="candidate-apply-container">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    {step === 1 && renderQuestions()}
                    {step === 2 && renderUpload()}
                    {step === 3 && renderResult()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CandidateApplyPage;
