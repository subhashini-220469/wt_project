import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, DollarSign, Briefcase, ChevronRight, Filter, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { getResumeData } from '../utils/resumeStorage';

const JobDiscoveryPage = ({ onApply, targetJobId, targetAction, onTargetConsumed }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [quickScores, setQuickScores] = useState({}); // jobId -> score
    const [scoringFor, setScoringFor] = useState(null); // jobId being scored
    const [appliedJobIds, setAppliedJobIds] = useState(new Set()); // Track applied jobs
    const [highlightedJobId, setHighlightedJobId] = useState(null);
    const jobCardRefs = useRef({});

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await apiService.fetchJobs();
                setJobs(data.filter(j => j.status === 'open' || j.status === 'expired'));
            } catch (err) {
                console.error("Error fetching jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();

        // Load user's existing applications to mark already-applied jobs
        const loadAppliedJobs = async () => {
            try {
                let lookupEmail = localStorage.getItem('userEmail');
                const savedResume = getResumeData();
                
                if (savedResume) {
                    lookupEmail = savedResume.resume_data?.email || lookupEmail;
                } else if (lookupEmail) {
                    // Try to recover profile from DB if local is empty
                    try {
                        const dbProfile = await apiService.getProfile(lookupEmail);
                        if (dbProfile) {
                            lookupEmail = dbProfile.resume_data?.email || lookupEmail;
                        }
                    } catch (e) { /* silent fail for recovery */ }
                }

                if (!lookupEmail) return;

                const apps = await apiService.fetchMyApplications(lookupEmail);
                setAppliedJobIds(new Set(apps.map(a => a.jd_id)));
            } catch (err) {
                console.error("Could not load applied jobs:", err);
            }
        };
        loadAppliedJobs();
    }, []);

    // Deep-link: scroll to & highlight the target job, trigger apply if needed
    useEffect(() => {
        if (!targetJobId || loading || jobs.length === 0) return;

        setHighlightedJobId(targetJobId);

        // Give React time to render the card into the ref map
        setTimeout(() => {
            const el = jobCardRefs.current[targetJobId];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            if (targetAction === 'apply') {
                const job = jobs.find(j => j._id === targetJobId);
                if (job && !appliedJobIds.has(job._id) && job.status !== 'expired') {
                    onApply(job);
                }
            }

            // Clear the pending state so it doesn't re-trigger
            if (onTargetConsumed) onTargetConsumed();
        }, 400);
    }, [targetJobId, loading, jobs]);

    const handleQuickScore = async (jobId) => {
        const candidateInfo = getResumeData();
        if (!candidateInfo) {
            alert("Please upload your Master Resume first in the 'My Resume' tab to use this feature.");
            return;
        }

        setScoringFor(jobId);

        try {
            // Updated path based on new backend return structure
            const res = await apiService.checkAtsScore(jobId, candidateInfo.resume_data);
            setQuickScores(prev => ({ ...prev, [jobId]: res.total_score }));
        } catch (err) {
            alert("Score check failed: " + err.message);
        } finally {
            setScoringFor(null);
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-state">
                <motion.div
                    className="spin"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <Briefcase size={40} className="text-primary" />
                </motion.div>
                <p>Finding the perfect opportunities for you...</p>
            </div>
        );
    }

    return (
        <div className="discovery-container">
            <div className="search-bar-row card">
                <div className="search-input-wrapper">
                    <Search size={20} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search by title or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline">
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="jobs-list-grid">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => {
                        const alreadyApplied = appliedJobIds.has(job._id);
                        return (
                            <motion.div
                                key={job._id}
                                ref={el => jobCardRefs.current[job._id] = el}
                                className={`job-discovery-card card${highlightedJobId === job._id ? ' job-card-highlighted' : ''}`}
                                whileHover={{ scale: 1.01, translateY: -2 }}
                            >
                                <div className="job-card-top">
                                    <div className="company-logo-placeholder">
                                        {(job.company?.trim() || job.job_title?.trim() || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="job-title-info">
                                        <h3>{job.job_title}</h3>
                                        <p className="company-name">{job.company}</p>
                                    </div>
                                    <div className="job-type-badge">{job.job_type}</div>
                                </div>

                                <div className="job-meta-row">
                                    <div className="meta-item">
                                        <MapPin size={16} /> <span>{job.location} ({job.workplace_type})</span>
                                    </div>
                                    {job.salary && job.salary.range && (
                                        <div className="meta-item text-green">
                                            <DollarSign size={16} /> <span>{job.salary.range} / {job.salary.pay_type}</span>
                                        </div>
                                    )}
                                    {job.deadline && (
                                        <div className="meta-item">
                                            <Clock size={16} /> <span>Ends: {new Date(job.deadline).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="job-desc-preview">
                                    {job.description.substring(0, 160)}...
                                </div>

                                <div className="job-card-footer">
                                    <div className="quick-score-result">
                                        {quickScores[job._id] !== undefined ? (
                                            <div className="ats-mini-result">
                                                <span className="label">Your Match:</span>
                                                <span className={`value ${quickScores[job._id] > 70 ? 'high' : 'low'}`}>
                                                    {Math.round(quickScores[job._id])}%
                                                </span>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleQuickScore(job._id)}
                                                disabled={scoringFor === job._id}
                                            >
                                                <BrainCircuit size={16} className={scoringFor === job._id ? 'spin' : ''} />
                                                {scoringFor === job._id ? 'Checking...' : 'Check ATS Score'}
                                            </button>
                                        )}
                                    </div>

                                    {alreadyApplied ? (
                                        <button
                                            className="btn"
                                            disabled
                                            style={{
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981',
                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                cursor: 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontWeight: 700
                                            }}
                                        >
                                            <CheckCircle2 size={16} /> Already Applied
                                        </button>
                                    ) : job.status === 'expired' ? (
                                        <button
                                            className="btn"
                                            disabled
                                            style={{
                                                background: 'var(--border-color)',
                                                color: 'var(--text-muted)',
                                                cursor: 'not-allowed',
                                                fontWeight: 700
                                            }}
                                        >
                                            Expired
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => onApply(job)}>
                                            Apply Now <ChevronRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="empty-jobs text-center">
                        <p>No jobs found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDiscoveryPage;
