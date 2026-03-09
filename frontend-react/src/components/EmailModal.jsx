import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const EmailModal = ({ show, onClose, subject, setSubject, body, setBody }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-content"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Edit Email Template</h2>
                            <button className="btn-ghost" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="email-editor">
                            <div className="input-group">
                                <label>Subject Line</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter email subject..."
                                />
                            </div>
                            <div className="input-group">
                                <label>Email Body</label>
                                <textarea
                                    rows="8"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Write your invitation message here..."
                                />
                            </div>
                            <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" onClick={onClose}>
                                    <Check size={18} /> Save & Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmailModal;
