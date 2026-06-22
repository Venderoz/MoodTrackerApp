const ENTRIES_URL = '/api/entries';
const AUTH_URL = '/api/auth';
const LABELS_URL = '/api/labels';
const PROFILE_URL = '/api/profile';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

export const registerUser = async (payload) => {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) throw new Error('Registration failed');
  const text = await response.text();
  return text ? JSON.parse(text) : null; 
};

export const loginUser = async (payload) => {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
     if (response.status === 401) throw new Error('Invalid credentials');
     throw new Error('Login failed');
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : null; 
};

export const getProfile = async () => {
  const response = await fetchWithAuth(PROFILE_URL);
  if (!response.ok) throw new Error('Failed to fetch profile');
  return await response.json();
};

export const updateProfile = async (payload) => {
  const response = await fetchWithAuth(PROFILE_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update profile');
  }
  return await response.json();
};

export const createLabel = async (payload) => {
  const response = await fetchWithAuth(LABELS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create label');
  }
  return await response.json();
};

export const getEntries = async () => {
  const response = await fetchWithAuth(ENTRIES_URL);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  return await response.json();
};

export const createEntry = async (payload) => {
  const response = await fetchWithAuth(ENTRIES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Failed to create entry: ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null; 
};

export const updateEntry = async (id, payload) => {
  const response = await fetchWithAuth(`${ENTRIES_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Failed to update entry with ID: ${id}`);
  return await response.json(); 
};

export const deleteEntry = async (id) => {
  const response = await fetchWithAuth(`${ENTRIES_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Failed to delete entry with ID: ${id}`);
  return true; 
};

export const getLabels = async () => {
  const response = await fetchWithAuth(LABELS_URL);
  if (!response.ok) throw new Error('Failed to fetch labels');
  return await response.json();
};

export const updateLabel = async (id, payload) => {
  const response = await fetchWithAuth(`${LABELS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update label');
  }
  return await response.json();
};

export const deleteLabel = async (id) => {
  const response = await fetchWithAuth(`${LABELS_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete label');
  return true;
};

export const getDashboardStats = async () => {
  const response = await fetchWithAuth(`${ENTRIES_URL}/dashboard-stats`);
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return await response.json();
};

export const getFilteredEntries = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  if (filters.labelNames && filters.labelNames.length > 0) {
    filters.labelNames.forEach(name => params.append('labelNames', name));
  }

  const response = await fetchWithAuth(`${ENTRIES_URL}/analytics?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch filtered entries');
  return await response.json();
};