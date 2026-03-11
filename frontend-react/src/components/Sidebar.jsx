import { NavLink } from 'react-router-dom';
import {
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

const Sidebar = ({ userRole, onLogout }) => {
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
                        <NavLink
                            to="/post-job"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Plus size={18} />
                            <span>Post New Job</span>
                        </NavLink>
                        <NavLink
                            to="/analytics"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <LayoutDashboard size={18} />
                            <span>Analytics</span>
                        </NavLink>
                        <NavLink
                            to="/managed-jobs"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Briefcase size={18} />
                            <span>Managed Jobs</span>
                        </NavLink>
                        <NavLink
                            to="/outreach"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Mail size={18} />
                            <span>Outreach</span>
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink
                            to="/discover"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Search size={18} />
                            <span>Browse Jobs</span>
                        </NavLink>
                        <NavLink
                            to="/resume"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <FileText size={18} />
                            <span>My Resume</span>
                        </NavLink>
                        <NavLink
                            to="/my-apps"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Briefcase size={18} />
                            <span>My Applications</span>
                        </NavLink>
                    </>
                )}

                <div className="nav-bottom">
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <UserCircle size={18} />
                        <span>My Profile</span>
                    </NavLink>
                    <button className="nav-item logout-btn-sidebar" onClick={onLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
