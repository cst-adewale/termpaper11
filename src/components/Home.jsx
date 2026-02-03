import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Home = () => {
    const navigate = useNavigate();
    const { handleSendMessage } = useApp();

    const handleAction = (text) => {
        navigate('/chat');
        // small timeout to ensure navigation happens before processing
        setTimeout(() => {
            handleSendMessage(text);
        }, 100);
    };

    return (
        <div className="hero-section" style={{ width: '100%', maxWidth: '800px' }}>
            <div className="logo-pause-large">
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Welcome to Eleven</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Start a consultation to analyze your symptoms using advanced Bayesian probability. Not sure where to begin?
            </p>

            <div className="quick-actions">
                <div className="action-card" onClick={() => handleAction('Analyze my current respiratory symptoms')}>
                    <div className="action-info">
                        <div className="action-icon" style={{ background: '#fff4e6' }}>📝</div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Symptom Check</div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>+</span>
                </div>
                <div className="action-card" onClick={() => handleAction('Show me the latest diagnostic data findings')}>
                    <div className="action-info">
                        <div className="action-icon" style={{ background: '#e7f5ff' }}>🖼️</div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Diagnostic Data</div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>+</span>
                </div>
                <div className="action-card" onClick={() => handleAction('Provide detailed analysis info for probabilities')}>
                    <div className="action-info">
                        <div className="action-icon" style={{ background: '#ebfbee' }}>👤</div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Analysis Info</div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>+</span>
                </div>
                <div className="action-card" onClick={() => handleAction('Build and show the full medical dashboard')}>
                    <div className="action-info">
                        <div className="action-icon" style={{ background: '#fff0f6' }}>📟</div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>View Dashboard</div>
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>+</span>
                </div>
            </div>
        </div>
    );
};

export default Home;
