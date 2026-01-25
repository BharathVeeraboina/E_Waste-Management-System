import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Submission from './pages/Submission';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage'; 
import ProcessPage from './pages/ProcessPage';
import AdminDashboard from './pages/AdminDashboard';
import RequestDetail from './pages/RequestDetail'; // <<< CRITICAL: IMPORT NEW PAGE
import PickupDashboard from './pages/PickupDashboard';
import ReportPage from './pages/ReportPage';
import RequestHistoryPage from './pages/RequestHistoryPage';
// Import Bootstrap CSS and global App CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 
import UserManagementPage from './pages/UserManagementPage';
import ReportIssue from './pages/ReportIssue';
import AdminIssuePage from './pages/AdminIssuePage';
import IssueDetail from './pages/IssueDetail';

const App = () => {
    return (
               <BrowserRouter>
      <div className="main-app-wrapper">
        <div className="global-animated-bg-wrapper">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} /> 
                    <Route path="/process" element={<ProcessPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes Hubs */}
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/submit" element={<ProtectedRoute><Submission /></ProtectedRoute>} />
                    
                    {/* Admin Management Table */}
                    <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    
                    {/* 🟢 FINAL FIX: ADD DYNAMIC ROUTE FOR REQUEST DETAIL VIEW */}
                    <Route 
                        path="/admin/requests/:requestId" 
                        element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} 
                    />
                    <Route path="/pickup/dashboard" element={<ProtectedRoute><PickupDashboard /></ProtectedRoute>} />
                    
                    {/* Fallback Route */}
                    <Route path="*" element={<h1>404 Not Found</h1>} />
                    <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />

                    // 🟢 FIX: Add the new protected route
<Route path="/requests" element={<ProtectedRoute><RequestHistoryPage /></ProtectedRoute>} />
  <Route path="/admin/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />

  <Route path="/report-issue" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />

  <Route path="/admin/issues" element={<ProtectedRoute><AdminIssuePage /></ProtectedRoute>} />

  <Route path="/admin/issues/details/:issueId" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />
                </Routes>

            </div>
    </div>
        </BrowserRouter>
    );
};

export default App;