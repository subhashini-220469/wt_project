import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, BellDot, Check, X, Clock, Briefcase, UserPlus, Mail, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Components
import Sidebar from './components/Sidebar';
import ScanningOverlay from './components/ScanningOverlay';
import EmailModal from './components/EmailModal';

// Pages
import AutomationPage from './pages/AutomationPage';
import DashboardPage from './pages/DashboardPage';
import PostJobPage from './pages/PostJobPage';
import ManagedJobsPage from './pages/ManagedJobsPage';
import HomePage from './pages/HomePage';
import JobDiscoveryPage from './pages/JobDiscoveryPage';
import CandidateApplyPage from './pages/CandidateApplyPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import MyApplicationsPage from './pages/MyApplicationsPage';

// Services
import { apiService } from './services/api';
import authClient from './services/authClient';

function App() {
    const [userRole, setUserRole] = useState(() => {
        const role = localStorage.getItem('userRole');
        const token = localStorage.getItem('accessToken');
        return (role && token) ? role : null;
    }); 
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'discover');
    const [selectedJobToApply, setSelectedJobToApply] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [profileName, setProfileName] = useState(() => localStorage.getItem('userName') || 'User');
    const [userId, setUserId] = useState(() => localStorage.getItem('userId') || null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [pendingNotifJobId, setPendingNotifJobId] = useState(null);  // deep-link to a specific job
    const [pendingNotifAction, setPendingNotifAction] = useState(null); // 'view' | 'apply'
    const navigate = useNavigate();
    const notificationRef = useRef(null);

    // Secondary check on mount to ensure fully authenticated
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('userRole');
        if (!token || !role) {
            setUserRole(null);
        }
    }, []);

    // Persist role and tab
    useEffect(() => {
        if (userRole) {
            localStorage.setItem('userRole', userRole);
        } else {
            localStorage.removeItem('userRole');
        }
    }, [userRole]);

    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    // Email Automation State
    const [jdsList, setJdsList] = useState([]);
    const [selectedJd, setSelectedJd] = useState(null);
    const [candidatesForJd, setCandidatesForJd] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [emailSubject, setEmailSubject] = useState("Interview Shortlist Invitation");
    const [emailBody, setEmailBody] = useState("Congratulations you have been shortlisted for interview ,interview timinings will be scheduled within a week");
    const [isSendingEmails, setIsSendingEmails] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [candidateStatuses, setCandidateStatuses] = useState({});
    const [allFinished, setAllFinished] = useState(false);

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : false; // Default to light mode (false)
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    // Fetch JDs for Automation Tab
    useEffect(() => {
        if (activeTab === 'automation' && userId) {
            apiService.fetchJds(userId)
                .then(data => setJdsList(data))
                .catch(err => console.error("Failed to fetch JDs", err));
        }
    }, [activeTab, userId]);

    // Clear Outreach selection if job is deleted or list updated
    useEffect(() => {
        if (selectedJd) {
            const stillExists = jdsList.some(j => j._id === selectedJd._id);
            if (!stillExists) {
                setSelectedJd(null);
                setCandidatesForJd([]);
                setSelectedCandidates([]);
            }
        }
    }, [jdsList, selectedJd]);

    // Fetch Candidates when a JD is selected
    useEffect(() => {
        if (activeTab === 'automation' && selectedJd) {
            apiService.fetchResults(selectedJd._id)
                .then(data => {
                    if (Array.isArray(data)) {
                        setCandidatesForJd(data);
                        
                        // Sync statuses with Backend (already interviewed candidates are 'success')
                        const initialStatuses = {};
                        data.forEach(c => {
                            if (c.status === 'interviewed') {
                                initialStatuses[c.resume_data?.email] = 'success';
                            }
                        });
                        setCandidateStatuses(initialStatuses);

                        const shortlisted = data
                            .filter(c => {
                                const score = c.score?.total_score ?? c.score ?? 0;
                                return score >= 70;
                            })
                            .filter(c => initialStatuses[c.resume_data?.email] !== 'success') // Only uncontacted
                            .map(c => c.resume_data?.email)
                            .filter(email => !!email);
                        
                        setSelectedCandidates(shortlisted);

                        // Only show "Finished" if:
                        // 1. There was at least one candidate (any score)
                        // 2. ALL of them are already success (SENT)
                        const allCandidatesSent = data.length > 0 && data.every(c => initialStatuses[c.resume_data?.email] === 'success');
                        
                        // OR if we had shortlisted ones once and they are all gone now
                        if (allCandidatesSent) {
                            setAllFinished(true);
                        } else {
                            setAllFinished(false);
                        }
                    }
                })
                .catch(err => console.error("Failed to fetch results", err));
        } else if (activeTab !== 'automation') {
            setAllFinished(false); // Reset when leaving tab
        }
    }, [selectedJd, activeTab]);


    // Fetch Profile on mount/login
    useEffect(() => {
        if (userRole) {
            authClient.get('/api/user/profile')
                .then(res => {
                    if (res.data?.username) {
                        setProfileName(res.data.username);
                        localStorage.setItem('userName', res.data.username);
                    }
                    if (res.data?._id) {
                        setUserId(res.data._id);
                        localStorage.setItem('userId', res.data._id);
                    }
                })
                .catch(err => console.error("Failed to fetch profile initials", err));
        }
    }, [userRole]);

    // Notification Fetching
    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (userRole === 'employee' && email) {
            const loadNotifs = async () => {
                try {
                    const data = await apiService.fetchNotifications(email);
                    setNotifications(data);
                } catch (e) {
                    console.error("Failed to load notifications", e);
                }
            };
            loadNotifs();
            
            // Poll for new notifications every 60 seconds
            const interval = setInterval(loadNotifs, 60000);
            return () => clearInterval(interval);
        }
    }, [userRole]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await apiService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
        } catch (e) {
            console.error("Failed to mark as read", e);
        }
    };

    const handleMarkAllRead = async () => {
        const email = localStorage.getItem('userEmail');
        if (!email) return;
        try {
            await apiService.markAllNotificationsRead(email);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (e) {
            console.error("Failed to mark all as read", e);
        }
    };

    /* 
    // Auto mark all read when opening dropdown (Removed per new requirement)
    useEffect(() => {
        if (showNotifications && notifications.some(n => !n.is_read)) {
            handleMarkAllRead();
        }
    }, [showNotifications]);
    */

    const handleClearAll = async () => {
        const email = localStorage.getItem('userEmail');
        if (!email) return;
        try {
            await apiService.clearNotifications(email);
            // Only remove notifications that were read, as that's what the backend does
            setNotifications(prev => prev.filter(n => !n.is_read));
        } catch (e) {
            console.error("Failed to clear notifications", e);
        }
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'new_job':   return <Briefcase size={18} style={{ color: '#10b981' }} />;
            case 'deadline':  return <Clock size={18} style={{ color: '#f59e0b' }} />;
            case 'new_app':   return <UserPlus size={18} style={{ color: '#008ba3' }} />;
            case 'interview': return <Mail size={18} style={{ color: '#6366f1' }} />;
            default:          return <Bell size={18} style={{ color: '#718096' }} />;
        }
    };

    const getNotifIconBg = (type) => {
        switch (type) {
            case 'new_job':   return 'rgba(16, 185, 129, 0.1)';
            case 'deadline':  return 'rgba(245, 158, 11, 0.1)';
            case 'new_app':   return 'rgba(0, 139, 163, 0.1)';
            case 'interview': return 'rgba(99, 102, 241, 0.1)';
            default:          return 'rgba(113, 128, 150, 0.1)';
        }
    };

    const getNotifAccent = (type) => {
        switch (type) {
            case 'new_job':   return '#10b981';
            case 'deadline':  return '#f59e0b';
            case 'new_app':   return '#008ba3';
            case 'interview': return '#6366f1';
            default:          return '#718096';
        }
    };

    const getNotifAction = (n) => {
        switch (n.type) {
            case 'new_job':   return { label: 'View Job',        tab: 'discover', action: 'view' };
            case 'deadline':  return { label: 'Apply Now',       tab: 'discover', action: 'apply' };
            case 'interview': return { label: 'My Applications', tab: 'my-apps',  action: null };
            case 'new_app':   return { label: 'View Analytics',  tab: 'managed-jobs', action: null };
            default:          return null;
        }
    };

    const handleNotifNav = (n, tab, action) => {
        handleMarkRead(n._id);
        if (action && n.job_id) {
            setPendingNotifJobId(n.job_id);
            setPendingNotifAction(action);
        }
        setActiveTab(tab);
        setShowNotifications(false);
        navigate('/app');
    };

    const getRelativeTime = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1)  return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24)  return `${hrs}h ago`;
        return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Update document title dynamically based on active tab
    useEffect(() => {
        const titles = {
            'upload': 'Resume Screening | SmartHire',
            'post-job': 'Post a Job | SmartHire',
            'dashboard': 'Analytics | SmartHire',
            'automation': 'Outreach | SmartHire',
            'discover': 'Browse Jobs | SmartHire',
            'resume': 'My Resume | SmartHire',
            'my-apps': 'My Applications | SmartHire',
            'apply': 'Apply for Job | SmartHire',
            'profile': 'My Profile | SmartHire'
        };

        const pageTitle = titles[activeTab] || 'SmartHire';
        document.title = pageTitle;
    }, [activeTab]);


    const handleAnalyze = async () => {
        if (files.length === 0) return alert("Please upload at least one resume.");
        if (!jdText.trim()) return alert("Please provide a Job Description.");

        setIsAnalyzing(true);
        try {
            const data = await apiService.processResumes(jdText, files);
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

    const sendSingleEmail = async (email) => {
        setCandidateStatuses(prev => ({ ...prev, [email]: 'sending' }));
        try {
            await apiService.sendEmail({
                jd_id: selectedJd._id,
                recipient_emails: [email],
                subject: emailSubject,
                body: emailBody
            });
            setCandidateStatuses(prev => ({ ...prev, [email]: 'success' }));
            return true;
        } catch (error) {
            setCandidateStatuses(prev => ({ ...prev, [email]: 'error' }));
            return false;
        }
    };

    const handleSendBroadcast = async () => {
        if (selectedCandidates.length === 0) return alert("Select at least one candidate.");
        setIsSendingEmails(true);
        setAllFinished(false);

        const initial = {};
        selectedCandidates.forEach(email => initial[email] = 'waiting');
        setCandidateStatuses(prev => ({ ...prev, ...initial }));

        for (const email of selectedCandidates) {
            if (candidateStatuses[email] !== 'success') {
                await sendSingleEmail(email);
            }
        }
        setIsSendingEmails(false);
        setAllFinished(true);
        setSelectedCandidates([]); // Reset selection once broadcast is complete
    };

    const handleRetry = async (e, email) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSendingEmails(true);
        await sendSingleEmail(email);
        setIsSendingEmails(false);
    };

    const toggleCandidate = (email) => {
        if (isSendingEmails) return;
        setSelectedCandidates(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const handlePostJob = async (jobData) => {
        try {
            await apiService.postJob({ ...jobData, posted_by: userId });
            // After posting, we could refresh a job list if we had one
        } catch (error) {
            throw error;
        }
    };

    const handleRoleSelect = (role) => {
        setUserRole(role);
        setActiveTab(role === 'employer' ? 'post-job' : 'discover');
    };

    const handleLogout = async () => {
        try {
            await authClient.post('/api/auth/logout');
        } catch {
            // ignore
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        setUserRole(null);
        navigate('/');
    };

    const handleApplyJob = (job) => {
        setSelectedJobToApply(job);
        setActiveTab('apply');
    };

    const handleViewAnalytics = (job) => {
        setSelectedJd(job);
        setActiveTab('automation');
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="app-container">
            <Routes>
                {/* 1. Landing Page (Always accessible) */}
                <Route path="/" element={<HomePage onRoleSelect={handleRoleSelect} />} />

                {/* 2. Auth Page (Redirect to app if already logged in) */}
                <Route path="/auth" element={
                    userRole ? <Navigate to="/app" replace /> : 
                    <AuthPage onLoginSuccess={(role, uid) => {
                        handleRoleSelect(role === 'hr' ? 'employer' : 'employee');
                        if (uid) setUserId(uid);
                        navigate('/app');
                    }} />
                } />

                {/* 3. The Web App (Protected Area) */}
                <Route path="/app/*" element={
                    !userRole ? <Navigate to="/auth" replace /> : (
                        <>
                            <EmailModal
                                show={showEditModal}
                                onClose={() => setShowEditModal(false)}
                                subject={emailSubject}
                                setSubject={setEmailSubject}
                                body={emailBody}
                                setBody={setEmailBody}
                            />

                            <Sidebar
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                userRole={userRole}
                                onLogout={handleLogout}
                            />

                            <main className="main-content">
                                <header className="top-header">
                                    <h1>
                                        {activeTab === 'post-job' ? 'Post a New Job Opening' :
                                            activeTab === 'managed-jobs' ? 'Manage Your Postings' :
                                                activeTab === 'dashboard' ? 'Job Performance & Analytics' :
                                                    activeTab === 'discover' ? 'Available Opportunities' :
                                                        activeTab === 'apply' ? 'Apply for Position' :
                                                            activeTab === 'my-apps' ? 'My Application Status' :
                                                                activeTab === 'resume' ? 'My Master Resume' :
                                                                    activeTab === 'profile' ? 'My Profile' :
                                                                        'Email Automation'}
                                    </h1>
                                    <div className="header-right">
                                        {userRole === 'employee' && (
                                            <div className="notification-bell-wrapper" ref={notificationRef}>
                                                <button 
                                                    className={`theme-toggle notification-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                                                    onClick={() => setShowNotifications(!showNotifications)}
                                                >
                                                    <div className="bell-icon-container">
                                                        {unreadCount > 0 ? <BellDot size={22} className="text-primary animate-pulse" /> : <Bell size={22} />}
                                                        {unreadCount > 0 && <span className="notif-badge-premium">{unreadCount}</span>}
                                                    </div>
                                                </button>

                                                <AnimatePresence>
                                                    {showNotifications && (
                                                        <motion.div 
                                                            className="notifications-dropdown card"
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        >
                                                            <div className="notif-header">
                                                                <h3>🔔 Notifications</h3>
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <span className="unread-count-pill">{unreadCount} New</span>
                                                                    {notifications.length > 0 && (
                                                                        <button className="clear-all-btn" onClick={handleClearAll} title="Clear read notifications">
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="notif-list-scrollable">
                                                                {notifications.filter(n => !n.is_read).length > 0 ? (
                                                                    <div className="notif-items-wrapper">
                                                                        {notifications.filter(n => !n.is_read).map(n => {
                                                                            const action = getNotifAction(n);
                                                                            const accent = getNotifAccent(n.type);
                                                                            const iconBg = getNotifIconBg(n.type);
                                                                            return (
                                                                            <motion.div 
                                                                                key={n._id} 
                                                                                layout
                                                                                initial={{ x: -20, opacity: 0 }}
                                                                                animate={{ x: 0, opacity: 1 }}
                                                                                exit={{ x: 20, opacity: 0 }}
                                                                                className={`notif-card-new unread type-${n.type}`}
                                                                                style={{ borderLeftColor: accent }}
                                                                            >
                                                                                <div className="notif-icon-circle" style={{ background: iconBg }}>
                                                                                    {getNotifIcon(n.type)}
                                                                                </div>
                                                                                <div className="notif-body">
                                                                                    <p className="notif-msg">{n.message}</p>
                                                                                    <div className="notif-meta">
                                                                                        <Clock size={10} />
                                                                                        <span>{getRelativeTime(n.created_at)}</span>
                                                                                    </div>
                                                                                    {action && (
                                                                                        <button
                                                                                            type="button"
                                                                                            className="notif-action-btn"
                                                                                            style={{ color: accent, borderColor: accent }}
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleNotifNav(n, action.tab, action.action);
                                                                                            }}
                                                                                        >
                                                                                            {action.label} →
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                                <div className="notif-action-indicator">
                                                                                    <div className="unread-dot" style={{ background: accent }}></div>
                                                                                </div>
                                                                            </motion.div>
                                                                        )})}
                                                                    </div>
                                                                ) : (
                                                                    <div className="notif-empty-state">
                                                                        <div className="empty-icon-ring">
                                                                            <Bell size={32} style={{ opacity: 0.3 }} />
                                                                        </div>
                                                                        <h4>All caught up!</h4>
                                                                        <p>You have no unread notifications.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                        <div className="user-profile-shortcut" onClick={() => setActiveTab('profile')}>
                                            <div className="avatar-square initials-avatar">
                                                {getInitials(profileName)}
                                            </div>
                                        </div>
                                    </div>
                                </header>

                                <div className="content-wrapper">
                                    <AnimatePresence mode="wait">
                                        {userRole === 'employer' && (
                                            <>
                                                {activeTab === 'post-job' && <PostJobPage onJobPosted={handlePostJob} />}
                                                {activeTab === 'managed-jobs' && <ManagedJobsPage onViewAnalytics={handleViewAnalytics} userId={userId} />}
                                                {activeTab === 'dashboard' && <DashboardPage results={results} userId={userId} />}
                                                {activeTab === 'automation' && (
                                                    <AutomationPage
                                                        jdsList={jdsList}
                                                        selectedJd={selectedJd}
                                                        setSelectedJd={setSelectedJd}
                                                        candidatesForJd={candidatesForJd}
                                                        selectedCandidates={selectedCandidates}
                                                        toggleCandidate={toggleCandidate}
                                                        candidateStatuses={candidateStatuses}
                                                        isSendingEmails={isSendingEmails}
                                                        handleSendBroadcast={handleSendBroadcast}
                                                        handleRetry={handleRetry}
                                                        setShowEditModal={setShowEditModal}
                                                        allFinished={allFinished}
                                                        formatDate={formatDate}
                                                    />
                                                )}
                                            </>
                                        )}

                                        {userRole === 'employee' && (
                                            <>
                                                {activeTab === 'discover' && <JobDiscoveryPage 
                                                    onApply={handleApplyJob}
                                                    targetJobId={pendingNotifJobId}
                                                    targetAction={pendingNotifAction}
                                                    onTargetConsumed={() => { setPendingNotifJobId(null); setPendingNotifAction(null); }}
                                                />}
                                                {activeTab === 'resume' && <ResumeUploadPage />}
                                                {activeTab === 'apply' && selectedJobToApply && (
                                                    <CandidateApplyPage
                                                        job={selectedJobToApply}
                                                        onBack={() => {
                                                            setSelectedJobToApply(null);
                                                            setActiveTab('discover');
                                                        }}
                                                    />
                                                )}
                                                {activeTab === 'my-apps' && <MyApplicationsPage />}
                                            </>
                                        )}

                                        {activeTab === 'profile' && <ProfilePage onProfileUpdate={(newName) => setProfileName(newName)} />}
                                    </AnimatePresence>
                                </div>
                            </main>
                            <ScanningOverlay isVisible={isAnalyzing} files={[]} />
                        </>
                    )
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default function AppWrapper() {
    return (
        <Router>
            <Routes>
                <Route path="/*" element={<App />} />
            </Routes>
        </Router>
    )
}
