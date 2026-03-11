import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    Building2,
    MapPin,
    Clock,
    DollarSign,
    HelpCircle,
    Plus,
    X,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Trash2
} from 'lucide-react';

const PostJobPage = ({ onJobPosted }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        job_title: '',
        company: '',
        workplace_type: 'In Office',
        location: '',
        job_type: 'Full-time',
        description: '',
        salary: { range: '', pay_type: 'Yearly' },
        screening_questions: [
            {
                id: 'q-default-availability',
                category: 'Availability',
                question: 'Please confirm your availability for this job. If not available immediately, how early would you be able to join?',
                input_type: 'long_text',
                is_required: true,
                is_custom: false
            }
        ],
        status: 'open',
        deadline: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const commonQuestions = [
        { category: 'Cover Letter', question: 'Please provide a cover letter.', type: 'long_text' },
        { category: 'Work Experience', question: 'How many years of relevant experience do you have?', type: 'numeric' },
        { category: 'Education', question: 'What is your highest level of education?', type: 'short_text' },
        { category: 'Visa Status', question: 'Do you require visa sponsorship?', type: 'yes_no' },
        { category: 'Language', question: 'Are you proficient in English?', type: 'yes_no' },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSalaryChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            salary: { ...prev.salary, [name]: value }
        }));
    };

    const addQuestion = (q) => {
        const newQ = {
            id: `q-${Date.now()}`,
            category: q.category || 'Custom',
            question: q.question || '',
            input_type: q.type || 'short_text',
            is_required: true,
            is_custom: !q.category
        };
        setFormData(prev => ({
            ...prev,
            screening_questions: [...prev.screening_questions, newQ]
        }));
    };

    const removeQuestion = (id) => {
        setFormData(prev => ({
            ...prev,
            screening_questions: prev.screening_questions.filter(q => q.id !== id)
        }));
    };

    const updateQuestion = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            screening_questions: prev.screening_questions.map(q =>
                q.id === id ? { ...q, [field]: value } : q
            )
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onJobPosted(formData);
            setStep(4); // Success step
        } catch (error) {
            alert("Error posting job: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <div className="form-step active-step">
            <div className="step-header-block">
                <Briefcase size={28} className="text-primary" />
                <div className="step-title-text">
                    <h2>Job Overview</h2>
                    <p>Provide the foundational details of the position.</p>
                </div>
            </div>

            <div className="modern-form-grid">
                <div className="form-group">
                    <label>Job Title*</label>
                    <div className="input-with-icon">
                        <Briefcase size={18} />
                        <input
                            type="text"
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleInputChange}
                            placeholder="e.g. Senior Backend Engineer"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Company Name*</label>
                    <div className="input-with-icon">
                        <Building2 size={18} />
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Hiring Company"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Workplace Type*</label>
                    <div className="input-with-icon">
                        <MapPin size={18} />
                        <select name="workplace_type" value={formData.workplace_type} onChange={handleInputChange}>
                            <option>In Office</option>
                            <option>Hybrid</option>
                            <option>Remote</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Job Location*</label>
                    <div className="input-with-icon">
                        <MapPin size={18} />
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="City, State"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Job Type*</label>
                    <div className="input-with-icon">
                        <Clock size={18} />
                        <select name="job_type" value={formData.job_type} onChange={handleInputChange}>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Application Deadline</label>
                    <div className="input-with-icon">
                        <Clock size={18} />
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label>Job Description & Requirements*</label>
                    <div className="textarea-wrapper">
                        <textarea
                            name="description"
                            rows="10"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Outline the responsibilities, required skills, and what makes this role unique..."
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="form-step active-step">
            <div className="step-header-block">
                <DollarSign size={28} className="text-primary" />
                <div className="step-title-text">
                    <h2>Compensation Details</h2>
                    <p>Add salary information to attract the right candidates (optional).</p>
                </div>
            </div>
            <div className="modern-form-grid">
                <div className="form-group">
                    <label>Salary Range</label>
                    <div className="input-with-icon">
                        <DollarSign size={18} />
                        <input
                            type="text"
                            name="range"
                            value={formData.salary.range}
                            onChange={handleSalaryChange}
                            placeholder="e.g. $80k - $120k"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Pay Type</label>
                    <div className="input-with-icon">
                        <Clock size={18} />
                        <select name="pay_type" value={formData.salary.pay_type} onChange={handleSalaryChange}>
                            <option>Yearly</option>
                            <option>Monthly</option>
                            <option>Hourly</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );


    const renderStep3 = () => (
        <div className="form-step active-step">
            <div className="step-header-block">
                <HelpCircle size={28} className="text-primary" />
                <div className="step-title-text">
                    <h2>Screening Questions</h2>
                    <p>Add questions to pre-filter candidates during the application process.</p>
                </div>
            </div>

            <div className="questions-list">
                {formData.screening_questions.map((q, idx) => (
                    <div key={q.id} className="question-item card">
                        <div className="q-header">
                            <span className="q-category">{q.category}</span>
                            {!q.id.includes('default') && (
                                <button className="btn-ghost text-red" onClick={() => removeQuestion(q.id)}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                value={q.question}
                                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                placeholder="Edit question text..."
                            />
                        </div>
                        <div className="q-meta">
                            <select value={q.input_type} onChange={(e) => updateQuestion(q.id, 'input_type', e.target.value)}>
                                <option value="short_text">Short Text</option>
                                <option value="long_text">Long Text</option>
                                <option value="yes_no">Yes / No</option>
                                <option value="numeric">Numeric</option>
                                <option value="multiple_choice">Multiple Choice</option>
                            </select>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={q.is_required}
                                    onChange={(e) => updateQuestion(q.id, 'is_required', e.target.checked)}
                                />
                                Required
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="suggested-questions">
                <h3>Suggested Questions</h3>
                <div className="suggestion-tags">
                    {commonQuestions.map((q, i) => (
                        <button key={i} className="btn-tag" onClick={() => addQuestion(q)}>
                            <Plus size={14} /> {q.category}
                        </button>
                    ))}
                    <button className="btn-tag btn-primary-light" onClick={() => addQuestion({ question: '', type: 'short_text' })}>
                        <Plus size={14} /> Custom Question
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="success-step text-center">
            <div className="success-icon-large">
                <CheckCircle2 size={80} className="text-green" />
            </div>
            <h2>Job Posted Successfully!</h2>
            <p>Your job is now active and ready for candidates to apply.</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Post Another Job
            </button>
        </div>
    );

    return (
        <div className="post-job-container">
            <div className="step-indicator">
                {[
                    { num: 1, label: 'Job Overview', icon: <Briefcase size={18} /> },
                    { num: 2, label: 'Compensation', icon: <DollarSign size={18} /> },
                    { num: 3, label: 'Screening', icon: <HelpCircle size={18} /> }
                ].map((s, idx, arr) => (
                    <React.Fragment key={s.num}>
                        <div className={`step-item ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}>
                            <div className="step-dot-wrapper">
                                <div className="step-dot">
                                    {step > s.num ? <CheckCircle2 size={20} /> : s.icon}
                                </div>
                            </div>
                            <span className="step-label">{s.label}</span>
                        </div>
                        {idx < arr.length - 1 && (
                            <div className={`step-connector ${step > s.num ? 'completed' : ''}`}>
                                <div className="step-connector-fill" />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="post-job-content card">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderSuccess()}
                    </motion.div>
                </AnimatePresence>

                {step < 4 && (
                    <div className="step-footer">
                        {step > 1 && (
                            <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
                                <ChevronLeft size={18} /> Back
                            </button>
                        )}
                        <div style={{ marginLeft: 'auto' }}>
                            {step < 3 ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 && (!formData.job_title || !formData.company || !formData.description)}
                                >
                                    Continue <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? 'Posting...' : 'Publish Job'} <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostJobPage;
