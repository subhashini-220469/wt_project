import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Briefcase,
    Users,
    Calendar,
    ToggleLeft,
    ToggleRight,
    Trash2,
    ChevronRight,
    Search,
    Filter,
    MoreVertical
} from 'lucide-react';
import { apiService } from '../services/api';

const ManagedJobsPage = ({ onViewAnalytics }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await apiService.fetchJobs();
            setJobs(data);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (jobId, currentStatus) => {
        const newStatus = currentStatus === 'open' ? 'closed' : 'open';
        try {
            await apiService.updateJobStatus(jobId, newStatus);
            setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
        } catch (err) {
            alert("Failed to update status: " + err.message);
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job and all its applications?")) return;
        try {
            await apiService.deleteJob(jobId);
            setJobs(prev => prev.filter(j => j._id !== jobId));
        } catch (err) {
            alert("Failed to delete job: " + err.message);
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spin"><Briefcase size={40} className="text-primary" /></div>
                <p>Loading your job board...</p>
            </div>
        );
    }

    return (
        <div className="managed-jobs-container">
            <div className="search-bar-row card">
                <div className="search-input-wrapper">
                    <Search size={20} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search managed jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline">
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="jobs-table card">
                <table>
                    <thead>
                        <tr>
                            <th>Job Details</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobs.length > 0 ? filteredJobs.map(job => (
                            <tr key={job._id}>
                                <td>
                                    <div className="job-cell-info">
                                        <strong>{job.job_title}</strong>
                                        <span className="text-muted text-xs">{job.location} • {job.job_type}</span>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className={`status-toggle-btn ${job.status === 'open' ? 'active' : 'inactive'}`}
                                        onClick={() => toggleStatus(job._id, job.status)}
                                    >
                                        {job.status === 'open' ? <ToggleRight size={24} className="text-green" /> : <ToggleLeft size={24} className="text-muted" />}
                                        <span className="capitalize">{job.status}</span>
                                    </button>
                                </td>
                                <td>
                                    <div className="date-cell">
                                        <Calendar size={14} className="text-muted" />
                                        <span>{new Date(parseInt(job._id.substring(0, 8), 16) * 1000).toLocaleDateString() || 'N/A'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button
                                            className="btn btn-sm btn-primary-light"
                                            onClick={() => onViewAnalytics(job)}
                                        >
                                            <Users size={16} /> Candidates
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline text-red"
                                            onClick={() => handleDelete(job._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-muted">
                                    No managed jobs found. Start by posting a new job!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagedJobsPage;
