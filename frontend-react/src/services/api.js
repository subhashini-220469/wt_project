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
    applyToJob: async (jobId, formData) => {
        // formData should be a FormData object for multipart/form-data
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
    processResumes: async (jdTextOrFormData, files) => {
        let formData;
        if (jdTextOrFormData instanceof FormData) {
            formData = jdTextOrFormData;
        } else {
            formData = new FormData();
            formData.append('jd_text', jdTextOrFormData);
            files.forEach(file => formData.append('files', file));
        }

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
    }
};
