import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, GraduationCap, Building2, Zap, ShieldCheck, Search, CheckCircle } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);

    const steps = [
        {
            title: "Upload Resume",
            icon: "/icon-template.png",
            features: ["ATS-friendly analysis", "Instant skill mapping", "Formatting score"]
        },
        {
            title: "AI Matchmaking",
            icon: "/icon-writer.png",
            features: ["JD alignment check", "Gap identification", "Automated shortlisting"]
        },
        {
            title: "Smart Applications",
            icon: "/icon-send.png",
            features: ["Direct tracking", "Automated recruiter updates", "Real-time status"]
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % steps.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="homepage-container">
            <header className="home-header">
                <div className="home-header-left">
                    <div className="home-logo">
                        <span className="brand-smart">smart</span><span className="brand-hire">Hire</span>
                    </div>
                    <nav className="home-nav">
                        <a href="#" className="active" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>Find Jobs</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>Post Jobs</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>AI Outreach</a>
                    </nav>
                </div>
                <div className="home-header-right">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/auth')}>Log In</button>
                    <button className="btn btn-accent btn-sm" onClick={() => navigate('/auth')}>Sign Up</button>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/auth')}>Employers / Post Job &rarr;</button>
                </div>
            </header>

            <main className="home-main">
                <motion.div
                    className="hero-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="heroflex">
                        <div className="hero-text">
                            <h1>Revolutionizing Recruitment with <span className="text-gradient">AI Precision.</span></h1>
                            <p>Bridging the gap between elite talent and top companies through intelligent, automated screening.</p>
                            <div className="hero-actions">
                                <button className="btn btn-blue btn-large" onClick={() => navigate('/auth')}>Improve My Resume</button>
                                <button className="btn btn-accent btn-large" onClick={() => navigate('/auth')}>Find My Next Job</button>
                            </div>
                        </div>
                        <div className="hero-visual">
                            <img src="/mascot.png" alt="Mascot" className="mascot-img" />
                        </div>
                    </div>
                </motion.div>

                <div className="home-content">

                    <section className="how-it-works">
                        <h2 className="section-title">Here's how we get you hired</h2>
                        
                        <div className="steps-stack-area">
                            {steps.map((step, idx) => (
                                <motion.div 
                                    key={idx}
                                    className={`step-stack-card ${activeIndex === idx ? 'active' : ''}`}
                                    initial={false}
                                    animate={{ 
                                        zIndex: activeIndex === idx ? 10 : (steps.length - idx),
                                        opacity: activeIndex === idx ? 1 : 0.2,
                                        scale: activeIndex === idx ? 1 : 0.9,
                                        y: activeIndex === idx ? 0 : 20
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="step-image-box">
                                        <img src={step.icon} alt={step.title} className="step-doodle-large" />
                                        <h3 className="floating-step-title">{step.title}</h3>
                                    </div>
                                    <div className="step-features-below">
                                        <ul>
                                            {step.features.map((f, i) => (
                                                <li key={i}><CheckCircle size={16} /> {f}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="how-it-works-footer" style={{ marginTop: '2rem' }}>
                             <button className="btn btn-blue btn-large" onClick={() => navigate('/auth')}>Join smartHire Today</button>
                        </div>
                    </section>

                    <section className="career-advice-section">
                        <div className="career-advice-content heroflex">
                            <div className="hero-visual">
                                 <img src="/girl-mascot.png" alt="AI Assistant" className="mascot-img" />
                            </div>
                            <div className="hero-text">
                                <h2>Get Recommendations <br/> for the <span className="text-gradient-white">best career path</span></h2>
                                <p>Simply join and our AI will guide you to the perfect opportunities based on your unique skills and experience.</p>
                                <div className="hero-actions">
                                    <button className="btn btn-white btn-large" onClick={() => navigate('/auth')}>Get Started</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="home-footer">
                <p>&copy; 2026 smartHire. Built for modern recruitment.</p>
            </footer>
        </div>
    );
};

export default HomePage;
