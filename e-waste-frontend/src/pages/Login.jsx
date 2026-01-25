import React, { useState } from 'react';
import { login } from '../api/authService';
import { setToken } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ 
        email: '', 
        password: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    
    // NOTE: This component no longer needs to worry about Admin/Pickup emails; 
    // it just sends what the user types.

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const loginData = {
            email: credentials.email,
            password: credentials.password
        };

        try {
            const response = await login(loginData);
            
            // Extract the role from the backend response
            const { accessToken, role } = response.data; 
            const email = loginData.email;

            setToken({ accessToken, role, email }); 
            
            setMessage('✅ Login Successful! Redirecting...');
            
            // 🟢 FINAL FIX: Always redirect to the common protected hub, /profile.
            navigate('/profile'); 
            
        } catch (error) {
            setMessage('❌ Login Failed: Invalid credentials or network error.');
            console.error(error);
        }
    };

    return (
        <div className="form-container login-card-wrapper"> 
            <h2 className="text-center app-title-login">E-Waste Login</h2>
            <p className="text-center text-muted mb-4 small">Enter your credentials to access your portal.</p>
            
            <form onSubmit={handleSubmit}>
                
                {/* Email Field - Now universal input */}
                <div className="mb-3">
                    <input 
                        type="email" 
                        name="email" 
                        placeholder={'Email Address'}
                        value={credentials.email} 
                        onChange={handleChange} 
                        className="form-control" 
                        required 
                    />
                </div>
                
                {/* Password Field */}
                <div className="mb-4">
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        onChange={handleChange} 
                        className="form-control" 
                        required 
                    />
                </div>
                
                <button type="submit" className="btn btn-success w-100 mt-2 py-2">Log In</button>
            </form>
            
            {message && <p className={`mt-3 text-center ${message.startsWith('✅') ? 'text-success' : 'text-danger'}`}>{message}</p>}
            <p className="mt-4 text-center">Need a regular user account? <a href="/register" className="text-decoration-none">Register here</a></p>
        </div>
    );
};

export default Login;