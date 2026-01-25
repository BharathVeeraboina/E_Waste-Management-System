// src/api/authService.js

import axios from 'axios';
// Ensure getEmail is imported
import { getToken, getEmail } from '../utils/localStorage'; 

const BASE_URL = 'http://localhost:8080';
const REQUESTS_URL = `${BASE_URL}/api/requests`;

const protectedAxios = axios.create();

protectedAxios.interceptors.request.use(config => {
  const token = getToken();
  const email = getEmail(); 

  // Add Authorization header
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // CRITICAL FIX: Add custom header for dynamic user lookup in backend
  if (email) { 
    config.headers['X-User-Email'] = email; 
  }
  // IMPORTANT: For multipart, let the browser set the Content-Type header boundary
  
  return config;
}, error => {
  return Promise.reject(error);
});


// ------------------ PUBLIC AUTHENTICATION ENDPOINTS ------------------

export const register = (userData) => {
  return axios.post(`${BASE_URL}/api/auth/register`, userData);
};

export const login = (credentials) => {
  return axios.post(`${BASE_URL}/api/auth/login`, credentials);
};


// ------------------ PROTECTED USER/REQUEST ENDPOINTS ------------------

export const fetchProfile = () => {
  return protectedAxios.get(`${BASE_URL}/api/users/profile`);
};

export const updateProfile = (profileData) => {
  return protectedAxios.put(`${BASE_URL}/api/users/profile`, profileData);
};

export const fetchUserRequests = () => {
    return protectedAxios.get(`${REQUESTS_URL}/my-requests`); 
};

// 🟢 NEW/CRITICAL FIX: Submission function uses protectedAxios to send the required headers
export const submitRequest = (formPayload) => {
    return protectedAxios.post(`${REQUESTS_URL}/submit`, formPayload);
};

// 🟢 NEW: Admin function to get all requests (not just user's)
export const fetchAllRequests = () => {
    // We use protectedAxios here because it's a protected Admin endpoint
    return protectedAxios.get(`${REQUESTS_URL}/admin/all`);
};
export const fetchPickupTasks = () => {
    // This call will automatically send the X-User-Email header via the interceptor.
    return protectedAxios.get(`${REQUESTS_URL}/pickup/my-tasks`); 
};
// 🟢 NEW: Admin function to fetch all users
export const fetchAllUsers = () => {
    // Uses the protectedAxios instance for the admin endpoint
    return protectedAxios.get(`${BASE_URL}/api/admin/users/all`);
};

// 🟢 NEW: Admin function to register staff
export const registerStaff = (formData) => {
    return protectedAxios.post(`${BASE_URL}/api/admin/users/pickup`, formData);
};

// src/api/authService.js (Add this export)

// ... (existing imports and protectedAxios setup) ...

// 🟢 NEW: Function for users to report an issue
export const reportIssue = (data) => {
    // This call will automatically send the X-User-Email header.
    return protectedAxios.post(`${BASE_URL}/api/issues/report`, data);
};

export const fetchReportedIssues = () => {
    // Calls GET /api/issues/admin/all
    return protectedAxios.get(`${BASE_URL}/api/issues/admin/all`);
};

export const updateIssueStatus = (issueId, payload) => {
    return protectedAxios.put(`${BASE_URL}/api/issues/${issueId}/update`, payload);
};

export const fetchMyReportedIssues = () => {
    // This endpoint should be implemented in IssueController.java to fetch issues by email
    return protectedAxios.get(`${BASE_URL}/api/issues/my-issues`); 
};


export const downloadCertificate = () => {
    // Uses axios to request the binary file from the backend endpoint
    return protectedAxios.get(`${BASE_URL}/api/requests/report/certificate`, {
        responseType: 'blob' // CRITICAL: Tells Axios to expect binary data
    });
};

export const completePickupTask = (requestId) => {
    // Calls the PUT /api/requests/pickup/complete/{requestId} endpoint
    const REQUESTS_URL = 'http://localhost:8080/api/requests'; // Assuming this is defined
    return protectedAxios.put(`${REQUESTS_URL}/pickup/complete/${requestId}`);
};

export const initiatePickupVerification = (requestId) => {
    const REQUESTS_URL = `${BASE_URL}/api/requests`;
    return protectedAxios.post(`${REQUESTS_URL}/pickup/verify/initiate/${requestId}`);
};

// 🟢 NEW: Completes the pickup task using the OTP
export const verifyAndCompletePickup = (requestId, otpCode) => {
    const REQUESTS_URL = `${BASE_URL}/api/requests`;
    return protectedAxios.put(`${REQUESTS_URL}/pickup/verify/complete/${requestId}`, { otp: otpCode });
};