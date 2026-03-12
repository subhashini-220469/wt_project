/**
 * resumeStorage.js
 *
 * Handles user-scoped resume data in localStorage.
 * Each user gets their own key: `candidate_resume_data_<userId>`
 * This prevents resume data from leaking between user accounts.
 */

/**
 * Decode the userId from the JWT access token stored in localStorage.
 * Returns null if no token or token is malformed.
 */
function getCurrentUserId() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
        // JWT structure: header.payload.signature
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || null;
    } catch {
        return null;
    }
}

/**
 * Build the user-scoped localStorage key for resume data.
 */
function getResumeKey() {
    const userId = getCurrentUserId();
    if (!userId) return null;
    return `candidate_resume_data_${userId}`;
}

/**
 * Get the saved resume data for the currently logged-in user.
 * Returns parsed object or null.
 */
export function getResumeData() {
    const key = getResumeKey();
    if (!key) return null;

    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
}

/**
 * Save resume data for the currently logged-in user.
 */
export function saveResumeData(data) {
    const key = getResumeKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Clear resume data for the currently logged-in user.
 */
export function clearResumeData() {
    const key = getResumeKey();
    if (!key) return;
    localStorage.removeItem(key);
}
