import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, User, GraduationCap, Building2, Zap, ShieldCheck, Search } from 'lucide-react';

const HomePage = ({ onRoleSelect }) => {
    return (
        <div className="homepage-container">
            <header className="home-header">
                <div className="home-logo">
                    <Zap size={32} className="text-primary" />
                    <span>HireAI Pro</span>
                </div>
                <div className="home-badge">AI-Powered ATS v1.0</div>
            </header>

            <main className="home-main">
                <div className="home-content">
                    <motion.div
                        className="hero-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1>Revolutionizing Recruitment with <span className="text-gradient">AI Precision.</span></h1>
                        <p>Bridging the gap between elite talent and top companies through intelligent, automated screening.</p>
                    </motion.div>

                    <div className="role-selection-grid">
                        <motion.div
                            className="role-card employer-card"
                            whileHover={{ scale: 1.02, translateY: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onRoleSelect('employer')}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="role-icon">
                                <Building2 size={40} />
                            </div>
                            <h3>I am an Employer</h3>
                            <p>Post jobs, screen candidates with LLMs, and manage your hiring pipeline effortlessly.</p>
                            <ul className="role-features">
                                <li><ShieldCheck size={16} /> AI JD Blueprinting</li>
                                <li><ShieldCheck size={16} /> Bulk Resume Scoring</li>
                                <li><ShieldCheck size={16} /> Automated Outreach</li>
                            </ul>
                            <button className="btn btn-primary w-full">Access Dashboard</button>
                        </motion.div>

                        <motion.div
                            className="role-card employee-card"
                            whileHover={{ scale: 1.02, translateY: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onRoleSelect('employee')}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="role-icon">
                                <Search size={40} />
                            </div>
                            <h3>I am a Job Seeker</h3>
                            <p>Discover top openings, apply instantly, and get immediate AI feedback on your resume.</p>
                            <ul className="role-features">
                                <li><ShieldCheck size={16} /> Smart Job Discovery</li>
                                <li><ShieldCheck size={16} /> Instant ATS Scorer</li>
                                <li><ShieldCheck size={16} /> Skill Gap Analysis</li>
                            </ul>
                            <button className="btn btn-outline w-full">Find My Next Job</button>
                        </motion.div>
                    </div>
                </div>
            </main>

            <footer className="home-footer">
                <p>&copy; 2024 HireAI Pro. Built for modern recruitment.</p>
            </footer>
        </div>
    );
};

export default HomePage;
