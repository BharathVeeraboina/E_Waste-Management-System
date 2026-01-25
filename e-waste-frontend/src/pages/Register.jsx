import React, { useState } from 'react';
import { register } from '../api/authService';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      setMessage('✅ Registration Successful! Please log in.');
      // Use setTimeout to ensure the user sees the success message before redirect
      setTimeout(() => navigate('/login'), 1500); 
    } catch (error) {
      // The server returns a 500 RuntimeException if email exists
      const errorMessage = error.response?.data?.message || 'Server error or email already exists.';
      setMessage(`❌ Registration Failed: ${errorMessage}`);
    }
  };

  return (
    // 🟢 Apply centering and styling container classes
    <div className="form-container login-card-wrapper">
      <h2 className="text-center app-title-login">New User Registration</h2>
      <p className="text-center text-muted mb-4 small">Join EcoWaste to schedule your first pickup.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
            <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
            <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
            {/* Added type="password" for security */}
            <input type="password" name="password" placeholder="Password (Min 6 characters)" onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-4">
            <input type="text" name="address" placeholder="Primary Pickup Address" onChange={handleChange} className="form-control" required />
        </div>
        
        <button type="submit" className="btn btn-success w-100 mt-2 py-2">Register Account</button>
      </form>
      
      {message && <p className={`mt-3 text-center ${message.startsWith('✅') ? 'text-success' : 'text-danger'}`}>{message}</p>}
      
      <p className="mt-4 text-center">
        Already have an account? <a href="/login" className="text-decoration-none">Login here</a>
      </p>
    </div>
  );
};

export default Register;