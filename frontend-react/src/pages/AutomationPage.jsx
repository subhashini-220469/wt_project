import React from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Mail, Edit3, Loader2, RefreshCw, PartyPopper } from 'lucide-react';

const AutomationPage = ({
    jdsList,
    selectedJd,
    setSelectedJd,
    candidatesForJd,
    selectedCandidates,
    toggleCandidate,
    candidateStatuses,
    isSendingEmails,
    handleSendBroadcast,
    handleRetry,
    setShowEditModal,
    allFinished,
    formatDate
}) => {
    return (
        <motion.section
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
                                                        <span>{(c.score?.total_score || c.score || 0).toFixed(1)}% • {email}</span>
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
    );
};

export default AutomationPage;
