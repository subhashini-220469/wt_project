import React, { useState, useEffect, useRef } from 'react';
import { Bell, Briefcase, Clock, ChevronRight, Check } from 'lucide-react';
import { apiService } from '../services/api';
import '../styles/NotificationsDropdown.css'; // Added stylesheet import

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

    const unreadNotifications = notifications.filter(
        notif => !readNotifs.includes(notif.job._id + notif.type)
    );

    return (
        <div className="notification-wrapper" ref={dropdownRef}>
            <button className={`notification-bell-btn ${unreadNotifications.length > 0 ? 'has-unread' : ''}`} onClick={toggleDropdown}>
                <div className="bell-icon-container">
                    <Bell size={20} />
                    {unreadNotifications.length > 0 && (
                        <span className="notif-badge-premium">{unreadNotifications.length}</span>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="notifications-dropdown">
                    <div className="notif-header">
                        <h3>Notifications</h3>
                        {unreadNotifications.length > 0 && (
                            <button className="clear-all-btn" onClick={markAllAsRead}>
                                <Check size={14} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} /> Mark all read
                            </button>
                        )}
                    </div>
                    <div className="notif-list-scrollable">
                        {unreadNotifications.length === 0 ? (
                            <div className="notif-empty-state">
                                <div className="empty-icon-ring">
                                    <Bell size={32} />
                                </div>
                                <p>No new notifications</p>
                            </div>
                        ) : (
                            unreadNotifications.map((notif, idx) => {
                                const notifId = notif.job._id + notif.type;
                                return (
                                    <div className={`notification-item type-${notif.type}`} key={idx}>
                                        <div className="notification-icon">
                                            {notif.type === 'new_job' ? (
                                                <Briefcase size={16} className="text-teal" />
                                            ) : (
                                                <Clock size={16} className="text-warn" />
                                            )}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-message">{notif.message}</p>
                                            <p className="notification-company">📄 {notif.job_title}</p>
                                            <p className="notification-time">
                                                {notif.type === 'new_job' ? `📅 Posted: ${notif.time_str}` : `⚠️ Hurry up!`}
                                            </p>
                                            <div className="notification-actions">
                                                {notif.type === 'new_job' ? (
                                                    <button className="btn-outline-primary" onClick={() => {
                                                        if (onViewJob && notif.job) {
                                                            onViewJob(notif.job);
                                                            setIsOpen(false);
                                                        }
                                                    }}>
                                                        View Job <ChevronRight size={14} />
                                                    </button>
                                                ) : (
                                                    <button className="btn-primary" onClick={() => {
                                                        if (onApplyJob && notif.job) {
                                                            onApplyJob(notif.job);
                                                            setIsOpen(false);
                                                        }
                                                    }}>
                                                        Apply Now <ChevronRight size={14} />
                                                    </button>
                                                )}
                                                <button className="btn-icon" onClick={(e) => markAsRead(e, notifId)} title="Mark as read">
                                                    <Check size={16} />
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
