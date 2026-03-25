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
import { getResumeData } from '../utils/resumeStorage';

const CandidateApplyPage = ({ job, onBack }) => {
    const [step, setStep] = useState(1); // 1: Qs, 2: Upload, 3: Feedback, 4: Result
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        answers: {}
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [parsedResumeData, setParsedResumeData] = useState(null);
    const [parsedResumeFilename, setParsedResumeFilename] = useState(null);
    const [useMaster, setUseMaster] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            const userEmail = localStorage.getItem('userEmail');
            let saved = getResumeData();

            // Fallback: Try recovering from DB if local is empty but we have an email
            if (!saved && userEmail) {
                try {
                    const dbProfile = await apiService.getProfile(userEmail);
                    if (dbProfile) {
                        saved = dbProfile;
                        // Don't save to local here to keep it clean, or do it for consistency
                        // import { saveResumeData } from '../utils/resumeStorage';
                    }
                } catch (e) { /* silent fail */ }
            }

            let initialEmail = userEmail || '';
            let initialName = '';

            if (saved) {
                initialName = saved.resume_data?.name || saved.name || '';
                initialEmail = saved.resume_data?.email || userEmail || '';
                setUseMaster(true);
            }

            setFormData(prev => ({
                ...prev,
                name: prev.name || initialName,
                email: prev.email || initialEmail
            }));
        };

        loadInitialData();
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

    const handleAnalyze = async () => {
        setIsSubmitting(true);
        try {
            let resumeData = null;
            let resumeFilename = null;
            if (useMaster) {
                const saved = getResumeData();
                resumeData = saved?.resume_data;
                resumeFilename = saved?.resume_filename || null;
            } else if (resumeFile) {
                // We need to parse it for the analysis phase
                const parseRes = await apiService.parseResume(resumeFile);
                resumeData = parseRes.resume_data;
                resumeFilename = parseRes.resume_filename || null;
            }

            if (!resumeData) throw new Error("No resume found. Please upload or use master profile.");

            setParsedResumeData(resumeData);
            setParsedResumeFilename(resumeFilename);

            // Get feedback from scoring engine
            const feedbackRes = await apiService.checkAtsScore(job._id, resumeData);
            setAnalysisResult(feedbackRes);
            setStep(3);
        } catch (error) {
            alert("Analysis failed: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Build override object that includes resume_filename so the backend can store it
            const overridePayload = parsedResumeFilename
                ? { resume_data: parsedResumeData, resume_filename: parsedResumeFilename }
                : parsedResumeData;

            const res = await apiService.applyToJob(
                job._id,
                formData.name,
                formData.email,
                null, // No need to re-upload file if we have parsed data override
                formData.answers,
                overridePayload
            );
            setResult(res);
            setStep(4);
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
                                onClick={handleAnalyze}
                                disabled={!formData.name || !formData.email || isSubmitting}
                            >
                                {isSubmitting ? 'Analyzing Profile...' : 'Get Instant AI Feedback'}
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
                    onClick={handleAnalyze}
                    disabled={(!resumeFile && !useMaster) || isSubmitting}
                >
                    {isSubmitting ? 'Analyzing Profile...' : 'Get Instant AI Feedback'}
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

    const renderFeedback = () => {
        if (!analysisResult) return null;
        const feedback = analysisResult.feedback || {};
        const score = analysisResult.total_score || 0;

        return (
            <div className="apply-step feedback-step">
                <div className="apply-header">
                    <button className="btn-ghost" onClick={() => setStep(useMaster ? 1 : 2)}><ChevronLeft size={20} /> Back to Edit</button>
                    <h2>Review Your Analysis</h2>
                    <p className="text-muted">Here's how your profile matches <strong>{job.job_title}</strong>.</p>
                </div>

                <div className="ai-feedback-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    textAlign: 'left',
                    marginTop: '1.5rem'
                }}>
                    {/* Match Score Card */}
                    <div className="feedback-card" style={{
                        background: 'var(--secondary)',
                        padding: '1.25rem',
                        borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        gridColumn: '1 / -1'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <BrainCircuit size={20} className="text-primary" />
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>ATS Match Score</h4>
                                </div>
                                <div style={{ fontSize: '3rem', fontWeight: 850, color: 'var(--primary)' }}>
                                    {score}%
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', maxWidth: '300px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0 }}>
                                    {score >= 70 ? "Excellent match! Your profile aligns well with this role's requirements." : "Good start. Check the suggestions below to improve your chances."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Specific Feedback Sections */}
                    {[
                        { title: 'Skills Match', content: feedback.skills, icon: <LayoutList size={20} /> },
                        { title: 'Experience match', content: feedback.experience, icon: <Briefcase size={20} /> },
                        { title: 'Resume Formatting', content: feedback.formatting, icon: <FileCheck size={20} /> }
                    ].map((item, idx) => (
                        <div key={idx} className="feedback-card" style={{
                            background: 'var(--card-bg)',
                            padding: '1.25rem',
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--primary)' }}>{item.icon}</span>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>{item.title}</h4>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.9, margin: 0, lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                {item.content || "Analyzing content..."}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="analysis-cta" style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleFinalSubmit}
                        style={{ height: '56px', fontSize: '1.1rem' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting Application...' : 'Apply Now with this Match'}
                    </button>
                    <button
                        className="btn btn-ghost w-full"
                        onClick={() => setStep(useMaster ? 1 : 2)}
                    >
                        I want to edit my resume to improve this score
                    </button>
                </div>
            </div>
        );
    };

    const renderResult = () => {
        return (
            <div className="apply-step result-step">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="success-view-container"
                    style={{
                        padding: '3rem 2rem',
                        background: 'var(--card-bg)',
                        borderRadius: '32px',
                        border: '1px solid var(--border-color)',
                        maxWidth: '600px',
                        margin: '4rem auto',
                        textAlign: 'center'
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

                    <h2 style={{ fontSize: '2rem', fontWeight: 850, color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                        Application <span style={{ color: 'var(--primary)' }}>Submitted!</span>
                    </h2>

                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                        Your application for the <strong>{job.job_title}</strong> role at <strong>{job.company}</strong> has been received by the hiring team.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={onBack} style={{ padding: '1rem 2.5rem' }}>
                            Back to Job Board
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
                    {step === 3 && renderFeedback()}
                    {step === 4 && renderResult()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CandidateApplyPage;
