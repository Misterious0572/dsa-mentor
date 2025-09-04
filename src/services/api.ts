const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

// small helper
async function doJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `HTTP ${res.status}`);
  return data;
}

// Auth
export const authService = {
  register(email: string, password: string, name: string, preferredLanguage: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, preferredLanguage }),
      signal,
    });
  },
  login(email: string, password: string, mfaToken?: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, mfaToken }),
      signal,
    });
  },
  getCurrentUser(token: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
  },
  setupMFA(token: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/auth/setup-mfa`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
  },
  verifyMFA(token: string, mfaToken: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/auth/verify-mfa`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: mfaToken }),
      signal,
    });
  },
};

// Progress
export const progressService = {
  getProgress(token: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/progress`, { headers: { Authorization: `Bearer ${token}` }, signal });
  },
  getDayProgress(day: number, token: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/progress/day/${day}`, { headers: { Authorization: `Bearer ${token}` }, signal });
  },
  updateProgress(day: number, updates: any, token: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/progress/day/${day}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      signal,
    });
  },
  markProblemComplete(day: number, problem: any, token: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/progress/day/${day}/problem`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(problem),
      signal,
    });
  },
  getStats(token: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/progress/stats`, { headers: { Authorization: `Bearer ${token}` }, signal });
  },
};

// Curriculum
export const curriculumService = {
  getDayCurriculum(day: number, token: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/curriculum/day/${day}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
  },
  getCurriculumOverview(token: string, signal?: AbortSignal) {
    return doJson(`${API_BASE_URL}/curriculum/overview`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
  },
};
