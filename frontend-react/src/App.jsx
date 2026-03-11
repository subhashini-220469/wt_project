import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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

// Services
import { apiService } from './services/api';
import authClient from './services/authClient';

function App() {
    const [userRole, setUserRole] = useState(null); // 'employer' or 'employee'
    const navigate = useNavigate();
    const location = useLocation();

    // Derive activeTab from URL
    const tabMapping = {
        '/post-job': 'post-job',
        '/analytics': 'dashboard',
        '/managed-jobs': 'managed-jobs',
        '/outreach': 'automation',
        '/discover': 'discover',
        '/resume': 'resume',
        '/my-apps': 'my-apps',
        '/apply': 'apply',
        '/profile': 'profile'
    };
    const activeTab = tabMapping[location.pathname] || (userRole === 'employer' ? 'post-job' : 'discover');

    const [selectedJobToApply, setSelectedJobToApply] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);

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

    // Fetch JDs for Automation Tab
    useEffect(() => {
        if (activeTab === 'automation') {
            apiService.fetchJds()
                .then(data => setJdsList(data))
                .catch(err => console.error("Failed to fetch JDs", err));
        }
    }, [activeTab]);

    // Fetch Candidates when a JD is selected
    useEffect(() => {
        if (selectedJd) {
            setCandidateStatuses({});
            setAllFinished(false);
            apiService.fetchResults(selectedJd._id)
                .then(data => {
                    if (Array.isArray(data)) {
                        setCandidatesForJd(data);
                        const shortlisted = data
                            .filter(c => {
                                const score = c.score?.total_score ?? c.score ?? 0;
                                return score >= 70;
                            })
                            .map(c => c.resume_data?.email)
                            .filter(email => !!email);
                        setSelectedCandidates(shortlisted);
                    }
                })
                .catch(err => console.error("Failed to fetch results", err));
        }
    }, [selectedJd]);

    // Update document title dynamically based on active tab
    useEffect(() => {
        const titles = {
            'upload': 'Resume Screening | HireAI Pro',
            'post-job': 'Post a Job | HireAI Pro',
            'dashboard': 'Analytics | HireAI Pro',
            'automation': 'Outreach | HireAI Pro',
            'discover': 'Browse Jobs | HireAI Pro',
            'resume': 'My Resume | HireAI Pro',
            'my-apps': 'My Applications | HireAI Pro',
            'apply': 'Apply for Job | HireAI Pro',
            'profile': 'My Profile | HireAI Pro'
        };

        const pageTitle = titles[activeTab] || 'HireAI Pro';
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
                navigate('/analytics');
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
            await apiService.postJob(jobData);
            // After posting, we could refresh a job list if we had one
        } catch (error) {
            throw error;
        }
    };

    const handleRoleSelect = (role) => {
        setUserRole(role);
        navigate(role === 'employer' ? '/post-job' : '/discover');
    };

    const handleLogout = async () => {
        try {
            await authClient.post('/api/auth/logout');
        } catch {
            // ignore — still clear local state
        }
        localStorage.removeItem('accessToken');
        setUserRole(null);
    };

    const handleApplyJob = (job) => {
        setSelectedJobToApply(job);
        navigate('/apply');
    };

    const handleViewAnalytics = (job) => {
        setSelectedJd(job);
        navigate('/outreach');
    };

    if (!userRole) {
        return (
            <Routes>
                <Route path="/auth" element={
                    <AuthPage onLoginSuccess={(role) => handleRoleSelect(role === 'hr' ? 'employer' : 'employee')} />
                } />
                {/* Make auth the default for now when unauthorized */}
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        );
    }

    return (
        <div className="app-container">
            <EmailModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                subject={emailSubject}
                setSubject={setEmailSubject}
                body={emailBody}
                setBody={setEmailBody}
            />

            <Sidebar
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
                                                activeTab === 'profile' ? 'My Profile' :
                                                    'Email Automation'}
                    </h1>
                    <div className="user-profile">
                        <img src={`https://ui-avatars.com/api/?name=HR+Admin&background=6366f1&color=fff`} alt="Profile" />
                    </div>
                </header>

                <div className="content-wrapper">
                    <AnimatePresence mode="wait">

                        <Routes>
                            {/* Employer Routes */}
                            {userRole === 'employer' && (
                                <>
                                    <Route path="/post-job" element={<PostJobPage onJobPosted={handlePostJob} />} />
                                    <Route path="/managed-jobs" element={<ManagedJobsPage onViewAnalytics={handleViewAnalytics} />} />
                                    <Route path="/analytics" element={<DashboardPage results={results} />} />
                                    <Route path="/outreach" element={
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
                                    } />
                                    <Route path="/" element={<Navigate to="/post-job" replace />} />
                                </>
                            )}

                            {/* Employee Routes */}
                            {userRole === 'employee' && (
                                <>
                                    <Route path="/discover" element={<JobDiscoveryPage onApply={handleApplyJob} />} />
                                    <Route path="/resume" element={<ResumeUploadPage />} />
                                    <Route path="/my-apps" element={<ManagedJobsPage />} /> {/* Assuming employee has their apps page */}
                                    <Route path="/apply" element={
                                        selectedJobToApply ? (
                                            <CandidateApplyPage
                                                job={selectedJobToApply}
                                                onBack={() => {
                                                    setSelectedJobToApply(null);
                                                    navigate('/discover');
                                                }}
                                            />
                                        ) : (
                                            <Navigate to="/discover" replace />
                                        )
                                    } />
                                    <Route path="/" element={<Navigate to="/discover" replace />} />
                                </>
                            )}

                            {/* Shared Routes */}
                            <Route path="/profile" element={<ProfilePage />} />

                            {/* Redirect any other unknown routes to default */}
                            <Route path="*" element={<Navigate to={userRole === 'employer' ? "/post-job" : "/discover"} replace />} />
                        </Routes>
                    </AnimatePresence>
                </div>
            </main>

            <ScanningOverlay isVisible={isAnalyzing} files={[]} />
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