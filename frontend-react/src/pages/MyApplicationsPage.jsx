import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle2, Clock, Search, Filter, ArrowRight, ChevronRight, FileText, BarChart3 } from 'lucide-react';
import { apiService } from '../services/api';

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        // Use the resume's email (same one submitted with applications)
        // Fall back to login email only if no resume is saved
        const savedResume = localStorage.getItem('candidate_resume_data');
        let lookupEmail = localStorage.getItem('userEmail');

        if (savedResume) {
            try {
                const parsed = JSON.parse(savedResume);
                lookupEmail = parsed.resume_data?.email || lookupEmail;
            } catch (e) { /* ignore parse errors */ }
        }

        if (!lookupEmail) {
            setError("No user email found. Please sign in again.");
            setLoading(false);
            return;
        }

        const loadApps = async () => {
            try {
                const data = await apiService.fetchMyApplications(lookupEmail);
                setApplications(data);
            } catch (err) {
                setError("Failed to load your applications. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadApps();
    }, []);

    const filteredApps = applications.filter(app => {
        const matchesSearch = app.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'applied': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: <Clock size={14} /> };
            case 'shortlisted': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: <CheckCircle2 size={14} /> };
            case 'interviewed': return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', icon: <Calendar size={14} /> };
            default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', icon: <Clock size={14} /> };
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ padding: '4rem', textAlign: 'center' }}>
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    style={{ marginBottom: '1rem', color: 'var(--primary)' }}
                >
                    <Clock size={40} />
                </motion.div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Fetching your career progress...</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="my-apps-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}
        >
            <div className="page-header-combined" style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
                <span className="hero-badge">Application Tracking</span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 850, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Your <span style={{ color: 'var(--primary)' }}>Applications</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Track all your active applications and view their real-time status.
                </p>
            </div>

            {error ? (
                <div className="error-state" style={{ padding: '3rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <p style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 600 }}>{error}</p>
                </div>
            ) : (
                <>
                    <div className="filter-bar" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                        <div className="search-box-apps" style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by job title..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1rem 0.85rem 3rem',
                                    borderRadius: '14px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--card-bg)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    caretColor: 'var(--primary)'
                                }}
                            />
                        </div>
                        <div className="status-pills" style={{ display: 'flex', gap: '0.5rem' }}>
                            {['all', 'applied', 'shortlisted', 'interviewed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        borderRadius: '100px',
                                        border: '1px solid',
                                        borderColor: statusFilter === status ? 'var(--primary)' : 'var(--border-color)',
                                        background: statusFilter === status ? 'var(--primary)' : 'var(--card-bg)',
                                        color: statusFilter === status ? '#fff' : 'var(--text-main)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="apps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        <AnimatePresence>
                            {filteredApps.length > 0 ? (
                                filteredApps.map((app, index) => {
                                    const statusObj = getStatusColor(app.status);
                                    return (
                                        <motion.div
                                            key={app._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="app-card-item"
                                            style={{
                                                background: 'var(--card-bg)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '24px',
                                                padding: '1.75rem',
                                                boxShadow: 'var(--glass-shadow)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                                <div className="app-icon-box" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                    <Briefcase size={22} />
                                                </div>
                                                <div style={{ 
                                                    padding: '6px 14px', 
                                                    borderRadius: '100px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 700, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '6px',
                                                    background: statusObj.bg,
                                                    color: statusObj.color,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {statusObj.icon} {app.status || 'Applied'}
                                                </div>
                                            </div>

                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{app.job_title}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Applied on {new Date(app.applied_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                                            <div className="app-stats-row" style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>ATS Score</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <BarChart3 size={16} color="var(--primary)" />
                                                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{app.score?.total_score || 0}%</span>
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Resume</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                                        <FileText size={16} style={{ opacity: 0.6 }} />
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{app.filename?.slice(0, 15)}...</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ x: 5 }}
                                                style={{
                                                    marginTop: '1.5rem',
                                                    width: '100%',
                                                    padding: '0.8rem',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    background: 'var(--secondary)',
                                                    color: 'var(--primary)',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                View Details <ArrowRight size={16} />
                                            </motion.button>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0' }}>
                                    <div style={{ opacity: 0.2, marginBottom: '1.5rem' }}>
                                        <Briefcase size={80} style={{ margin: '0 auto' }} />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No applications found</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>You haven't applied to any roles matching your filters yet.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default MyApplicationsPage;
