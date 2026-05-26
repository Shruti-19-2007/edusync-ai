const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email, password) => request('POST', '/auth/login', { email, password }),
    getUsers: () => request('GET', '/auth/users'),
    createUser: (data) => request('POST', '/auth/users', data),
  },
  students: {
    list: (params = {}) => request('GET', '/students?' + new URLSearchParams(params)),
    get: (id) => request('GET', `/students/${id}`),
    create: (data) => request('POST', '/students', data),
    update: (id, data) => request('PUT', `/students/${id}`, data),
    delete: (id) => request('DELETE', `/students/${id}`),
  },
  attendance: {
    list: (params = {}) => request('GET', '/attendance?' + new URLSearchParams(params)),
    summary: () => request('GET', '/attendance/summary'),
    mark: (records) => request('POST', '/attendance', records),
    update: (id, data) => request('PUT', `/attendance/${id}`, data),
  },
  ptm: {
    list: (params = {}) => request('GET', '/ptm?' + new URLSearchParams(params)),
    create: (data) => request('POST', '/ptm', data),
    update: (id, data) => request('PUT', `/ptm/${id}`, data),
    cancel: (id) => request('DELETE', `/ptm/${id}`),
  },
  homework: {
    list: (params = {}) => request('GET', '/homework?' + new URLSearchParams(params)),
    get: (id) => request('GET', `/homework/${id}`),
    create: (data) => request('POST', '/homework', data),
    update: (id, data) => request('PUT', `/homework/${id}`, data),
    delete: (id) => request('DELETE', `/homework/${id}`),
    submit: (id, studentId) => request('POST', `/homework/${id}/submit`, { studentId }),
  },
  notifications: {
    list: (params = {}) => request('GET', '/notifications?' + new URLSearchParams(params)),
    create: (data) => request('POST', '/notifications', data),
    markRead: (id) => request('PUT', `/notifications/${id}/read`, {}),
  },
  analytics: {
    dashboard: () => request('GET', '/analytics/dashboard'),
  },
};
