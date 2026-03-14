const API_BASE = "http://localhost:8000";

export const apiService = {
    fetchJds: async () => {
        const res = await fetch(`${API_BASE}/jds`);
        if (!res.ok) throw new Error("Failed to fetch JDs");
        return res.json();
    },
    fetchJobs: async () => {
        const res = await fetch(`${API_BASE}/jobs`);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
    },
    postJob: async (jobData) => {
        const res = await fetch(`${API_BASE}/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });
        if (!res.ok) throw new Error("Job posting failed");
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

        try {
            const res = await fetch(`${API_BASE}/apply/${jobId}`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Application failed");
            }
            return res.json();
        } catch (error) {
            console.error("Network or Backend Error in ApplyToJob:", error);
            if (error.message === "Failed to fetch") {
                throw new Error("Could not connect to the Backend. Please ensure the Python server is running on port 8000.");
            }
            throw error;
        }
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
    fetchAnalytics: async () => {
        const res = await fetch(`${API_BASE}/analytics/jobs`);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
    }
};
