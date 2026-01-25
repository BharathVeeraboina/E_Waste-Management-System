import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProcessPage = () => {
    const navigate = useNavigate();

    // Define the three steps of the E-Waste journey
    const steps = [
        {
            icon: '🔍', // Search or submit icon
            title: '1. Identify & Submit',
            description: 'Log in and use the submission form to detail your device type, condition, and quantity. Upload images for quick verification.'
        },
        {
            icon: '🗓️', // Calendar/Schedule icon
            title: '2. Schedule Pickup',
            description: 'Our admin team reviews your request, verifies the details, and schedules a convenient date and time for collection.'
        },
        {
            icon: '♻️', // Recycle icon
            title: '3. Certified Disposal',
            description: 'Our certified logistics team collects the e-waste, ensuring secure data destruction and environmentally responsible recycling/upcycling.'
        }
    ];

    return (
        <div className="process-page py-5" style={{ 
            minHeight: '100vh', 
            backgroundColor: '#ffffff', // White background
            color: '#333', // Dark text
        }}>
            <div className="container text-center">
                
                <h1 className="display-4 fw-bold mb-3" style={{ color: '#0277bd' }}>
                    Our 3-Step E-Waste Collection Process
                </h1>
                <p className="lead mb-5 text-muted">
                    Safe, simple, and certified disposal—from your door to ours.
                </p>

                {/* Process Steps Grid */}
                <div className="row g-4 justify-content-center">
                    {steps.map((step, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div className="card h-100 shadow-sm p-4" style={{ backgroundColor: '#e8f5e9', border: '1px solid #388e3c' }}>
                                <div className="display-4 mb-3">{step.icon}</div>
                                <h4 className="fw-bold mb-3" style={{ color: '#388e3c' }}>{step.title}</h4>
                                <p>{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Back to Home CTA */}
                <div className="mt-5">
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn btn-primary btn-lg fw-bold" 
                        style={{ backgroundColor: '#0277bd', borderColor: '#0277bd' }}
                    >
                        Back to Home
                    </button>
                    <p className="mt-3 text-muted">
                        Ready to start? Click 'Get Started' on the main page.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ProcessPage;