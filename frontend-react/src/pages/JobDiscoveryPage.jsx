import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, DollarSign, Briefcase, ChevronRight, Filter, BrainCircuit } from 'lucide-react';
import { apiService } from '../services/api';

const JobDiscoveryPage = ({ onApply }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [quickScores, setQuickScores] = useState({}); // jobId -> score
    const [scoringFor, setScoringFor] = useState(null); // jobId being scored

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await apiService.fetchJobs();
                setJobs(data.filter(j => j.status === 'open'));
            } catch (err) {
                console.error("Error fetching jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleQuickScore = async (jobId) => {
        const saved = localStorage.getItem('candidate_resume_data');
        if (!saved) {
            alert("Please upload your Master Resume first in the 'My Resume' tab to use this feature.");
            return;
        }

        const candidateInfo = JSON.parse(saved);
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
                    filteredJobs.map((job) => (
                        <motion.div
                            key={job._id}
                            className="job-discovery-card card"
                            whileHover={{ scale: 1.01, translateY: -2 }}
                        >
                            <div className="job-card-top">
                                <div className="company-logo-placeholder">
                                    {job.company.charAt(0)}
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
                                <button className="btn btn-primary" onClick={() => onApply(job)}>
                                    Apply Now <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
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
