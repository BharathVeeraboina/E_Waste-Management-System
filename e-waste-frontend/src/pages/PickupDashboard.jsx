// src/pages/PickupDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getRole, getToken, getEmail } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { fetchPickupTasks, initiatePickupVerification, verifyAndCompletePickup } from '../api/authService'; 

const PickupDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const userRole = getRole();
    const navigate = useNavigate();

    // OTP Workflow States
    const [otp, setOtp] = useState(''); 
    const [currentRequestId, setCurrentRequestId] = useState(null); 
    const [isOtpSent, setIsOtpSent] = useState(false); 

    // Helper for status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'SCHEDULED': return 'badge bg-primary px-3 py-2 fw-bold';
            case 'COMPLETED': return 'badge bg-success px-3 py-2 fw-bold';
            default: return 'badge bg-secondary px-3 py-2 fw-bold';
        }
    };


    useEffect(() => {
        // Security guard: Only allow ROLE_PICKUP access
        if (userRole !== 'ROLE_PICKUP' || !getToken()) {
            navigate('/'); 
            return;
        }
        loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRole, navigate]);

    const loadTasks = async () => {
        try {
            const response = await fetchPickupTasks();
            setTasks(response.data || []);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        } finally {
            setLoading(false);
        }
    };
    
    // 🟢 CRITICAL FIX: Handler to redirect to Google Maps
    const handleStartMap = (address) => {
        if (!address) {
            alert("Pickup address is missing for this task.");
            return;
        }
        // Encode the address and create a universal Google Maps URL for navigation
        const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        window.open(mapUrl, '_blank');
    };
    
    // Step 1: Initiate OTP Send
    const handleInitiateVerification = async (requestId, userEmail) => {
        if (!window.confirm(`Confirm pickup initiation? An OTP will be sent to ${userEmail}.`)) {
            return;
        }
        try {
            await initiatePickupVerification(requestId);
            alert(`OTP sent successfully to ${userEmail}. Please ask the user for the code.`);
            setCurrentRequestId(requestId);
            setIsOtpSent(true);
        } catch (error) {
            alert(`Failed to send OTP: ${error.response?.data || error.message}`);
        }
    };
    
    // Step 2: Verify OTP and Complete Task
    const handleVerifyAndComplete = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            alert("Please enter the 6-digit OTP.");
            return;
        }
        
        try {
            await verifyAndCompletePickup(currentRequestId, otp);
            alert(`Pickup Request #${currentRequestId} marked as COMPLETED.`);
            // Reset states and refresh list
            setIsOtpSent(false);
            setCurrentRequestId(null);
            setOtp('');
            loadTasks(); 
        } catch (error) {
            alert(`Verification Failed: ${error.response?.data || error.message}`);
        }
    };

    if (loading) return <div className="container mt-5">Loading Task List...</div>;

    return (
        <div className="container mt-5 py-4" style={{ maxWidth: '1000px' }}>
            <h2 className="fw-bold mb-4" style={{ color: '#1b5e20' }}>Pickup Personnel Task List</h2>
            <p className="text-muted">You have **{tasks.length}** requests recorded.</p>
            
            {/* 🟢 OTP VERIFICATION MODAL/FORM */}
            {isOtpSent && currentRequestId && (
                <div className="card shadow-lg p-4 mb-4 border-info">
                    <h5 className="text-info">Verify Pickup for Request #{currentRequestId}</h5>
                    <p className="small text-muted">A verification code has been sent to the user's email. **This step finalizes the pickup.**</p>
                    <form onSubmit={handleVerifyAndComplete}>
                        <input 
                            type="text" 
                            placeholder="Enter 6-digit OTP from user" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="form-control mb-3"
                            maxLength="6"
                            required
                        />
                        <button type="submit" className="btn btn-success me-2">Verify & Complete</button>
                        <button type="button" onClick={() => setIsOtpSent(false)} className="btn btn-secondary">Cancel</button>
                    </form>
                </div>
            )}


            {/* List Assigned Requests */}
            <div className="list-group shadow-lg">
                {tasks.length === 0 ? (
                    <div className="alert alert-success">No active tasks assigned.</div>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="list-group-item list-group-item-action p-3 mb-2" style={{ borderLeft: `5px solid ${task.status === 'COMPLETED' ? '#2e7d32' : '#0277bd'}` }}>
                            
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 className="mb-1 fw-bold">Request #{task.id} - {task.deviceType}</h5>
                                    <p className="mb-1 small text-muted">Address: <strong>{task.pickupAddress}</strong></p>
                                    <p className="mb-0 small text-dark">Scheduled: {new Date(task.scheduledAt).toLocaleString()}</p>
                                </div>
                                <span className={getStatusBadge(task.status)}>{task.status}</span>
                            </div>

                            {/* 🟢 ACTION BUTTONS AREA */}
                            <div className="d-flex gap-2 mt-3">
                                {/* Start Route Button */}
                                {task.status === 'SCHEDULED' && (
                                    <button onClick={() => handleStartMap(task.pickupAddress)} className="btn btn-sm btn-primary shadow-sm">
                                        Start Route 🗺️
                                    </button>
                                )}

                                {/* Initiation/Verification Button */}
                                {task.status === 'SCHEDULED' && !isOtpSent && (
                                    <button 
                                        onClick={() => handleInitiateVerification(task.id, task.user?.email || 'user')} 
                                        className="btn btn-sm btn-info shadow-sm"
                                    >
                                        Initiate Verification
                                    </button>
                                )}

                                {/* Final Statuses */}
                                {task.status === 'COMPLETED' && (
                                    <p className="text-success fw-semibold mb-0">✅ Task Finalized</p>
                                )}
                            </div>
                            {/* If OTP was sent for THIS task, show the verification status */}
                            {isOtpSent && currentRequestId === task.id && (
                                <p className="text-warning fw-semibold mt-2 mb-0">Code Sent. Enter OTP in the box above.</p>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-5 text-center">
                <button onClick={() => navigate('/profile')} className="btn btn-secondary">
                    ← Back to Profile Hub
                </button>
            </div>
        </div>
    );
};

export default PickupDashboard;