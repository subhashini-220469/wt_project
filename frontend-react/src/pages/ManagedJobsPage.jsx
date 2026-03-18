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

const ManagedJobsPage = ({ onViewAnalytics, userId }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingJobId, setDeletingJobId] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchJobs();
        }
    }, [userId]);

    const fetchJobs = async () => {
        try {
            const data = await apiService.fetchJobs(userId);
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

    const handleDeleteRequest = (jobId) => {
        setDeletingJobId(jobId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deletingJobId) return;
        try {
            await apiService.deleteJob(deletingJobId);
            setJobs(prev => prev.filter(j => j._id !== deletingJobId));
            setShowDeleteConfirm(false);
            setDeletingJobId(null);
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
                                        <span>{job._id ? new Date(parseInt(job._id.substring(0, 8), 16) * 1000).toLocaleDateString() : 'N/A'}</span>
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
                                            onClick={() => handleDeleteRequest(job._id)}
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

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content" 
                        style={{ maxWidth: '400px', textAlign: 'center' }}
                    >
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ 
                                backgroundColor: '#fee2e2', 
                                padding: '1rem', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Trash2 size={32} style={{ color: '#dc2626' }} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Delete Job?</h3>
                        <p className="text-muted" style={{ marginBottom: '2rem', lineHeight: '1.5' }}>
                            Are you sure you want to delete this job and all its applications? This action cannot be undone.
                        </p>
                        <div className="modal-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                className="btn btn-outline" 
                                style={{ flex: 1 }}
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                style={{ flex: 1, backgroundColor: '#dc2626', border: 'none' }}
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManagedJobsPage;
