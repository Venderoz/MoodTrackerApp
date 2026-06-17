const API_URL = '/api/entries';
const AUTH_URL = '/api/auth';
const LABELS_URL = '/api/labels';

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
  
  if (!response.ok) throw new Error('Login failed');
  
  const text = await response.text();
  return text ? JSON.parse(text) : null; 
};

export const getEntries = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  return await response.json();
};

export const getLabels = async () => {
  const response = await fetch(LABELS_URL);
  if (!response.ok) throw new Error('Failed to fetch labels');
  return await response.json();
};

export const createEntry = async (payload) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Failed to create entry: ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null; 
};

export const updateEntry = async (id, payload) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Failed to update entry with ID: ${id}`);
  return await response.json(); 
};

export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/dashboard-stats`);
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

  const response = await fetch(`${API_URL}/analysis?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch filtered entries');
  return await response.json();
};