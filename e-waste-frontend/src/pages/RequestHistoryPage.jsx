// src/pages/RequestHistoryPage.jsx

import React, { useState, useEffect } from 'react';
import { fetchUserRequests } from '../api/authService';
import { useNavigate } from 'react-router-dom';

const RequestHistoryPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('Fetching history...');
    const navigate = useNavigate();

    // Define thematic colors
    const PRIMARY_GREEN = '#388e3c';
    const PRIMARY_BLUE = '#0277bd';
    const BACKGROUND_SOFT = '#f0f5f0'; // Very light green background

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return 'badge bg-warning text-dark px-3 py-2 fw-bold';
            case 'APPROVED': return 'badge bg-primary px-3 py-2 fw-bold';
            case 'SCHEDULED': return 'badge bg-info px-3 py-2 fw-bold';
            case 'REJECTED': return 'badge bg-danger px-3 py-2 fw-bold';
            default: return 'badge bg-secondary px-3 py-2 fw-bold';
        }
    };

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const requestsResponse = await fetchUserRequests(); 
                setRequests(requestsResponse.data || []);
                setMessage(`Found ${requestsResponse.data.length} submissions.`);
            } catch (error) {
                console.error("Failed to load requests:", error);
                setMessage("Failed to load request history.");
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, []); 

    if (loading) return <div className="container mt-5">Loading History...</div>;

    return (
        <div style={{ backgroundColor: BACKGROUND_SOFT, minHeight: '100vh', paddingTop: '80px', position: 'relative' }}>
            <div className="container py-4" style={{ maxWidth: '1000px' }}>
                
                {/* 🟢 CRITICAL FIX: FIXED BACK BUTTON */}
                <button 
                    onClick={() => navigate('/profile')} 
                    className="btn btn-sm shadow-sm"
                    style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100, background: 'white', color: PRIMARY_BLUE }}
                >
                    ← Back to Profile Hub
                </button>

                <h2 className="fw-bold mb-3" style={{ color: PRIMARY_GREEN }}>
                    Your Submission History
                </h2>
                <p className="text-muted">{message}</p>

                {/* Summary Card */}
                <div className="card shadow-sm p-4 mb-4" style={{ borderLeft: `5px solid ${PRIMARY_BLUE}` }}>
                    <div className="row text-center">
                        <div className="col-md-6">
                            <h4 className="fw-bolder" style={{ color: PRIMARY_GREEN }}>{requests.length}</h4>
                            <p className="text-muted mb-0">Total Submissions Recorded</p>
                        </div>
                        <div className="col-md-6">
                            <h4 className="fw-bolder" style={{ color: PRIMARY_BLUE }}>
                                {requests.filter(r => r.status === 'APPROVED' || r.status === 'SCHEDULED').length}
                            </h4>
                            <p className="text-muted mb-0">Scheduled for Pickup / Approved</p>
                        </div>
                    </div>
                </div>

                
                {/* History List */}
                {requests.length === 0 ? (
                    <p className="alert alert-info mt-4">You have not submitted any requests yet.</p>
                ) : (
                    <div className="list-group shadow-lg mt-4">
                        {requests.map((req) => (
                            <div key={req.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start p-3">
                                
                                {/* Left Side: Details */}
                                <div className="flex-grow-1">
                                    <h5 className="mb-1 fw-bold">{req.deviceType} ({req.quantity})</h5>
                                    <p className="mb-1 small text-muted">Condition: {req.deviceCondition} | Brand: {req.brand || 'N/A'}</p>
                                    <p className="mb-0 small">Pickup Address: <strong>{req.pickupAddress}</strong></p>
                                </div>

                                {/* Right Side: Status */}
                                <div className="text-end">
                                    <span className={getStatusBadge(req.status)}>{req.status}</span>
                                    <p className="small text-muted mt-2 mb-0">
                                        Submitted: {new Date(req.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="text-center mt-5">
                    <p className="text-muted small">End of Report.</p>
                </div>

            </div>
        </div>
    );
};

export default RequestHistoryPage;