import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const ScanningOverlay = ({ isVisible, files }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="scanning-overlay active"
                >
                    <div className="scanner-box">
                        <div className="loader-container">
                            <Loader2 size={48} className="spin-slow text-primary" />
                            <div className="pulse-dot"></div>
                        </div>
                        <h3>AI Engine is Scoring...</h3>
                        <p>Analyzing semantics & skill density...</p>

                        <div className="progress-bar">
                            <motion.div
                                className="progress"
                                initial={{ width: "5%" }}
                                animate={{ width: "95%" }}
                                transition={{ duration: 10, ease: "easeInOut" }}
                            />
                        </div>

                        <div className="processing-files-preview">
                            {files.map((file, idx) => (
                                <div key={idx} className="proc-file-item">
                                    <span>{file.name}</span>
                                    <span className="status-tag status-active">Processing</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScanningOverlay;
