import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, DollarSign, Clock, Briefcase, ChevronRight } from 'lucide-react';

const JobDescriptionPage = ({ job, onApply, onBack }) => {
    if (!job) return null;

    return (
        <div className="job-description-page apply-step">
            <div className="apply-header" style={{ marginBottom: "2rem" }}>
                <button className="btn-ghost" onClick={onBack}><ChevronLeft size={20} /> Back</button>
                <h2>{job.job_title}</h2>
                <p className="text-muted">{job.company}</p>
            </div>

            <div className="card" style={{ padding: "2.5rem" }}>
                <div className="job-meta-row" style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid var(--border-color)" }}>
                    <div className="meta-item">
                        <Briefcase size={18} /> <span>{job.job_type} ({job.workplace_type})</span>
                    </div>
                    <div className="meta-item">
                        <MapPin size={18} /> <span>{job.location}</span>
                    </div>
                    {job.salary && job.salary.range && (
                        <div className="meta-item text-green">
                            <DollarSign size={18} /> <span>{job.salary.range} / {job.salary.pay_type}</span>
                        </div>
                    )}
                    {job.deadline && (
                        <div className="meta-item">
                            <Clock size={18} /> <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                <div className="job-body-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Job Description</h3>
                    {job.description}
                </div>

                <div className="action-footer" style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "600" }}>Ready to join the team?</span>
                    {job.status === 'expired' ? (
                        <button className="btn btn-large" disabled style={{ background: 'var(--border-color)', color: 'var(--text-muted)', cursor: 'not-allowed' }}>
                            Expired
                        </button>
                    ) : (
                        <button className="btn btn-primary btn-large" onClick={() => onApply(job)}>
                            Apply Now <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDescriptionPage;
