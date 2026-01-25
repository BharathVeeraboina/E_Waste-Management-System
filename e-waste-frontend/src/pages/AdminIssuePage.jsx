// src/pages/AdminIssuePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// NOTE: Assuming you implement fetchReportedIssues in authService.js
import { fetchReportedIssues } from '../api/authService'; 
import { getRole } from '../utils/localStorage';

const AdminIssuePage = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('Loading reported issues...');
    const userRole = getRole();

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OPEN': return 'badge bg-danger text-white';
            case 'IN_PROGRESS': return 'badge bg-warning text-dark';
            case 'RESOLVED': return 'badge bg-success';
            case 'CLOSED': return 'badge bg-secondary';
            default: return 'badge bg-light text-dark';
        }
    };

    const fetchIssues = async () => {
        try {
            // 🟢 Calls the endpoint: GET /api/issues/admin/all
            const response = await fetchReportedIssues();
            setIssues(response.data);
            setMessage(`Found ${response.data.length} total issues.`);
        } catch (error) {
            setMessage("Failed to load issues list. Ensure the backend endpoint is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Security guard: Only allow Admin access
        if (userRole !== 'ROLE_ADMIN') {
            navigate('/profile');
            return;
        }
        fetchIssues();
    }, [navigate, userRole]);

    if (loading) return <div className="container mt-5">Loading Issues...</div>;

    return (
        <div className="container mt-5" style={{ maxWidth: '1000px' }}>
            <h2 className="fw-bold mb-4" style={{ color: '#b91c1c' }}>Reported System Issues</h2>
            <button onClick={() => navigate('/profile')} className="btn btn-secondary mb-4">
                ← Back to Admin Hub
            </button>
            <p className="text-muted">{message}</p>

            {/* --- Issues Table --- */}
            <div className="table-responsive card shadow-sm">
                <table className="table table-hover table-striped mb-0">
                    <thead style={{ background: '#b91c1c', color: 'white' }}>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Reported By (Email)</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {issues.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-4">No open issues found.</td></tr>
                        ) : (
                            issues.map((issue) => (
                                <tr key={issue.id}>
                                    <td>{issue.id}</td>
                                    <td>{issue.issueTitle}</td>
                                    <td>{issue.user?.email || 'N/A'}</td>
                                    <td><span className={`badge bg-primary`}>{issue.reporterRole}</span></td>
                                    <td><span className={getStatusBadge(issue.status)}>{issue.status}</span></td>
                                    <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                                    <td>
                                            {/* 🟢 CRITICAL FIX: Link to the detail page */}
                                        <a href={`/admin/issues/details/${issue.id}`} className="btn btn-sm btn-outline-primary">
                                            View Details
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminIssuePage;