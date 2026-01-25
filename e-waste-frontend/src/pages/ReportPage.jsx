// src/pages/ReportPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, getEmail } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';

const ReportPage = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('Generating report...');
    const navigate = useNavigate();

    // Helper to get status badges (restored from original code)
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return 'badge bg-warning text-dark';
            case 'APPROVED': return 'badge bg-primary';
            case 'SCHEDULED': return 'badge bg-info';
            case 'REJECTED': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            const token = getToken();
            const email = getEmail();
            
            // Fetch report data
            const response = await axios.get('http://localhost:8080/api/requests/report', {
                headers: {
                    'X-User-Email': email,
                    'Authorization': `Bearer ${token}` 
                }
            });
            setReport(response.data);
            setMessage(`Report generated successfully.`);
        } catch (error) {
            setMessage("Failed to load report data.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    

    // 🟢 CRITICAL FIX: Download function defined inside the component
    const downloadPdf = async () => {
        // Access user name from the report state
        const userName = report.userName; 
        
        try {
            const response = await axios.get('http://localhost:8080/api/requests/report/certificate', {
                responseType: 'blob', // Expect binary data (PDF)
                headers: {
                    'X-User-Email': getEmail(),
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            
            // Trigger browser download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            // Use the correct name from the report data for the filename
            link.setAttribute('download', `EcoWaste_Certificate_${userName.replace(/\s+/g, '_')}.pdf`); 
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            // Check for 404/400 to show not eligible message
            alert(`Certificate download failed. You may not be eligible (min 10 submissions required).`);
            console.error(error);
        }
    };

    if (loading) return <div className="container mt-5">Loading Report...</div>;
    if (!report) return <div className="container mt-5 text-danger">{message}</div>;

    const { userName, totalSubmissions, completedSubmissions, eligibleForCertificate, requestHistory } = report;

    return (
        <div className="container mt-5">
            <h2 className="mb-4" style={{ color: '#0277bd' }}>E-Waste Contribution Report</h2>
            <div className="card p-4 shadow-sm mb-5">
                
                {/* --- CERTIFICATE SECTION (Conditional) --- */}
                {eligibleForCertificate ? (
                    <div className="alert alert-success border-5 border-success text-center py-4">
                        <h3 className="fw-bolder">🎉 Congratulations, {userName}!</h3>
                        <p className="lead mb-3">You are eligible for the Eco-Contributor Certificate!</p>
                        {/* Button now correctly calls the defined function */}
                        <button onClick={downloadPdf} className="btn btn-lg btn-success"> 
                            Download Certificate
                        </button>
                    </div>
                ) : (
                    <div className="alert alert-info text-center">
                        <p className="mb-1">You need **{10 - completedSubmissions}** more completed submissions to earn your certificate.</p>
                        <p className="m-0">Total Completed Submissions: {completedSubmissions}</p>
                    </div>
                )}
                
                {/* --- SUMMARY --- */}
                <div className="row text-center mt-4">
                    <div className="col-md-6">
                        <h5 className="fw-bold text-success">{completedSubmissions}</h5>
                        <p className="text-muted">Completed Pickups</p>
                    </div>
                    <div className="col-md-6">
                        <h5 className="fw-bold text-dark">{totalSubmissions}</h5>
                        <p className="text-muted">Total Submissions</p>
                    </div>
                </div>
            </div>

            {/* --- DETAILED REQUEST HISTORY --- */}
            <h4 className="mb-3">Detailed Submission History</h4>
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Device</th>
                            <th>Status</th>
                            <th>Date Submitted</th>
                            <th>Pickup Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requestHistory.map((req) => (
                            <tr key={req.id}>
                                <td>{req.id}</td>
                                <td>{req.deviceType} ({req.quantity})</td>
                                <td><span className={getStatusBadge(req.status)}>{req.status}</span></td>
                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td>{req.pickupAddress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-5 text-center">
                <button onClick={() => navigate('/profile')} className="btn btn-secondary">
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ReportPage;