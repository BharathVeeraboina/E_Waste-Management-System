// src/pages/RequestDetail.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getRole } from '../utils/localStorage';

const RequestDetail = () => {
    const { requestId } = useParams(); // Get the ID from the URL (e.g., /admin/requests/5)
    const navigate = useNavigate();
    const userRole = getRole();
    
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/requests`; 
    const UPLOAD_BASE_URL = `${import.meta.env.VITE_API_URL}`; // Base URL for serving static files

    // State for tracking active image view
    const [activeImage, setActiveImage] = useState(null); 

    useEffect(() => {
        if (userRole !== 'ROLE_ADMIN') {
            navigate('/profile'); // Security guard
            return;
        }
        fetchRequestDetails();
    }, [requestId, userRole, navigate]);

    // --- Data Fetching ---
    const fetchRequestDetails = async () => {
        try {
            // NOTE: We need a new backend GET endpoint: /api/requests/{id}
            const response = await axios.get(`${API_BASE_URL}/${requestId}`);
            setRequest(response.data);

            // Parse image paths for display
            if (response.data.imagePaths) {
                const paths = response.data.imagePaths.split(',').filter(p => p.trim() !== '');
                setActiveImage(paths[0] || null); // Set the first image as active
                setRequest(r => ({ ...r, parsedImages: paths }));
            }
            
        } catch (error) {
            setMessage(`❌ Failed to load request: ${error.response?.data || error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Action Handlers ---
    const handleAdminAction = async (status, reason = '') => {
        if (status === 'REJECTED' && !reason) {
            alert("Please provide a rejection reason.");
            return;
        }
        
        const payload = { 
            status: status, 
            rejectionReason: reason,
            // For SCHEDULED, include dummy data for now
            scheduledAt: status === 'SCHEDULED' ? new Date().toISOString() : null,
            pickupPersonnel: status === 'SCHEDULED' ? 'Admin Team' : null
        };
        
        try {
            // Calls the PUT endpoint implemented in Milestone 3 planning
            await axios.put(`${API_BASE_URL}/admin/status/${requestId}`, payload);
            alert(`Request ${status} successfully!`);
            navigate('/admin/dashboard'); // Go back to management table

        } catch (error) {
            alert(`Action failed: ${error.response?.data || 'Server error'}`);
        }
    };

    if (loading) return <div className="container mt-5">Loading Request Details...</div>;
    if (!request) return <div className="container mt-5 text-danger">Request ID {requestId} not found.</div>;

    // Split image paths for easier rendering
    const imageList = request.parsedImages || [];

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Review E-Waste Request #{requestId}</h2>
            
            <div className="row">
                
                {/* -------------------- IMAGE PREVIEW COLUMN -------------------- */}
                <div className="col-lg-6">
                    <div className="card shadow-sm p-3 mb-4">
                        <h5 className="text-secondary mb-3">Device Photos ({imageList.length})</h5>
                        
                        {activeImage ? (
                            <div className="main-image-container mb-3" style={{ border: '1px solid #ccc', maxHeight: '400px', overflow: 'hidden' }}>
                                {/* Display Active Image */}
                                <img src={`${UPLOAD_BASE_URL}${activeImage}`} alt="Device View" className="img-fluid" style={{ width: '100%', display: 'block' }} />
                            </div>
                        ) : (
                            <p className="alert alert-warning">No images uploaded for this request.</p>
                        )}
                        
                        {/* Image Thumbnail Selector */}
                        <div className="d-flex gap-2 overflow-auto">
                            {imageList.map((path, index) => (
                                <img
                                    key={index}
                                    src={`${UPLOAD_BASE_URL}${path}`}
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`img-thumbnail ${path === activeImage ? 'border-primary border-3' : ''}`}
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                    onClick={() => setActiveImage(path)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* -------------------- DETAILS & ACTION COLUMN -------------------- */}
                <div className="col-lg-6">
                    <div className="card shadow-sm p-4">
                        <h5 className="text-success mb-3">Request Details</h5>
                        <p><strong>User Email:</strong> {request.user?.email || 'N/A'}</p>
                        <p><strong>Device:</strong> {request.deviceType} ({request.brand} {request.model})</p>
                        <p><strong>Condition:</strong> <span className="badge bg-secondary">{request.deviceCondition}</span></p>
                        <p><strong>Quantity:</strong> {request.quantity}</p>
                        <p><strong>Pickup Address:</strong> {request.pickupAddress}</p>
                        <p><strong>Remarks:</strong> {request.remarks || 'None provided.'}</p>
                        <hr />

                        {request.status === 'PENDING' && (
                            <>
                                <h5 className="text-danger mb-3">Admin Actions</h5>
                                <button 
                                    onClick={() => handleAdminAction('APPROVED')} 
                                    className="btn btn-success w-100 mb-2"
                                >
                                    ✅ Approve Request
                                </button>
                                
                                <button 
                                    onClick={() => handleAdminAction('SCHEDULED')} 
                                    className="btn btn-info w-100 mb-2"
                                >
                                    🗓️ Schedule Pickup
                                </button>
                                
                                {/* Rejection logic needs a reason input */}
                                <input 
                                    type="text" 
                                    placeholder="Enter reason for rejection" 
                                    value={rejectionReason} 
                                    onChange={(e) => setRejectionReason(e.target.value)} 
                                    className="form-control mb-2"
                                />
                                <button 
                                    onClick={() => handleAdminAction('REJECTED', rejectionReason)} 
                                    className="btn btn-danger w-100"
                                    disabled={!rejectionReason}
                                >
                                    ❌ Reject Request
                                </button>
                            </>
                        )}
                        
                        {/* Display current status if not pending */}
                        {request.status !== 'PENDING' && (
                            <div className="alert alert-success mt-3">
                                Status: <span className={getStatusBadge(request.status)}>{request.status}</span>.
                                {request.status === 'SCHEDULED' && <p className="mt-2 small">Scheduled for: {new Date(request.scheduledAt).toLocaleString()}. Personnel: {request.pickupPersonnel}.</p>}
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
                    ← Back to Management Table
                </button>
            </div>
        </div>
    );
};

export default RequestDetail;