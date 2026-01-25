// src/components/ChatbotComponent.jsx

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/localStorage';

const ChatbotComponent = () => {
    const [messages, setMessages] = useState([
        { sender: 'Gemini', text: 'Hello! I am your EcoWaste Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef(null);

    const API_URL = 'http://localhost:8080/api/chat/send';

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        const userMessage = input.trim();
        setInput('');
        
        // 1. Add user message to state
        setMessages(prev => [...prev, { sender: 'User', text: userMessage }]);
        setIsSending(true);

        try {
            // 2. Send message via protected backend endpoint
            const token = getToken();
            const response = await axios.post(API_URL, { message: userMessage }, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass token for backend security checks
                    'Content-Type': 'application/json'
                }
            });

            const botResponse = response.data;
            
            // 3. Add bot response to state
            setMessages(prev => [...prev, { sender: 'Gemini', text: botResponse }]);

        } catch (error) {
            setMessages(prev => [...prev, { sender: 'Error', text: 'Connection failed. Please check your server.' }]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={styles.chatContainer}>
            <div style={styles.messageList}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ 
                        ...styles.message, 
                        alignSelf: msg.sender === 'User' ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.sender === 'User' ? '#34d399' : '#e6fff4',
                        color: msg.sender === 'User' ? 'white' : '#042f2e'
                    }}>
                        {msg.text}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} style={styles.inputArea}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isSending ? "Assistant is typing..." : "Ask your question..."}
                    style={styles.input}
                    disabled={isSending}
                />
                <button type="submit" style={styles.sendButton} disabled={isSending}>
                    {isSending ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default ChatbotComponent;

// Simple inline styles for the chat interface
const styles = {
    chatContainer: { height: '400px', display: 'flex', flexDirection: 'column', border: '1px solid #a7f3d0', borderRadius: '10px', overflow: 'hidden' },
    messageList: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f0fff4' },
    message: { maxWidth: '80%', padding: '10px 15px', borderRadius: '15px', fontSize: '14px', lineHeight: '1.4', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    inputArea: { display: 'flex', borderTop: '1px solid #ccc', padding: '10px', backgroundColor: '#fff' },
    input: { flex: 1, padding: '8px 12px', border: '1px solid #e6eef6', borderRadius: '20px', marginRight: '10px', outline: 'none' },
    sendButton: { padding: '8px 15px', border: 'none', borderRadius: '20px', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 'bold' }
};