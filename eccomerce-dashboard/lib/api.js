const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'Aa@4444444';

export { API_BASE, API_KEY };

export async function apiRequest(endpoint, { method = 'GET', body = null, useApiKey = false, headers = {} } = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (useApiKey) {
    reqHeaders.Authorization = API_KEY;
  }

  const options = {
    method,
    headers: reqHeaders,
  };

  if (body !== null && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  let data;
  try {
    data = await response.json();
  } catch {
    data = { error: `Server returned status ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed (${response.status})`);
  }

  return data;
}

const SESSION_KEY = 'nova_ecommerce_user';

export function getSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(user) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore storage errors
  }
}
