import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Plus, X, Wand2 } from 'lucide-react';

const UploadPage = ({ jdText, setJdText, files, setFiles, onDrop, fileInputRef, removeFile, handleAnalyze }) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="view-section active-section"
        >
            <div className="upload-grid">
                <div className="card">
                    <div className="card-header">
                        <FileText size={20} className="text-accent" />
                        <h2>1. Job Description</h2>
                    </div>
                    <p className="card-desc">Define the role requirements to match candidates accurately.</p>
                    <div className="input-group">
                        <textarea
                            id="jd-text"
                            rows="12"
                            placeholder="e.g. Senior Frontend Engineer with React experience..."
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <Users size={20} className="text-accent" />
                        <h2>2. Candidate Resumes</h2>
                    </div>
                    <p className="card-desc">Upload PDFs/DOCXs for AI processing.</p>

                    <div
                        className="file-drop-area large"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <Plus size={40} className="text-muted" />
                        <span>Drag & Drop or Click to Upload</span>
                        <input
                            type="file"
                            multiple
                            hidden
                            ref={fileInputRef}
                            onChange={(e) => {
                                const selectedFiles = Array.from(e.target.files);
                                setFiles(prev => [...prev, ...selectedFiles]);
                            }}
                            accept=".pdf,.doc,.docx"
                        />
                    </div>

                    <div className="uploaded-files-list">
                        {files.map((file, idx) => (
                            <div key={idx} className="file-item">
                                <div className="file-item-info">
                                    <FileText size={16} />
                                    <span>{file.name}</span>
                                </div>
                                <X
                                    size={16}
                                    className="remove-btn"
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="action-footer">
                <button className="btn btn-primary btn-large" onClick={handleAnalyze}>
                    <Wand2 size={20} />
                    Analyze & Score Resumes
                </button>
            </div>
        </motion.section>
    );
};

export default UploadPage;
