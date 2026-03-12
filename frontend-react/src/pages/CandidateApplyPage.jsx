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
        const data = getResumeData();
        if (data) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || data.name || '',
                email: prev.email || data.resume_data?.contact_info?.email || ''
            }));
            setUseMaster(true);
        }
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
                const saved = getResumeData();
                resumeDataOverride = saved?.resume_data;
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
        const scoreColor = result.score >= 80 ? '#10b981' : result.score >= 60 ? '#f59e0b' : '#ef4444';
        const scoreLabel = result.score >= 80 ? 'EXCELLENT' : result.score >= 60 ? 'GOOD' : 'AVERAGE';

        return (
            <div className="apply-step result-step">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="analysis-results-container"
                >
                    <div className="analysis-header-card card">
                        <div className="header-flex">
                            <div className="header-info">
                                <h2>Resume Analysis Results <span className="file-badge">PDF</span></h2>
                                <p className="text-muted">Instant ATS evaluation for <strong>{job.job_title}</strong></p>
                            </div>
                            <div className="big-score-gauge">
                                <div className="gauge-value" style={{ color: scoreColor }}>{Math.round(result.score)}</div>
                                <div className="gauge-label" style={{ backgroundColor: scoreColor + '20', color: scoreColor }}>{scoreLabel}</div>
                                <div className="gauge-sub">ATS Score</div>
                            </div>
                        </div>
                    </div>

                    <div className="analysis-tabs">
                        <button
                            className={`tab-item ${activeTab === 'summary' ? 'active' : ''}`}
                            onClick={() => setActiveTab('summary')}
                        >Summary</button>
                        <button
                            className={`tab-item ${activeTab === 'detailed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('detailed')}
                        >Detailed Analysis</button>
                        <button
                            className={`tab-item ${activeTab === 'improvements' ? 'active' : ''}`}
                            onClick={() => setActiveTab('improvements')}
                        >Improvements</button>
                    </div>

                    <div className="tab-content area">
                        {activeTab === 'summary' && (
                            <div className="summary-grid">
                                <div className="analysis-card result-card card">
                                    <div className="card-icon"><Users size={20} /></div>
                                    <div className="card-body">
                                        <h4>Contact Information</h4>
                                        <div className="progress-flex">
                                            <div className="bar-outer"><div className="bar-inner green" style={{ width: `${(result.details.contact_info_score / 15) * 100}%` }}></div></div>
                                            <span className="score-val">{result.details.contact_info_score}/15</span>
                                        </div>
                                        <p className="section-fb">{result.details.feedback?.contact || "Great contact details."}</p>
                                    </div>
                                </div>

                                <div className="analysis-card result-card card">
                                    <div className="card-icon"><Briefcase size={20} /></div>
                                    <div className="card-body">
                                        <h4>Work Experience</h4>
                                        <div className="progress-flex">
                                            <div className="bar-outer"><div className="bar-inner blue" style={{ width: `${(result.details.experience_score / 30) * 100}%` }}></div></div>
                                            <span className="score-val">{result.details.experience_score}/30</span>
                                        </div>
                                        <p className="section-fb">{result.details.feedback?.experience || "Experience match found."}</p>
                                    </div>
                                </div>

                                <div className="analysis-card result-card card">
                                    <div className="card-icon"><Star size={20} /></div>
                                    <div className="card-body">
                                        <h4>Skills Match</h4>
                                        <div className="progress-flex">
                                            <div className="bar-outer"><div className="bar-inner purple" style={{ width: `${(result.details.skills_match_score / 20) * 100}%` }}></div></div>
                                            <span className="score-val">{result.details.skills_match_score}/20</span>
                                        </div>
                                        <p className="section-fb">{result.details.feedback?.skills || "Critical skills detected."}</p>
                                    </div>
                                </div>

                                <div className="analysis-card result-card card">
                                    <div className="card-icon"><FileText size={20} /></div>
                                    <div className="card-body">
                                        <h4>Education</h4>
                                        <div className="progress-flex">
                                            <div className="bar-outer"><div className="bar-inner orange" style={{ width: `${(result.details.education_score / 20) * 100}%` }}></div></div>
                                            <span className="score-val">{result.details.education_score}/20</span>
                                        </div>
                                        <p className="section-fb">{result.details.feedback?.education || "Education requirements met."}</p>
                                    </div>
                                </div>

                                <div className="analysis-card result-card card">
                                    <div className="card-icon"><LayoutList size={20} /></div>
                                    <div className="card-body">
                                        <h4>Formatting</h4>
                                        <div className="progress-flex">
                                            <div className="bar-outer"><div className="bar-inner teal" style={{ width: `${(result.details.formatting_score / 15) * 100}%` }}></div></div>
                                            <span className="score-val">{result.details.formatting_score}/15</span>
                                        </div>
                                        <p className="section-fb">{result.details.feedback?.formatting || "Consistent formatting detected."}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'detailed' && (
                            <div className="detailed-analysis-view card">
                                <h3>AI Matching Logic Breakdown</h3>
                                <ul className="points-list">
                                    <li><CheckCircle2 size={16} className="text-green" /> Point Breakdown: {Math.round(result.details.skills_match_score)} points for skills + {Math.round(result.details.experience_score)} for work history.</li>
                                    <li><BrainCircuit size={16} className="text-primary" /> Our AI compared your past <strong>{result.details.exp_years} years</strong> of experience against the {job.job_title} role.</li>
                                    <li><AlertCircle size={16} className="text-muted" /> Note: This score is an automated estimation based on semantic matching.</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === 'improvements' && (
                            <div className="improvements-view card">
                                <h3>Personalized Advice</h3>
                                <div className="advice-grid">
                                    <div className="advice-item">
                                        <strong>Skills Recommendation:</strong>
                                        <p>{result.details.skills_match_score < 15 ? "Our analysis shows you might be missing some specific industry keywords. Try mentioning technologies like 'FastAPI', 'Docker', or 'Microservices' if you have experience with them." : "Your skills are excellently aligned with this JD. No major additions needed."}</p>
                                    </div>
                                    <div className="advice-item">
                                        <strong>Layout Tip:</strong>
                                        <p>{result.details.formatting_score < 10 ? "Consider using a single-column layout with standard 'Skills' and 'Experience' headers to help the AI parse your data more accurately." : "Your resume layout is perfectly structured and parsed successfully."}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="action-footer mt-4">
                        <button className="btn btn-outline" onClick={onBack}>Browse More Jobs</button>
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
