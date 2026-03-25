import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search as SearchIcon, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="homepage-premium">
            {/* Header */}
            <header className="home-header">
                <div className="home-logo-container">
                    <span className="brand-smart-dark">smart</span>
                    <span className="brand-hire-dark">Hire</span>
                </div>
                <nav className="home-nav">
                    <button className="nav-link-btn" onClick={() => navigate('/auth')}>Find Jobs</button>
                    <button className="nav-link-btn" onClick={() => navigate('/auth')}>Post Jobs</button>
                    <a href="#solutions">Solutions</a>
                </nav>
                <div className="home-auth-btns">
                    <button className="btn-login-header" onClick={() => navigate('/auth')}>Log In</button>
                    <button className="btn-signup-header" onClick={() => navigate('/auth')}>Sign Up</button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section-new">
                <div className="hero-wrapper">
                    <div className="hero-content">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="hero-tag">#1 AI Recruitment Platform</span>
                            <h1>Hire the best talent <br /> <span className="text-teal">faster than ever.</span></h1>
                            <p>One platform for all your hiring needs. SmartHire uses advanced AI to screen, match, and outreach to the world's top talent.</p>
                            
                            <div className="hero-search-container">
                                <div className="search-pill">
                                    <div className="search-field">
                                        <SearchIcon size={20} />
                                        <input type="text" placeholder="Job title or keywords" />
                                    </div>
                                    <div className="search-field field-loc">
                                        <MapPin size={20} />
                                        <input type="text" placeholder="Location" />
                                    </div>
                                    <button className="search-action-btn" onClick={() => navigate('/auth')}>Search Jobs</button>
                                </div>
                                <div className="trending-row">
                                    <span>Trending:</span>
                                    <span className="trend-item">Remote</span>
                                    <span className="trend-item">AI Engineer</span>
                                    <span className="trend-item">Project Manager</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    <div className="hero-visual">
                        <motion.img 
                            src="/mascot.png" 
                            alt="SmartHire Hero"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                </div>
            </section>

            {/* Solutions & CTA Wrapper with Custom Background */}
            <div className="solutions-cta-wrapper">
                {/* Solutions Section */}
                <section id="solutions" className="solutions-section">
                    <div className="section-header">
                        <h2>Our Smart <span className="text-teal">Solutions</span></h2>
                        <p>Designed for both elite candidates and high-growth companies.</p>
                    </div>
                    
                    <div className="solutions-grid">
                        <div className="solution-card">
                            <div className="sol-icon-bg">
                                <img src="/icon-candidate.png" alt="Candidate" />
                            </div>
                            <h3>AI Resume Screening</h3>
                            <p>Automatically rank and score thousands of resumes against your job description in seconds.</p>
                        </div>

                        <div className="solution-card">
                            <div className="sol-icon-bg">
                                <img src="/icon-recruiter.png" alt="Recruiter" />
                            </div>
                            <h3>Job Management</h3>
                            <p>Manage all your job postings and candidate pipelines in one centralized, sleek dashboard.</p>
                        </div>

                        <div className="solution-card">
                            <div className="sol-icon-bg">
                                <img src="/icon-send.png" alt="Automation" />
                            </div>
                            <h3>Automated Outreach</h3>
                            <p>Reach out to shortlisted candidates automatically with personalized, high-conversion emails.</p>
                        </div>

                        <div className="solution-card">
                            <div className="sol-icon-bg">
                                <img src="/icon-writer.png" alt="Writer" />
                            </div>
                            <h3>ATS Optimization</h3>
                            <p>Candidates can optimize their resumes to match industry standards and rank higher in screenings.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section-footer">
                    <div className="cta-card">
                        <div className="cta-text">
                            <h2>Ready to transform your hiring?</h2>
                            <p>Join thousands of companies using SmartHire to build their dream teams.</p>
                            <div className="cta-btns">
                                <button className="btn-get-started" onClick={() => navigate('/auth')}>Get Started for Free</button>
                                <button className="btn-demo" onClick={() => navigate('/auth')}>Request Demo</button>
                            </div>
                        </div>
                        <div className="cta-image">
                            <img src="/girl-mascot.png" alt="Mascot" />
                        </div>
                    </div>
                </section>
            </div>

            <footer className="home-footer-new">
                <div className="footer-content">
                    <div className="footer-logo">
                        <span className="brand-smart-dark">smart</span>
                        <span className="brand-hire-dark">Hire</span>
                    </div>
                    <p>© 2026 SmartHire AI. All rights reserved.</p>
                    <div className="footer-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
