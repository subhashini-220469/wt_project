import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturePill = ({ icon: Icon, text }) => (
  <div className="feature-pill">
    <Icon size={14} className="feature-pill-icon" />
    <span>{text}</span>
  </div>
);

import slider1 from './slider_img1.png';
import slider2 from './slider_img2.png';
import slider3 from './slider_img3.png';

const THEMATIC_IMAGES = [
  {
    src: slider1,
    title: 'Precision AI Screening',
    tag: 'AI Screening'
  },
  {
    src: slider2,
    title: 'Verified Talent Match',
    tag: 'Verified Match'
  },
  {
    src: slider3,
    title: 'Smart Fast Outreach',
    tag: 'Fast Outreach'
  }
];

const SmarthireSideCard = ({ onPostJob = () => {}, onExplore = () => {} }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % THEMATIC_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="smarthire-sidecard" aria-label="HireAI Pro visual panel">
      <div className="sidecard-content">
        <AnimatePresence mode="wait">
          <motion.div 
            key={THEMATIC_IMAGES[currentIndex].tag}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.5 }}
            className="sidecard-tag"
          >
            <Sparkles size={14} className="tag-icon" />
            <span>{THEMATIC_IMAGES[currentIndex].tag}</span>
          </motion.div>
        </AnimatePresence>

        <motion.h1 
          className="sidecard-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Revolutionizing <span className="title-gradient">AI Hiring</span>
        </motion.h1>
        
        <motion.p 
          className="sidecard-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Harness the next dimension of recruitment with intelligent resume screening and seamless talent matching.
        </motion.p>

        <div className="visual-stage">
          <div className="slider-wrapper">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentIndex}
                src={THEMATIC_IMAGES[currentIndex].src} 
                alt={THEMATIC_IMAGES[currentIndex].title}
                className="generated-thematic-visual"
                initial={{ opacity: 0, scale: 0.95, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 1.05, x: -50 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </AnimatePresence>
          </div>
          <div className="visual-overlay"></div>
          
          <div className="progress-container">
            <div className="progress-labels">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  {THEMATIC_IMAGES[currentIndex].title}...
                </motion.span>
              </AnimatePresence>
              <span>Processing</span>
            </div>
            <div className="progress-track">
              <motion.div 
                className="progress-fill"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </div>

        <div className="features-grid">
          <FeaturePill icon={Zap} text="AI Screening" />
          <FeaturePill icon={Shield} text="Verified Match" />
          <FeaturePill icon={Sparkles} text="Fast Outreach" />
        </div>

        <div className="sidecard-actions">
          <button className="premium-btn btn-primary" type="button" onClick={onPostJob}>
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>
          <button className="premium-btn btn-ghost" type="button" onClick={onExplore}>
            Learn More
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SmarthireSideCard;
