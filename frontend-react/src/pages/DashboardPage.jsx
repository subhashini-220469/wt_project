import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    CalendarCheck2,
    TrendingUp,
    RefreshCw,
    ArrowRight,
    Trophy,
    Target,
    ChevronLeft,
    ChevronRight,
    Briefcase
} from 'lucide-react';
import { apiService } from '../services/api';

const DashboardPage = ({ results }) => {
    const handleExportCSV = () => {
    let csvRows = [];

    // CSV headers
    csvRows.push(["Rank", "Candidate Name", "Match Score"]);

    // Check if candidates exist
    if (results?.top_candidates && results.top_candidates.length > 0) {
        results.top_candidates.forEach((candidate, idx) => {
            csvRows.push([
                idx + 1,
                candidate.name || "N/A",
                `${candidate.score || 0}%`
            ]);
        });
    } else {
        // If no records
        csvRows.push(["No Records Found", "", ""]);
    }

    // Convert to CSV string
    const csvContent =
        "data:text/csv;charset=utf-8," +
        csvRows.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);

    // Create download link
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "candidate_results.csv");
    document.body.appendChild(link);

    link.click();
    };
    return (
        <motion.section
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
                <button className="btn btn-success" id="export-btn" onClick={handleExportCSV}>
                    <FileDown size={18} />
                    Export CSV
                </button>
const DashboardPage = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [overall, setOverall] = useState({ total_applied: 0, total_selected: 0, total_interviews: 0 });
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await apiService.fetchAnalytics();
            setStats(data);

            const totals = data.reduce((acc, curr) => ({
                total_applied: acc.total_applied + curr.total_applied,
                total_selected: acc.total_selected + curr.selected,
                total_interviews: acc.total_interviews + curr.interviews_done
            }), { total_applied: 0, total_selected: 0, total_interviews: 0 });

            setOverall(totals);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spin"><Target size={40} className="text-primary" /></div>
                <p>Generating recruitment insights...</p>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            {/* Top Overview Cards */}
            <div className="stats-summary-grid">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="stat-summary-card">
                    <div className="icon-box bg-blue-light"><Users size={28} /></div>
                    <div className="stat-content">
                        <span className="label">Total Applications</span>
                        <h3>{overall.total_applied}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-summary-card">
                    <div className="icon-box bg-green-light"><Trophy size={28} /></div>
                    <div className="stat-content">
                        <span className="label">Qualified Assets</span>
                        <h3>{overall.total_selected}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-summary-card">
                    <div className="icon-box bg-purple-light"><CalendarCheck2 size={28} /></div>
                    <div className="stat-content">
                        <span className="label">Interview Pipeline</span>
                        <h3>{overall.total_interviews}</h3>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-summary-card">
                    <div className="icon-box bg-orange-light"><TrendingUp size={28} /></div>
                    <div className="stat-content">
                        <span className="label">Hiring Quality</span>
                        <h3>{overall.total_applied > 0 ? Math.round((overall.total_selected / overall.total_applied) * 100) : 0}%</h3>
                    </div>
                </motion.div>
            </div>

            <div className="analytics-table-header">
                <h2 style={{ fontSize: '1.8rem', fontWeight: 850 }}>
                    {selectedJob ? 'Hiring Funnel Details' : 'Job Performance Index'}
                </h2>
                <div className="header-actions">
                    {selectedJob && (
                        <button className="btn btn-outline" onClick={() => setSelectedJob(null)}>
                            <ChevronLeft size={18} /> Back to List
                        </button>
                    )}
                    <button className="btn btn-ghost" onClick={loadData}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!selectedJob ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="analytics-list-view"
                    >
                        <div className="jobs-selection-grid">
                            {stats.length > 0 ? stats.map((row, idx) => (
                                <motion.div
                                    key={row.job_id}
                                    whileHover={{ scale: 1.02, translateY: -4 }}
                                    className="job-summary-card card clickable"
                                    onClick={() => setSelectedJob(row)}
                                >
                                    <div className="job-summary-top">
                                        <div className="job-icon-circle">
                                            <Briefcase size={24} />
                                        </div>
                                        <div className="job-basic-info">
                                            <h3>{row.job_title}</h3>
                                            <p>{row.company}</p>
                                        </div>
                                        <div className={`status-pill ${row.status}`}>
                                            {row.status}
                                        </div>
                                    </div>
                                    <div className="job-summary-stats">
                                        <div className="mini-stat">
                                            <span className="mini-label">Applied</span>
                                            <span className="mini-value">{row.total_applied}</span>
                                        </div>
                                        <div className="mini-stat separator"></div>
                                        <div className="mini-stat">
                                            <span className="mini-label">Efficiency</span>
                                            <span className="mini-value text-primary">
                                                {row.total_applied > 0 ? Math.round((row.selected / row.total_applied) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="view-details-arrow">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="card py-12 text-center text-muted full-width">
                                    <p>No recruitment data available. Post a job to begin tracking.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="performance-card detail-view"
                    >
                        <div className="performance-header">
                            <div className="title-area">
                                <h3>{selectedJob.job_title} Analysis</h3>
                                <p>{selectedJob.company} • <strong>{selectedJob.status.toUpperCase()}</strong></p>
                            </div>
                            <div className={`status-indicator-pill ${selectedJob.status === 'open' ? 'bg-green-light' : 'bg-orange-light'}`}>
                                {selectedJob.status}
                            </div>
                        </div>

                        <div className="funnel-visual">
                            <div className="funnel-step applied">
                                <span className="count">{selectedJob.total_applied}</span>
                                <span className="step-label">Applied</span>
                            </div>
                            <div className="funnel-arrow"><ArrowRight size={32} /></div>
                            <div className="funnel-step selected">
                                <span className="count">{selectedJob.selected}</span>
                                <span className="step-label">Shortlisted</span>
                            </div>
                            <div className="funnel-arrow"><ArrowRight size={32} /></div>
                            <div className="funnel-step interviewed">
                                <span className="count">{selectedJob.interviews_done}</span>
                                <span className="step-label">Interviewed</span>
                            </div>
                        </div>

                        <div className="efficiency-track">
                            <div className="track-label">
                                <span>Hiring Efficiency (Qualitative Conversion)</span>
                                <span className="percentage">
                                    {selectedJob.total_applied > 0 ? Math.round((selectedJob.selected / selectedJob.total_applied) * 100) : 0}%
                                </span>
                            </div>
                            <div className="track-bar-outer">
                                <motion.div
                                    className="track-bar-inner"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selectedJob.total_applied > 0 ? (selectedJob.selected / selectedJob.total_applied) * 100 : 0}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardPage;
