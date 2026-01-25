// src/pages/IssueDetail.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getRole } from '../utils/localStorage';
// Assuming fetchSingleIssue and updateIssueStatus are exported from authService
import { updateIssueStatus } from '../api/authService'; 


const IssueDetail = () => {
    const { issueId } = useParams();
    const navigate = useNavigate();
    const userRole = getRole();
    const isAdmin = userRole === 'ROLE_ADMIN';
    
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [adminReplyText, setAdminReplyText] = useState(''); // State for Admin's text input

    const API_BASE_URL = 'http://localhost:8080/api/issues'; 

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OPEN': return 'badge bg-danger text-white';
            case 'IN_PROGRESS': return 'badge bg-warning text-dark';
            case 'RESOLVED': return 'badge bg-success';
            case 'CLOSED': return 'badge bg-secondary';
            default: return 'badge bg-light text-dark';
        }
    };

    useEffect(() => {
        fetchIssueDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [issueId]);

    // --- Data Fetching ---
    const fetchIssueDetails = async () => {
        try {
            // Fetch single issue details (GET /api/issues/{id})
            const response = await axios.get(`${API_BASE_URL}/${issueId}`);
            setIssue(response.data);
            setMessage(`Issue #${issueId} details loaded.`);
            // Pre-fill the reply text area if an old reply exists
            setAdminReplyText(response.data.adminReply || '');
            
        } catch (error) {
            setMessage(`❌ Failed to load issue: ${error.response?.data || error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Admin Action Handler ---
    const handleUpdateAction = async (newStatus) => {
        if (!adminReplyText && (newStatus === 'RESOLVED' || newStatus === 'CLOSED')) {
            alert("Please provide a final closing comment before setting status to Resolved/Closed.");
            return;
        }

        const payload = { 
            status: newStatus, 
            adminReply: adminReplyText 
        };
        
        try {
            // Calls the new PUT endpoint: /api/issues/{issueId}/update
            await updateIssueStatus(issueId, payload);
            alert(`Issue status updated to ${newStatus}!`);
            fetchIssueDetails(); // Refresh view
            
        } catch (error) {
            alert(`Action failed: ${error.response?.data || 'Server error'}`);
        }
    };

    if (loading) return <div className="container mt-5">Loading Issue Details...</div>;
    if (!issue) return <div className="container mt-5 text-danger">{message}</div>;

    return (
        <div className="container mt-5" style={{ maxWidth: '900px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: '#b91c1c' }}>Issue Report: {issue.issueTitle}</h2>
                <button onClick={() => navigate('/admin/issues')} className="btn btn-secondary">
                    ← Back to All Issues
                </button>
            </div>
            
            <div className="card shadow-lg p-5">
                
                {/* User/Staff Reported Details */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <p><strong>Reported By:</strong> {issue.user?.email || 'N/A'}</p>
                        <p><strong>Reporter Role:</strong> <span className={`badge bg-primary`}>{issue.reporterRole}</span></p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <p><strong>Current Status:</strong> <span className={getStatusBadge(issue.status)}>{issue.status}</span></p>
                        <p><strong>Date Filed:</strong> {new Date(issue.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <hr />

                {/* Detailed Issue Description */}
                <div className="alert alert-light p-4 border">
                    <h5 className="fw-bold">User Description:</h5>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{issue.description}</p>
                </div>
                
                {/* -------------------- ADMIN REPLY / USER TRACKING -------------------- */}
                <div className="mt-4">
                    <h5 className="fw-bold" style={{ color: '#0277bd' }}>Administrative Response:</h5>
                    
                    {issue.adminReply ? (
                        <div className="alert alert-success p-3">
                            <p style={{ whiteSpace: 'pre-wrap' }}>{issue.adminReply}</p>
                        </div>
                    ) : (
                        <p className="text-muted fst-italic">A response is pending.</p>
                    )}
                </div>
                
                {/* -------------------- ADMIN ACTION FORM (ADMIN ONLY) -------------------- */}
                {isAdmin && issue.status !== 'RESOLVED' && issue.status !== 'CLOSED' && (
                    <div className="mt-5 border-top pt-4">
                        <h5 className="fw-bold text-danger mb-3">Admin Management Actions</h5>
                        
                        <textarea 
                            placeholder="Type a message/update for the user here (required for resolving)..." 
                            value={adminReplyText} 
                            onChange={(e) => setAdminReplyText(e.target.value)} 
                            className="form-control mb-3"
                            rows="3"
                        />
                        
                        <div className="d-flex gap-3">
                            <button 
                                onClick={() => handleUpdateAction('IN_PROGRESS')} 
                                className="btn btn-warning"
                            >
                                Mark as In Progress
                            </button>
                            <button 
                                onClick={() => handleUpdateAction('RESOLVED')} 
                                className="btn btn-success"
                                disabled={!adminReplyText}
                            >
                                ✅ Mark as Resolved & Send Reply
                            </button>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default IssueDetail;