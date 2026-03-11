import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Briefcase, Camera, Edit2, Save, X } from 'lucide-react';
import authClient from '../services/authClient';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [editForm, setEditForm] = useState({
        username: '',
        officeName: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await authClient.get('/api/user/profile');
            setProfile(res.data);
            setEditForm({
                username: res.data.username || '',
                officeName: res.data.officeName || ''
            });
        } catch (err) {
            setError('Failed to load profile data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            
            const res = await authClient.put('/api/user/profile', editForm);
            
            setProfile(res.data.user);
            setIsEditing(false);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            username: profile.username || '',
            officeName: profile.officeName || ''
        });
        setError('');
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    if (!profile) return <div className="profile-error">Failed to load profile.</div>;

    const isHr = profile.role === 'hr';

    return (
        <div className="profile-container animate-fade-in">
            <div className="profile-header">
                <div className="profile-cover"></div>
                
                <div className="profile-avatar-section">
                    <div className="avatar-wrapper">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || 'User')}&background=6366f1&color=fff&size=120`} 
                            alt="Profile Avatar" 
                            className="profile-avatar"
                        />
                        {isEditing && (
                            <button className="avatar-edit-btn" title="Change Avatar">
                                <Camera size={16} />
                            </button>
                        )}
                    </div>
                    
                    <div className="profile-title-area">
                        <h2>{profile.username || 'Unnamed User'}</h2>
                        <span className={`role-badge ${isHr ? 'role-hr' : 'role-user'}`}>
                            {isHr ? 'HR / Recruiter' : 'Candidate'}
                        </span>
                    </div>

                    {!isEditing ? (
                        <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button className="cancel-btn" onClick={handleCancel} disabled={saving}>
                                <X size={16} /> Cancel
                            </button>
                            <button className="save-btn" onClick={handleSave} disabled={saving}>
                                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="alert-banner error-banner">{error}</div>}
            {success && <div className="alert-banner success-banner">{success}</div>}

            <div className="profile-content">
                <div className="profile-card">
                    <h3>Personal Information</h3>
                    
                    <div className="info-grid">
                        <div className="info-group">
                            <label><User size={16} /> Full Name</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editForm.username}
                                    onChange={e => setEditForm({...editForm, username: e.target.value})}
                                    className="edit-input"
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <p>{profile.username || 'Not provided'}</p>
                            )}
                        </div>

                        <div className="info-group">
                            <label><Mail size={16} /> Email Address</label>
                            {/* Email is typically non-editable or requires a flow, so we keep it static */}
                            <p className="readonly-text">{profile.email}</p>
                            {isEditing && <span className="helper-text">Email address cannot be changed here.</span>}
                        </div>

                        <div className="info-group">
                            <label><Briefcase size={16} /> Account Type</label>
                            <p className="readonly-text" style={{ textTransform: 'capitalize' }}>
                                {profile.role === 'hr' ? 'HR Administrator' : 'Job Seeker'}
                            </p>
                        </div>

                        {isHr && (
                            <div className="info-group">
                                <label><Building size={16} /> Company / Office Name</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={editForm.officeName}
                                        onChange={e => setEditForm({...editForm, officeName: e.target.value})}
                                        className="edit-input"
                                        placeholder="e.g. Google, Amazon"
                                    />
                                ) : (
                                    <p>{profile.officeName || 'Not specified'}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-card status-card">
                    <h3>Account Status</h3>
                    <div className="status-item">
                        <div className="status-label">Member Since</div>
                        <div className="status-value">
                           {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-label">Authentication</div>
                        <div className="status-value">
                            <span className={`provider-badge ${profile.provider === 'google' ? 'bg-red' : 'bg-blue'}`}>
                                {profile.provider === 'google' ? 'Google OAuth' : 'Email/Password'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
