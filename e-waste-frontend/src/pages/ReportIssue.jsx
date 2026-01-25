// src/pages/ReportIssue.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportIssue } from '../api/authService'; // Function for submitting new issues
// NOTE: Assuming you implement fetchMyReportedIssues in authService.js
import { fetchMyReportedIssues } from '../api/authService'; 
import { getRole } from '../utils/localStorage';

const ReportIssue = () => {
    const [formData, setFormData] = useState({ issueTitle: '', description: '' });
    const [message, setMessage] = useState('');
    const [issues, setIssues] = useState([]); // State for submitted issues
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
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

    // --- Data Fetching: Load User's Previous Issues ---
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                // 🟢 Calls the endpoint: GET /api/issues/my-issues (Fetches only issues reported by current user)
                const response = await fetchMyReportedIssues();
                setIssues(response.data || []);
            } catch (error) {
                console.error("Failed to load issues:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, [userRole]); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Submitting issue...');
        try {
            await reportIssue(formData);
            setMessage('✅ Issue reported successfully! The admin team will review it shortly.');
            setFormData({ issueTitle: '', description: '' }); // Clear form
            fetchIssues(); // Refresh history list
        } catch (error) {
            setMessage(`❌ Submission Failed: ${error.response?.data || 'Network Error'}`);
        }
    };

    if (loading) return <div className="container mt-5">Loading Issue Tracker...</div>;

    return (
        <div className="container mt-5" style={{ maxWidth: '900px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: '#b91c1c' }}>System Issue Reporter & Tracker</h2>
                <button onClick={() => navigate('/profile')} className="btn btn-secondary">
                    ← Back to Profile Hub
                </button>
            </div>
            
            {/* -------------------- 1. NEW ISSUE SUBMISSION FORM -------------------- */}
            <div className="card shadow-lg p-4 mb-5 border-danger">
                <h4 className="mb-3" style={{ color: '#0277bd' }}>Report a New Problem ({userRole})</h4>
                <p className="text-muted small">Use this form for technical errors or critical application issues.</p>
                <form onSubmit={handleSubmit}>
                    
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Title/Summary:</label>
                        <input type="text" name="issueTitle" value={formData.issueTitle} onChange={handleChange} className="form-control" required />
                    </div>
                    
                    <div className="mb-4">
                        <label className="form-label fw-semibold">Detailed Description:</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows="3" required></textarea>
                    </div>

                    <button type="submit" className="btn btn-danger w-100 py-2">Submit Report</button>
                </form>
                {message && <p className={`mt-3 text-center ${message.startsWith('✅') ? 'text-success' : 'text-danger'}`}>{message}</p>}
            </div>
            
            
            {/* -------------------- 2. TRACKING HISTORY -------------------- */}
            <h4 className="fw-bold mb-4 mt-5" style={{ color: '#388e3c' }}>Your Reported Issues ({issues.length})</h4>

            {issues.length === 0 ? (
                <p className="alert alert-info">You have not submitted any issues yet.</p>
            ) : (
                <div className="list-group shadow-sm">
                    {issues.map((issue) => (
                        <div key={issue.id} className="list-group-item list-group-item-action p-4 mb-2" style={{ borderRadius: '8px', borderLeft: `5px solid ${issue.status === 'RESOLVED' ? '#388e3c' : '#b91c1c'}` }}>
                            
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="mb-0 fw-bold">{issue.issueTitle}</h5>
                                <span className={getStatusBadge(issue.status)}>{issue.status}</span>
                            </div>
                            
                            <p className="small text-muted mb-3">Reported: {new Date(issue.createdAt).toLocaleString()}</p>
                            
                            <div className="mb-3">
                                <p><strong>Details:</strong> {issue.description}</p>
                            </div>

                            {/* Admin's Response (Tracking Progress) */}
                            <div className="border-top pt-3">
                                <h6>Admin Response:</h6>
                                {issue.adminReply ? (
                                    <p className="alert alert-success small p-2">{issue.adminReply}</p>
                                ) : (
                                    <p className="fst-italic small text-warning">A response is pending review by the administrator.</p>
                                )}
                            </div>
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportIssue;