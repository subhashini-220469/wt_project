import React, { useState } from 'react';
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
    Star
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
        } else {
            alert("Please upload a PDF or DOCX file.");
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('resume', resumeFile);
        data.append('screening_answers', JSON.stringify(formData.answers));

        try {
            const res = await apiService.applyToJob(job._id, data);
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

                <button
                    className="btn btn-primary w-full"
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.email}
                >
                    Continue to Resume Upload
                </button>
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
                    {resumeFile ? (
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
                    disabled={!resumeFile || isSubmitting}
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

    const renderResult = () => (
        <div className="apply-step result-step text-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="score-card-large card"
            >
                <div className="success-icon-badge">
                    <CheckCircle2 size={40} className="text-green" />
                </div>
                <h2>Application Submitted!</h2>
                <p>Your instant ATS score for <strong>{job.job_title}</strong> is:</p>

                <div className="big-score-display">
                    <div className="score-circle">
                        <span className="score-num">{Math.round(result.score)}%</span>
                        <span className="score-label">Match Score</span>
                    </div>
                </div>

                <div className="score-details-grid">
                    <div className="detail-pill">
                        <Star size={14} /> Skills: {Math.round((result.details.skills_match_score / 20) * 100)}%
                    </div>
                    <div className="detail-pill">
                        <Star size={14} /> Exp: {Math.round((result.details.experience_score / 30) * 100)}%
                    </div>
                    <div className="detail-pill">
                        <Star size={14} /> Edu: {Math.round((result.details.education_score / 20) * 100)}%
                    </div>
                </div>

                <div className="feedback-box">
                    <BrainCircuit size={20} className="text-primary" />
                    <p>Our AI is currently sharing your profile with the hiring team at <strong>{job.company}</strong>. You'll receive an email if you're shortlisted for the next round!</p>
                </div>

                <button className="btn btn-outline w-full" onClick={onBack}>
                    Return to Job Board
                </button>
            </motion.div>
        </div>
    );

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
