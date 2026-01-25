import React, { useState, useEffect } from 'react';
import axios from 'axios';
// FIX: Import API function from the correct file
import { fetchAllRequests } from '../api/authService'; 
import { getRole, getToken } from '../utils/localStorage'; 
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('Loading requests...');
    const userRole = getRole();
    const navigate = useNavigate();
    
    const PICKUP_PERSONNEL_EMAIL = 'pickup@ewaste.com'; 
    
    const [scheduleData, setScheduleData] = useState({
        requestId: null,
        scheduledAt: '',
        pickupPersonnel: PICKUP_PERSONNEL_EMAIL 
    });
    const [showScheduleModal, setShowScheduleModal] = useState(false); 
    
    // Helper function to render status badges
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return 'badge bg-warning text-dark';
            case 'APPROVED': return 'badge bg-primary';
            case 'SCHEDULED': return 'badge bg-info';
            case 'REJECTED': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };
    
    // --- Data Fetching and Role Guard ---
    
    useEffect(() => {
        // 1. Guard against non-admin access or unauthenticated users
        if (userRole !== 'ROLE_ADMIN' || !getToken()) {
            navigate('/profile'); // Send non-admins back to the profile hub
            return;
        }
        fetchAllRequestsData();
    }, [userRole, navigate]); 

    const fetchAllRequestsData = async () => {
        try {
            const response = await fetchAllRequests(); 
            setRequests(response.data);
            setMessage(`Found ${response.data.length} total requests.`);
        } catch (error) {
            setMessage("Failed to load admin data. Ensure backend endpoints are running.");
            setRequests([]); 
        } finally {
            setLoading(false);
        }
    };
    
    // --- Management Actions ---
    
    const handleInitialAction = async (requestId, status, rejectionReason = null) => {
        if (status === 'REJECTED' && !rejectionReason) {
             alert("Please provide a rejection reason before rejecting.");
             return;
        }
        
        const payload = { status: status, rejectionReason: rejectionReason };

        try {
            await axios.put(`http://localhost:8080/api/requests/admin/status/${requestId}`, payload);
            
            // CRITICAL LOGIC: If APPROVED, open the scheduling modal next.
            if (status === 'APPROVED') {
                openScheduleModal(requestId);
            } else {
                alert(`Request ${status} successful for Request ID ${requestId}`);
                fetchAllRequestsData(); // Refresh the list for rejected requests
            }
        } catch (error) {
            alert(`Action failed: ${error.response?.data?.message || 'Server error'}`);
        }
    };
    
    const openScheduleModal = (requestId) => {
        setScheduleData({ 
            requestId: requestId, 
            scheduledAt: new Date().toISOString().substring(0, 16), // Default to current time
            pickupPersonnel: PICKUP_PERSONNEL_EMAIL // Default to the fixed staff email
        });
        setShowScheduleModal(true);
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = { 
            status: 'SCHEDULED', 
            scheduledAt: scheduleData.scheduledAt,
            pickupPersonnel: scheduleData.pickupPersonnel
        };

        try {
            await axios.put(`http://localhost:8080/api/requests/admin/status/${scheduleData.requestId}`, payload);
            
            alert(`Request ${scheduleData.requestId} scheduled successfully!`);
            setShowScheduleModal(false); // Close modal on success
            fetchAllRequestsData(); // Refresh the list
        } catch (error) {
            alert(`Scheduling failed: ${error.response?.data?.message || 'Server error'}`);
        }
    };

    // --- Render Logic ---
    
    if (loading) return <div className="container mt-5">Loading Admin Panel...</div>;

    return (
        <div className="container mt-5">
            <h2 className="text-danger mb-4">Admin Request Management</h2>
            <p className="text-muted">{message}</p>
            
            {/* 🟢 MODAL/FORM FOR SCHEDULING (Hidden unless triggered by Approve) */}
            {showScheduleModal && (
                <div className="card p-4 mb-4 border-info shadow-lg">
                    <h5 className="text-info mb-4">Schedule Pickup for Request #{scheduleData.requestId}</h5>
                    <form onSubmit={handleScheduleSubmit}>
                        
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Date/Time:</label>
                                <input type="datetime-local" className="form-control"
                                    value={scheduleData.scheduledAt}
                                    onChange={(e) => setScheduleData({...scheduleData, scheduledAt: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Pickup Personnel Email:</label>
                                <input type="email" className="form-control"
                                    value={scheduleData.pickupPersonnel}
                                    onChange={(e) => setScheduleData({...scheduleData, pickupPersonnel: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-outline-secondary">Cancel</button>
                            <button type="submit" className="btn btn-info">Confirm Schedule</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- Request Management Table --- */}
            <div className="card shadow-lg">
                <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0">
                        <thead className="bg-danger text-white" style={{ background: '#b91c1c' }}>
                            <tr>
                                <th>ID</th>
                                <th>User Email</th>
                                <th>Device / Qty</th>
                                <th>Condition</th>
                                <th>Pickup Address</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-4">No new requests submitted.</td></tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id}>
                                        {/* 🟢 Navigation link to detail view (Milestone 3) */}
                                        <td>
                                            <a href={`/admin/requests/${req.id}`} className="fw-bold text-primary text-decoration-none">
                                                {req.id}
                                            </a>
                                        </td>
                                        <td>{req.user ? req.user.email : 'N/A'}</td> 
                                        <td>{req.deviceType} ({req.quantity})</td>
                                        <td>{req.deviceCondition}</td>
                                        <td>{req.pickupAddress}</td>
                                        <td>
                                            <span className={getStatusBadge(req.status)}>{req.status}</span>
                                        </td>
                                        <td>
                                            {/* Actions based on status */}
                                            {req.status === 'PENDING' && (
                                                <>
                                                    {/* Step 1: Approve or Reject */}
                                                    <button onClick={() => handleInitialAction(req.id, 'APPROVED')} className="btn btn-success btn-sm me-2">Approve</button>
                                                    <button onClick={() => handleInitialAction(req.id, 'REJECTED', 'Missing parts/Non-Compliant.')} className="btn btn-danger btn-sm">Reject</button>
                                                </>
                                            )}
                                            {/* 🟢 Step 2: Show Schedule Button ONLY AFTER Approval */}
                                            {req.status === 'APPROVED' && (
                                                <button onClick={() => openScheduleModal(req.id)} className="btn btn-info btn-sm">
                                                    🗓️ Schedule Pickup
                                                </button>
                                            )}
                                            {/* Final Statuses */}
                                            {(req.status === 'SCHEDULED' || req.status === 'REJECTED') && (
                                                <small className="text-success">Action Complete.</small>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* End Table */}
            <div className="mt-4 text-center">
                <button onClick={() => navigate('/profile')} className="btn btn-secondary">
                    ← Back to Profile Hub
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;