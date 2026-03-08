import React, { useState, useRef, useEffect } from 'react';
import {
    Upload,
    LayoutDashboard,
    FileText,
    Users,
    UserCheck,
    Briefcase,
    FileDown,
    X,
    Plus,
    Wand2,
    CheckCircle2,
    Loader2,
    ExternalLink,
    Mail,
    ChevronRight,
    Search,
    Edit3,
    Check,
    AlertCircle,
    PartyPopper,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8000";

function App() {
    const [activeTab, setActiveTab] = useState('upload');
    const [jdText, setJdText] = useState('');
    const [files, setFiles] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [processingStatus, setProcessingStatus] = useState([]);
    const fileInputRef = useRef(null);

    // Email Automation State
    const [jdsList, setJdsList] = useState([]);
    const [selectedJd, setSelectedJd] = useState(null);
    const [candidatesForJd, setCandidatesForJd] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [emailSubject, setEmailSubject] = useState("Interview Shortlist Invitation");
    const [emailBody, setEmailBody] = useState("Congratulations you have been shortlisted for interview ,interview timinings will be scheduled within a week");
    const [isSendingEmails, setIsSendingEmails] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Status tracking for each candidate's email
    // Map of email -> status ('waiting', 'sending', 'success', 'error')
    const [candidateStatuses, setCandidateStatuses] = useState({});
    const [allFinished, setAllFinished] = useState(false);

    // Fetch JDs for Automation Tab
    useEffect(() => {
        if (activeTab === 'automation') {
            fetch(`${API_BASE}/jds`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setJdsList(data);
                    }
                })
                .catch(err => console.error("Failed to fetch JDs", err));
        }
    }, [activeTab]);

    // Fetch Candidates when a JD is selected
    useEffect(() => {
        if (selectedJd) {
            setCandidateStatuses({});
            setAllFinished(false);
            fetch(`${API_BASE}/results/${selectedJd._id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setCandidatesForJd(data);
                        const shortlisted = data
                            .filter(c => {
                                const score = c.score?.total_score ?? c.score ?? 0;
                                return score >= 70;
                            })
                            .map(c => c.resume_data?.email)
                            .filter(email => !!email);
                        setSelectedCandidates(shortlisted);
                    }
                })
                .catch(err => console.error("Failed to fetch results", err));
        }
    }, [selectedJd]);

    const sendSingleEmail = async (email) => {
        setCandidateStatuses(prev => ({ ...prev, [email]: 'sending' }));
        try {
            const response = await fetch(`${API_BASE}/send-emails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jd_id: selectedJd._id,
                    recipient_emails: [email],
                    subject: emailSubject,
                    body: emailBody
                })
            });

            if (response.ok) {
                setCandidateStatuses(prev => ({ ...prev, [email]: 'success' }));
                return true;
            } else {
                setCandidateStatuses(prev => ({ ...prev, [email]: 'error' }));
                return false;
            }
        } catch (error) {
            setCandidateStatuses(prev => ({ ...prev, [email]: 'error' }));
            return false;
        }
    };

    const handleSendBroadcast = async () => {
        if (selectedCandidates.length === 0) return alert("Select at least one candidate.");

        setIsSendingEmails(true);
        setAllFinished(false);

        // Reset statuses for selected only
        const initial = {};
        selectedCandidates.forEach(email => initial[email] = 'waiting');
        setCandidateStatuses(prev => ({ ...prev, ...initial }));

        for (const email of selectedCandidates) {
            // Only send if it's not already successful
            if (candidateStatuses[email] !== 'success') {
                await sendSingleEmail(email);
            }
        }

        setIsSendingEmails(false);
        setAllFinished(true);
    };

    const handleRetry = async (e, email) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSendingEmails(true);
        await sendSingleEmail(email);
        setIsSendingEmails(false);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const toggleCandidate = (email) => {
        if (isSendingEmails) return;
        setSelectedCandidates(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const handleAnalyze = async () => {
        if (files.length === 0) return alert("Please upload at least one resume.");
        if (!jdText.trim()) return alert("Please provide a Job Description.");

        setIsAnalyzing(true);
        setProcessingStatus(files.map(f => ({ name: f.name, status: 'waiting' })));

        try {
            const formData = new FormData();
            formData.append('jd_text', jdText);
            files.forEach(file => formData.append('files', file));

            const response = await fetch(`${API_BASE}/process`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Backend error");

            const data = await response.json();

            setTimeout(() => {
                setResults(data);
                setIsAnalyzing(false);
                setActiveTab('dashboard');
            }, 1000);

        } catch (error) {
            console.error(error);
            alert("Error connecting to backend? Make sure it's running.");
            setIsAnalyzing(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="app-container">
            {/* Modal for Editing Email Content */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Edit Email Template</h2>
                                <button className="btn-ghost" onClick={() => setShowEditModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="email-editor">
                                <div className="input-group">
                                    <label>Subject Line</label>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Enter email subject..."
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Email Body</label>
                                    <textarea
                                        rows="8"
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        placeholder="Write your invitation message here..."
                                    />
                                </div>
                                <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-primary" onClick={() => setShowEditModal(false)}>
                                        <Check size={18} /> Save & Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <aside className="sidebar">
                <div className="logo">
                    <Wand2 size={24} />
                    <span>HireAI Pro</span>
                </div>
                <nav className="nav-menu">
                    <button
                        className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        <Upload size={18} />
                        <span>Upload & Screen</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'automation' ? 'active' : ''}`}
                        onClick={() => setActiveTab('automation')}
                    >
                        <Mail size={18} />
                        <span>Email Automation</span>
                    </button>
                </nav>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <h1>
                        {activeTab === 'upload' ? 'AI-Assisted Resume Screening' :
                            activeTab === 'dashboard' ? 'Shortlisted Candidates' :
                                'Email Automation'}
                    </h1>
                    <div className="user-profile">
                        <img src={`https://ui-avatars.com/api/?name=HR+Admin&background=6366f1&color=fff`} alt="Profile" />
                    </div>
                </header>

                <div className="content-wrapper">
                    <AnimatePresence mode="wait">
                        {activeTab === 'upload' && (
                            <motion.section
                                key="upload"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="view-section active-section"
                            >
                                <div className="upload-grid">
                                    <div className="card">
                                        <div className="card-header">
                                            <FileText size={20} className="text-accent" />
                                            <h2>1. Job Description</h2>
                                        </div>
                                        <p className="card-desc">Define the role requirements to match candidates accurately.</p>
                                        <div className="input-group">
                                            <textarea
                                                id="jd-text"
                                                rows="12"
                                                placeholder="e.g. Senior Frontend Engineer with React experience..."
                                                value={jdText}
                                                onChange={(e) => setJdText(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="card-header">
                                            <Users size={20} className="text-accent" />
                                            <h2>2. Candidate Resumes</h2>
                                        </div>
                                        <p className="card-desc">Upload PDFs/DOCXs for AI processing.</p>

                                        <div
                                            className="file-drop-area large"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={onDrop}
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <Plus size={40} className="text-muted" />
                                            <span>Drag & Drop or Click to Upload</span>
                                            <input
                                                type="file"
                                                multiple
                                                hidden
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx"
                                            />
                                        </div>

                                        <div className="uploaded-files-list">
                                            {files.map((file, idx) => (
                                                <div key={idx} className="file-item">
                                                    <div className="file-item-info">
                                                        <FileText size={16} />
                                                        <span>{file.name}</span>
                                                    </div>
                                                    <X
                                                        size={16}
                                                        className="remove-btn"
                                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="action-footer">
                                    <button className="btn btn-primary btn-large" onClick={handleAnalyze}>
                                        <Wand2 size={20} />
                                        Analyze & Score Resumes
                                    </button>
                                </div>
                            </motion.section>
                        )}

                        {activeTab === 'dashboard' && (
                            <motion.section
                                key="dashboard"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="view-section active-section"
                            >
                                <div className="dashboard-header">
                                    <div>
                                        <h2>Match Results</h2>
                                        <p>AI Ranking for: <span className="text-primary font-bold">{results?.job_title || "Processed JD"}</span></p>
                                    </div>
                                    <button className="btn btn-success">
                                        <FileDown size={18} />
                                        Export CSV
                                    </button>
                                </div>

                                <div className="stats-row">
                                    <div className="stat-card">
                                        <Users size={32} className="text-blue" />
                                        <div className="stat-info">
                                            <h3>Total Processed</h3>
                                            <p>{results?.total_processed || 0}</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <UserCheck size={32} className="text-green" />
                                        <div className="stat-info">
                                            <h3>Shortlisted</h3>
                                            <p>{results?.top_candidates?.filter(c => (c.score || 0) >= 70).length || 0}</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <Briefcase size={32} className="text-orange" />
                                        <div className="stat-info">
                                            <h3>Target Role</h3>
                                            <p className="truncate-text">{results?.job_title || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-container card">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th>Candidate Name</th>
                                                <th>Match Score</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results?.top_candidates?.map((candidate, idx) => (
                                                <tr key={idx}>
                                                    <td>#{idx + 1}</td>
                                                    <td><strong>{candidate.name}</strong></td>
                                                    <td>
                                                        <span className={`score-badge ${candidate.score >= 80 ? 'score-high' : candidate.score >= 60 ? 'score-med' : 'score-low'}`}>
                                                            {candidate.score}% Match
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn-icon">
                                                            <ExternalLink size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!results && <p className="empty-state">No analysis results yet. Process resumes to see rankings.</p>}
                                </div>
                            </motion.section>
                        )}

                        {activeTab === 'automation' && (
                            <motion.section
                                key="automation"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="view-section active-section"
                            >
                                <div className="automation-grid">
                                    <div className="card jd-selector-card">
                                        <div className="card-header">
                                            <Search size={18} className="text-accent" />
                                            <h2>Select Job Description</h2>
                                        </div>
                                        <div className="jd-list-container">
                                            {jdsList.length === 0 ? (
                                                <p className="empty-msg">No Job Descriptions found.</p>
                                            ) : (
                                                jdsList.map(jd => (
                                                    <div
                                                        key={jd._id}
                                                        className={`jd-list-item ${selectedJd?._id === jd._id ? 'selected' : ''}`}
                                                        onClick={() => setSelectedJd(jd)}
                                                    >
                                                        <div>
                                                            <h4>{jd.structured_data?.job_title || "Untitled Job"}</h4>
                                                            <span className="jd-info-span">{formatDate(jd.created_at)}</span>
                                                        </div>
                                                        <ChevronRight size={16} />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="card email-config-card">
                                        {!selectedJd ? (
                                            <div className="empty-selection">
                                                <Mail size={48} />
                                                <p>Select a Job Description to start</p>
                                            </div>
                                        ) : (
                                            <div className="automation-form">
                                                <div className="automation-header-top">
                                                    <div className="header-info">
                                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Candidate Outreach</h2>
                                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>JD: <strong>{selectedJd.structured_data?.job_title}</strong></p>
                                                    </div>
                                                    <button
                                                        className="btn btn-outline"
                                                        onClick={() => setShowEditModal(true)}
                                                        disabled={isSendingEmails}
                                                    >
                                                        <Edit3 size={16} /> Template
                                                    </button>
                                                </div>

                                                <div className="candidate-checklist">
                                                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Recipients ({selectedCandidates.length})</h3>
                                                    <div className="checklist-container">
                                                        {candidatesForJd.map(c => {
                                                            const email = c.resume_data?.email;
                                                            const status = candidateStatuses[email];
                                                            const isSelected = selectedCandidates.includes(email);

                                                            return (
                                                                <div key={c._id} className="check-item">
                                                                    <div className="check-main">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => toggleCandidate(email)}
                                                                            disabled={isSendingEmails || status === 'success'}
                                                                        />
                                                                        <div className="check-info">
                                                                            <strong>{c.resume_data?.name}</strong>
                                                                            <span>{(c.score?.total_score || c.score || 0)}% • {email}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="status-indicator">
                                                                        {status === 'sending' && <Loader2 size={16} className="sending-spinner" />}
                                                                        {status === 'success' && <span className="success-badge">Sent</span>}
                                                                        {status === 'error' && (
                                                                            <button
                                                                                className="retry-btn"
                                                                                onClick={(e) => handleRetry(e, email)}
                                                                                disabled={isSendingEmails}
                                                                            >
                                                                                <RefreshCw size={12} /> Retry
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="automation-actions">
                                                    <button
                                                        className="btn btn-primary btn-large w-full"
                                                        onClick={handleSendBroadcast}
                                                        disabled={isSendingEmails || selectedCandidates.length === 0}
                                                    >
                                                        {isSendingEmails ? <Loader2 className="spin" /> : <Mail size={18} />}
                                                        {isSendingEmails ? 'Broadcasting Invitations...' : `Send Broadcast (${selectedCandidates.length})`}
                                                    </button>
                                                </div>

                                                {allFinished && (
                                                    <motion.div
                                                        className="completion-banner"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <PartyPopper size={24} />
                                                        <span>Successfully Completed!</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="scanning-overlay active"
                    >
                        <div className="scanner-box">
                            <div className="loader-container">
                                <Loader2 size={48} className="spin-slow text-primary" />
                                <div className="pulse-dot"></div>
                            </div>
                            <h3>AI Engine is Scoring...</h3>
                            <p>Analyzing semantics & skill density...</p>

                            <div className="progress-bar">
                                <motion.div
                                    className="progress"
                                    initial={{ width: "5%" }}
                                    animate={{ width: "95%" }}
                                    transition={{ duration: 10, ease: "easeInOut" }}
                                />
                            </div>

                            <div className="processing-files-preview">
                                {files.map((file, idx) => (
                                    <div key={idx} className="proc-file-item">
                                        <span>{file.name}</span>
                                        <span className="status-tag status-active">Processing</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
