// src/pages/UserManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, registerStaff } from '../api/authService'; // <<< IMPORT NEW FUNCTIONS
import { getToken } from '../utils/localStorage';

const UserManagementPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
    const [loading, setLoading] = useState(true);
    
    // Initial load and security guard
    useEffect(() => {
        // Simple authentication check
        if (!getToken()) {
            navigate('/login');
            return;
        }
        fetchAllUsersData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const fetchAllUsersData = async () => {
        try {
            // 🟢 Fetches all users using the dedicated Admin endpoint
            const response = await fetchAllUsers(); 
            setUsers(response.data);
            setMessage(`Found ${response.data.length} total users and staff.`);
        } catch (error) {
            setMessage("Failed to fetch user list. Ensure the backend endpoint is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterStaff = async (e) => {
        e.preventDefault();
        try {
            // 🟢 Calls the service to register a new staff member (ROLE_PICKUP)
            await registerStaff(formData);
            alert(`New Pickup Personnel registered successfully!`);
            setFormData({ name: '', email: '', password: '', phone: '', address: '' }); // Clear form
            fetchAllUsersData(); // Refresh list
        } catch (error) {
            alert(`Registration Failed: ${error.response?.data || 'Server error'}`);
        }
    };

    if (loading) return <div className="container mt-5">Loading User Management...</div>;

    return (
        <div className="container mt-5" style={{ maxWidth: '1200px' }}>
            <h2 className="fw-bold mb-4" style={{ color: '#b91c1c' }}>Admin User Management</h2>
            <button onClick={() => navigate('/profile')} className="btn btn-secondary mb-4">
                ← Back to Admin Hub
            </button>
            <p className="text-muted">{message}</p>
            
            {/* --- 1. Register New Pickup Staff Form --- */}
            <div className="card shadow-lg p-4 mb-5 border-danger">
                <h4 className="card-title" style={{ color: '#388e3c' }}>Register New Pickup Personnel</h4>
                <form onSubmit={handleRegisterStaff} className="row g-3 mt-2">
                    <div className="col-md-3"><input type="text" name="name" placeholder="Name" onChange={handleFormChange} value={formData.name} className="form-control" required /></div>
                    <div className="col-md-3"><input type="email" name="email" placeholder="Email" onChange={handleFormChange} value={formData.email} className="form-control" required /></div>
                    <div className="col-md-2"><input type="password" name="password" placeholder="Password" onChange={handleFormChange} value={formData.password} className="form-control" required /></div>
                    <div className="col-md-2"><input type="text" name="phone" placeholder="Phone" onChange={handleFormChange} value={formData.phone} className="form-control" /></div>
                    <div className="col-md-2">
                        <button type="submit" className="btn btn-success w-100">Register Staff</button>
                    </div>
                    <div className="col-12"><input type="text" name="address" placeholder="Address (Optional)" onChange={handleFormChange} value={formData.address} className="form-control" /></div>

                </form>
            </div>

            {/* --- 2. List All Users Table --- */}
            <h4 className="fw-bold mb-3" style={{ color: '#0277bd' }}>All Registered Users & Staff</h4>
            <div className="table-responsive card shadow-sm">
                <table className="table table-hover table-striped mb-0">
                    <thead className="bg-primary text-white" style={{ background: '#0277bd' }}>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || 'N/A'}</td>
                                <td>{user.address || 'N/A'}</td>
                                {/* Differentiate roles visually */}
                                <td><span className={`badge bg-${user.role === 'ROLE_ADMIN' ? 'danger' : (user.role === 'ROLE_PICKUP' ? 'success' : 'secondary')}`}>{user.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementPage;