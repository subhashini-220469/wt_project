import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Briefcase, FileDown, ExternalLink } from 'lucide-react';

const DashboardPage = ({ results }) => {
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
    );
};

export default DashboardPage;
