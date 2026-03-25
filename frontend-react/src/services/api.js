const API_BASE = "http://localhost:8000";
const NODE_API_BASE = "http://localhost:5000/api";

export const apiService = {
    fetchJds: async (posted_by) => {
        const url = posted_by ? `${API_BASE}/jds?posted_by=${posted_by}` : `${API_BASE}/jds`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch JDs");
        return res.json();
    },
    fetchJobs: async (posted_by) => {
        const url = posted_by ? `${API_BASE}/jobs?posted_by=${posted_by}` : `${API_BASE}/jobs`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
    },
    postJob: async (jobData) => {
        const res = await fetch(`${API_BASE}/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });
        if (!res.ok) {
            let errMsg = "Job posting failed";
            try {
                const errData = await res.json();
                errMsg = errData.detail || errMsg;
            } catch (e) {}
            throw new Error(errMsg);
        }
        return res.json();
    },
    parseResume: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/parse-resume`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error("Resume parsing failed");
        return res.json();
    },
    applyToJob: async (jobId, name, email, file, screeningAnswers, resumeDataOverride = null) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (file) formData.append('resume', file);
        formData.append('screening_answers', JSON.stringify(screeningAnswers));
        if (resumeDataOverride) {
            formData.append('resume_data_override', JSON.stringify(resumeDataOverride));
        }

        const res = await fetch(`${API_BASE}/apply/${jobId}`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Application failed");
        }
        return res.json();
    },
    checkAtsScore: async (jobId, resumeData) => {
        const res = await fetch(`${API_BASE}/rescore/${jobId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumeData)
        });
        if (!res.ok) throw new Error("ATS check failed");
        return res.json();
    },
    fetchResults: async (jdId) => {
        const res = await fetch(`${API_BASE}/results/${jdId}`);
        if (!res.ok) throw new Error("Failed to fetch results");
        return res.json();
    },
    processResumes: async (jdText, files) => {
        const formData = new FormData();
        formData.append('jd_text', jdText);
        files.forEach(file => formData.append('files', file));

        const res = await fetch(`${API_BASE}/process`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error("Backend error");
        return res.json();
    },
    sendEmail: async (data) => {
        const res = await fetch(`${API_BASE}/send-emails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Email dispatch failed");
        return res.json();
    },
    deleteJob: async (jobId) => {
        const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error("Failed to delete job");
        return res.json();
    },
    updateJobStatus: async (jobId, status) => {
        const formData = new FormData();
        formData.append('status', status);
        const res = await fetch(`${API_BASE}/jobs/${jobId}/status`, {
            method: 'PATCH',
            body: formData
        });
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
    },
    fetchAnalytics: async (posted_by) => {
        const url = posted_by ? `${API_BASE}/analytics/jobs?posted_by=${posted_by}` : `${API_BASE}/analytics/jobs`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
    },
    fetchMyApplications: async (email) => {
        const res = await fetch(`${API_BASE}/my-applications/${email}`);
        if (!res.ok) throw new Error("Failed to fetch applications");
        return res.json();
    },
    getProfile: async (email) => {
        const res = await fetch(`${API_BASE}/profiles/${email}`);
        if (!res.ok) return null; // Handle 404 gracefully
        return res.json();
    },
    saveProfile: async (email, profileData) => {
        const res = await fetch(`${API_BASE}/profiles/${email}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        if (!res.ok) throw new Error("Failed to save profile to database");
        return res.json();
    },
    fetchNotifications: async (email) => {
        const res = await fetch(`${NODE_API_BASE}/notifications?email=${email}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        return res.json();
    },
    markNotificationRead: async (notifId) => {
        const res = await fetch(`${NODE_API_BASE}/notifications/${notifId}/read`, {
            method: 'PATCH'
        });
        if (!res.ok) throw new Error("Failed to mark notification as read");
        return res.json();
    },
    markAllNotificationsRead: async (email) => {
        const res = await fetch(`${NODE_API_BASE}/notifications/mark-all-read`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!res.ok) throw new Error("Failed to mark all notifications as read");
        return res.json();
    },
    clearNotifications: async (email) => {
        const res = await fetch(`${NODE_API_BASE}/notifications/clear-all`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!res.ok) throw new Error("Failed to clear notifications");
        return res.json();
    }
};
