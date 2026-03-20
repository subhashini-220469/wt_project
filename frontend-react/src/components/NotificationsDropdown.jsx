import React, { useState, useEffect, useRef } from 'react';
import { Bell, Briefcase, Clock, ChevronRight, Check } from 'lucide-react';
import { apiService } from '../services/api';

const NotificationsDropdown = ({ userRole, onApplyJob, onViewJob }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);
    
    // Track read notification IDs in localStorage
    const [readNotifs, setReadNotifs] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('readNotifs')) || [];
        } catch {
            return [];
        }
    });

    // Only fetch notifications for candidates
    useEffect(() => {
        if (userRole !== 'employee') return;

        const fetchNotifications = async () => {
            try {
                const data = await apiService.fetchNotifications();
                setNotifications(data);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [userRole]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (userRole !== 'employee') return null; // Only show for candidates

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const markAsRead = (e, notifId) => {
        e.stopPropagation();
        const newRead = [...readNotifs, notifId];
        setReadNotifs(newRead);
        localStorage.setItem('readNotifs', JSON.stringify(newRead));
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.job._id + n.type);
        setReadNotifs(allIds);
        localStorage.setItem('readNotifs', JSON.stringify(allIds));
    };

    const unreadNotifications = notifications.filter(n => !readNotifs.includes(n.job._id + n.type));
    const unreadCount = unreadNotifications.length;

    return (
        <div className="notification-wrapper" ref={dropdownRef}>
            <button className={`notification-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`} onClick={toggleDropdown}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header mark-read-header">
                        <h4>Notifications</h4>
                        {unreadCount > 0 && (
                            <button className="mark-read-btn" onClick={markAllAsRead}>Mark all read</button>
                        )}
                    </div>
                    <div className="notification-list">
                        {unreadNotifications.length === 0 ? (
                            <div className="notification-empty">
                                <p>No new notifications</p>
                            </div>
                        ) : (
                            unreadNotifications.map((notif, idx) => {
                                const notifId = notif.job._id + notif.type;
                                
                                return (
                                    <div className="notification-item" key={notifId}>
                                        <div className="notification-icon">
                                            {notif.type === 'new_job' ? (
                                                <Bell size={18} className="text-teal" />
                                            ) : (
                                                <Clock size={18} className="text-warn" />
                                            )}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-title">{notif.message}</p>
                                            <p className="notification-meta">📄 Role: {notif.job_title}</p>
                                            <p className="notification-meta">
                                                {notif.type === 'new_job' ? `📅 Posted: ${notif.time_str}` : `⚠️ Hurry up!`}
                                            </p>
                                            
                                            <div className="notification-footer-actions">
                                                {notif.type === 'new_job' ? (
                                                    <button className="notification-action-btn" onClick={() => {
                                                        if (onViewJob && notif.job) {
                                                            onViewJob(notif.job);
                                                            setIsOpen(false);
                                                        }
                                                    }}>
                                                        View Job <ChevronRight size={14} />
                                                    </button>
                                                ) : (
                                                    <button className="notification-action-btn" onClick={() => {
                                                        if (onApplyJob && notif.job) {
                                                            onApplyJob(notif.job);
                                                            setIsOpen(false);
                                                        }
                                                    }}>
                                                        Apply Now <ChevronRight size={14} />
                                                    </button>
                                                )}
                                                
                                                <button className="mark-item-read-link" onClick={(e) => markAsRead(e, notifId)}>
                                                    Mark as read
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
