import {
    Upload,
    LayoutDashboard,
    Mail,
    Wand2,
    Plus,
    Search,
    Briefcase,
    LogOut,
    UserCircle,
    FileText
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, userRole, onLogout }) => {
    return (
        <aside className="sidebar">
            <div className="logo">
                <Wand2 size={24} />
                <span>HireAI Pro</span>
            </div>

            <div className="role-indicator">
                <UserCircle size={16} />
                <span>{userRole === 'employer' ? 'Recruiter Mode' : 'Candidate Mode'}</span>
            </div>

            <nav className="nav-menu">
                {userRole === 'employer' ? (
                    <>
                        <button
                            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upload')}
                        >
                            <Upload size={18} />
                            <span>Resumes Screening</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'post-job' ? 'active' : ''}`}
                            onClick={() => setActiveTab('post-job')}
                        >
                            <Plus size={18} />
                            <span>Post New Job</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <LayoutDashboard size={18} />
                            <span>Analytics</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'automation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('automation')}
                        >
                            <Mail size={18} />
                            <span>Outreach</span>
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`}
                            onClick={() => setActiveTab('discover')}
                        >
                            <Search size={18} />
                            <span>Browse Jobs</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'resume' ? 'active' : ''}`}
                            onClick={() => setActiveTab('resume')}
                        >
                            <FileText size={18} />
                            <span>My Resume</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'my-apps' ? 'active' : ''}`}
                            onClick={() => setActiveTab('my-apps')}
                        >
                            <Briefcase size={18} />
                            <span>My Applications</span>
                        </button>
                    </>
                )}

                <button className="nav-item logout-btn-sidebar" onClick={onLogout}>
                    <LogOut size={18} />
                    <span>Switch Role</span>
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;
