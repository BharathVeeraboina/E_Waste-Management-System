// src/pages/Submission.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { submitRequest } from '../api/authService'; 
import { useNavigate } from 'react-router-dom';

const Submission = () => {
    const [formData, setFormData] = useState({
        deviceType: '', // User-entered text
        quantity: 1, 
        brand: '', 
        model: '', 
        deviceCondition: 'Working', 
        pickupAddress: '', // Stores the final, selected address string
        remarks: ''
    });
    
    // State for file objects and previews
    const [imageFiles, setImageFiles] = useState({}); 
    const [imagePreviews, setImagePreviews] = useState({}); 
    
    // States for full-screen modal preview
    const [showFullImage, setShowFullImage] = useState(false);
    const [fullImageUrl, setFullImageUrl] = useState(''); 
    
    // 🟢 NEW STATES FOR NOMINATIM AUTOCOMPLETE
    const [addressQuery, setAddressQuery] = useState(''); // Text currently being typed
    const [suggestions, setSuggestions] = useState([]); // Array of suggested addresses
    const [showSuggestions, setShowSuggestions] = useState(false); // Controls dropdown visibility

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const CONDITIONS = ['Working', 'Damaged', 'Dead'];
    const FILE_INPUTS = [
        { name: 'image_top', label: 'Top View' },
        { name: 'image_front', label: 'Front View' },
        { name: 'image_right', label: 'Right Side View' },
        { name: 'image_back', label: 'Back View' },
        { name: 'image_other', label: 'Other (Optional)' },
    ];

    // --- Geocoding Logic (Debounced Search using Nominatim - FREE) ---
    useEffect(() => {
        if (!addressQuery || addressQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search`,
                    {
                        params: {
                            q: addressQuery,
                            format: 'json',
                            limit: 6,
                            // Optional: countrycodes: 'in' // Bias results if needed
                        }
                    }
                );
                const predictions = response.data.map(feature => feature.display_name);
                setSuggestions(predictions);
                setShowSuggestions(true);
            } catch (error) {
                // Fails silently if API is unreachable
                setSuggestions([]);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 350); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [addressQuery]);


    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        
        if (type === 'file') {
            const file = files[0];
            if (file) {
                const url = URL.createObjectURL(file); 
                setImageFiles(prev => ({ ...prev, [name]: file }));
                setImagePreviews(prev => ({ ...prev, [name]: url }));
            } else {
                setImageFiles(prev => ({ ...prev, [name]: null }));
                setImagePreviews(prev => ({ ...prev, [name]: null }));
            }
        } else if (name === 'pickupAddress') {
            setAddressQuery(value); // Update the query state for the geocoder
            setFormData(prev => ({ ...prev, pickupAddress: value })); // Update form data
        } else {
            const finalValue = name === 'quantity' ? parseInt(value) : value;
            setFormData({ ...formData, [name]: finalValue });
        }
    };

    // Function to handle click on a suggestion
    const handleSuggestionClick = (address) => {
        setFormData(prev => ({ ...prev, pickupAddress: address })); // Finalize the address
        setAddressQuery(address); // Set input text
        setShowSuggestions(false);
    };

    // Function to open the full-screen modal
    const openModal = (url) => {
        setFullImageUrl(url);
        setShowFullImage(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.pickupAddress || formData.pickupAddress.length < 5) {
            setMessage('❌ Please enter a valid Pickup Address.');
            return;
        }

        setMessage('Submitting request...');

        const formPayload = new FormData();
        
        // 1. Append JSON data object
        const jsonBlob = new Blob([JSON.stringify(formData)], { type: 'application/json' });
        formPayload.append('data', jsonBlob);

        // 2. Append all 5 file objects
        Object.entries(imageFiles).forEach(([key, file]) => {
            if (file) {
                formPayload.append(key, file); 
            }
        });

        try {
            await submitRequest(formPayload); 
            
            setMessage(`✅ Request Submitted! Status: PENDING.`);
            setTimeout(() => {
                navigate('/profile'); 
            }, 1500); 

            Object.values(imagePreviews).forEach(url => URL.revokeObjectURL(url));

        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Network Error';
            setMessage(`❌ Submission Failed: ${msg}. Status: ${error.response?.status || 'N/A'}`);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="fw-bold text-center" style={{ color: '#388e3c' }}>Submit E-Waste Request</h2>
            <p className="text-center text-muted mb-4">Provide details and visual evidence for a smooth pickup schedule.</p>
            
            <form onSubmit={handleSubmit} className="p-5 shadow-lg" style={{ background: 'white', borderRadius: '15px' }} encType="multipart/form-data">
                
                <h4 className="border-bottom pb-2 mb-4" style={{ color: '#0277bd' }}>Device Information</h4>
                
                {/* Device Type & Condition */}
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Device Type (e.g., Laptop, Phone):</label>
                        <input type="text" name="deviceType" placeholder="Enter device type" value={formData.deviceType} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Condition:</label>
                        <select name="deviceCondition" value={formData.deviceCondition} onChange={handleChange} className="form-control" required>
                            {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                        </select>
                    </div>
                </div>
                
                {/* Brand, Model, Quantity */}
                <div className="row g-3 mb-4">
                    <div className="col-md-5">
                        <input type="text" name="brand" placeholder="Brand" onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-5">
                        <input type="text" name="model" placeholder="Model" onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-2">
                        <input type="number" name="quantity" placeholder="Qty" value={formData.quantity} onChange={handleChange} className="form-control" required min="1" />
                    </div>
                </div>

                <h4 className="border-bottom pb-2 mb-4 mt-5" style={{ color: '#0277bd' }}>Media & Pickup Details</h4>
                
                {/* 🟢 CRITICAL FIX: ADDRESS FIELD - NOMINATIM AUTOCOMPLETE */}
                <div className="mb-4 position-relative">
                    <label className="form-label fw-semibold">Pickup Address (Type for Suggestions):</label>
                    <input 
                        type="text" 
                        name="pickupAddress" 
                        placeholder="Enter pickup address" 
                        value={addressQuery} // Binds to the query state
                        onChange={handleChange} 
                        onFocus={() => setShowSuggestions(true)}
                        // Use a slight delay to allow click on suggestions before hiding the dropdown
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="form-control" 
                        required 
                    />
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute', zIndex: 10, width: '100%', maxHeight: '200px', 
                            overflowY: 'auto', background: 'white', border: '1px solid #ced4da', 
                            borderRadius: '0 0 5px 5px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                        }}>
                            {suggestions.map((address, index) => (
                                <div 
                                    key={index} 
                                    // Use onMouseDown to capture click before onBlur hides the box
                                    onMouseDown={() => handleSuggestionClick(address)} 
                                    style={{ 
                                        padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', 
                                        backgroundColor: '#fff', fontSize: '14px'
                                    }}
                                >
                                    {address}
                                </div>
                            ))}
                        </div>
                    )}
                    {formData.pickupAddress && <p className="small text-success mt-2">Selected: {formData.pickupAddress}</p>}
                </div>


                {/* 🟢 FILE INPUTS SECTION WITH PREVIEWS */}
                <div className="mb-4 p-4 border rounded" style={{ background: '#f8f8f8' }}>
                    <h5 className="mb-3" style={{ color: '#388e3c' }}>Upload Device Views (5 Required Angles)</h5>
                    <div className="row g-3">
                        {FILE_INPUTS.map(input => (
                            <div key={input.name} className="col-lg-3 col-md-6">
                                <label className="form-label small">{input.label}:</label>
                                <input type="file" name={input.name} onChange={handleChange} className="form-control form-control-sm" accept="image/*" />
                                
                                {/* Image Preview Thumbnail */}
                                {imagePreviews[input.name] && (
                                    <img 
                                        src={imagePreviews[input.name]} 
                                        alt={input.label} 
                                        className="img-thumbnail mt-2"
                                        style={{ width: '100%', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                        onClick={() => openModal(imagePreviews[input.name])} // Open modal on click
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Address & Remarks */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">Additional Remarks:</label>
                    <textarea name="remarks" placeholder="Optional notes for the pickup team" onChange={handleChange} className="form-control" rows="3"></textarea>
                </div>

                <button type="submit" className="btn btn-success w-100 mt-4 py-2">Submit E-Waste Request</button>
            </form>
            
            {message && <p className={`mt-3 text-center ${message.startsWith('✅') ? 'text-success' : 'text-danger'}`}>{message}</p>}
            
            <div className="mt-4 text-center">
                <button onClick={() => navigate('/profile')} className="btn btn-secondary">
                    ← Back to Profile Hub
                </button>
            </div>

            {/* Full Screen Image Modal Definition */}
            {showFullImage && (
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                        backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 10000, 
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                    onClick={() => setShowFullImage(false)}
                >
                    <img 
                        src={fullImageUrl} 
                        alt="Full Screen Preview" 
                        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                        onClick={(e) => e.stopPropagation()} 
                    />
                    <button 
                        onClick={() => setShowFullImage(false)} 
                        style={{ 
                            position: 'absolute', top: '20px', right: '30px', 
                            background: 'none', border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer' 
                        }}
                    >
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
};

export default Submission;