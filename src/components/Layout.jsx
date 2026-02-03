import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabase';
import { loadMessages } from '../logic/historyManager';
import newConvIcon from '../assets/new_conversation_icon.png';

const Layout = () => {
    const {
        session,
        history,
        setCurrentSessionId,
        isSidebarCollapsed, setIsSidebarCollapsed,
        isMenuOpen, setIsMenuOpen,
        voiceEnabled, setVoiceEnabled,
        diagnosis,
        startNewConversation,
        inputPrompt, setInputPrompt,
        handleSendMessage, handleVoiceInput, isListening,
        fileInputRef, handleFileUpload
    } = useApp();

    const navigate = useNavigate();
    const location = useLocation();

    const handleNewConversationClick = () => {
        startNewConversation();
        navigate('/');
    };

    const loadSession = async (sessId) => {
        const msgs = await loadMessages(sessId);
        if (msgs && msgs.length > 0) {
            setCurrentSessionId(sessId);
            // In a real app, you'd update context messages here
            navigate('/chat', { state: { loadedMessages: msgs } });
        }
    };

    if (!session) return null;

    const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || `User ${session.user.id.slice(0, 5)}`;
    const userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}&name=${encodeURIComponent(userName)}`;

    return (
        <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? '✕' : '☰'}
            </button>

            {/* ── LEFT SIDEBAR ── */}
            <aside
                className={`left-sidebar ${isMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}
                onClick={(e) => {
                    if (isSidebarCollapsed && !e.target.closest('.logo-section')) {
                        setIsSidebarCollapsed(false)
                    }
                }}
            >
                <div className="logo-section" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{ cursor: 'pointer' }}>
                    <div className="logo-pause-small">
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                    {!isSidebarCollapsed && <h1 style={{ fontSize: '1.25rem' }}>Eleven</h1>}
                </div>

                {!isSidebarCollapsed && (
                    <div className="search-bar">
                        <span style={{ marginRight: '8px' }}>🔍</span>
                        <input type="text" placeholder="Search" style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', borderRadius: '30px' }} />
                    </div>
                )}

                <nav className="sidebar-nav">
                    <a onClick={handleNewConversationClick} className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                        <img src={newConvIcon} alt="New" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        {!isSidebarCollapsed && 'New Conversation'}
                    </a>
                    <Link to="/documents" className={`nav-link ${location.pathname === '/documents' ? 'active' : ''}`}><span>📂</span> {!isSidebarCollapsed && 'Documents'}</Link>
                    <Link to="/click-model" className={`nav-link ${location.pathname === '/click-model' ? 'active' : ''}`}><span>🖱️</span> {!isSidebarCollapsed && 'Click Model'}</Link>
                    <a onClick={() => navigate('/')} className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}><span>🕒</span> {!isSidebarCollapsed && 'History'}</a>

                    {!isSidebarCollapsed && history.length > 0 && (
                        <div className="history-list" style={{ marginTop: '0.5rem', paddingLeft: '2rem' }}>
                            {history.slice(0, 5).map(item => (
                                <div key={item.id} onClick={() => loadSession(item.id)} className="history-item" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.summary || 'Consultation ' + new Date(item.created_at).toLocaleDateString()}
                                </div>
                            ))}
                        </div>
                    )}

                    {!isSidebarCollapsed && <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Settings & Help</div>}
                    <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}><span>⚙️</span> {!isSidebarCollapsed && 'Settings'}</Link>
                    <Link to="/help" className={`nav-link ${location.pathname === '/help' ? 'active' : ''}`}><span>❓</span> {!isSidebarCollapsed && 'Help'}</Link>
                </nav>

                {!isSidebarCollapsed && (
                    <div className="voice-toggle" style={{ marginTop: 'auto', marginBottom: '1rem', padding: '0 1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <span>Voice Response</span>
                            <input type="checkbox" checked={voiceEnabled} onChange={() => setVoiceEnabled(!voiceEnabled)} />
                        </label>
                    </div>
                )}

                {!isSidebarCollapsed && (
                    <div className="theme-toggle" style={{ marginBottom: '1.5rem' }}>
                        <div className="toggle-btn active">☀️ Light</div>
                        <div className="toggle-btn">🌙 Dark</div>
                    </div>
                )}

                <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: isSidebarCollapsed ? 'auto' : '0' }}>
                    <div className="user-profile">
                        <img src={userAvatar} alt="User" className="user-avatar" />
                        {!isSidebarCollapsed && (
                            <div className="user-info">
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{userName}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.user.email}</div>
                            </div>
                        )}
                    </div>
                    {!isSidebarCollapsed && (
                        <button
                            onClick={() => supabase.auth.signOut()}
                            style={{ width: '100%', marginTop: '1rem', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="main-content">
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
                    <Outlet />
                </div>

                {/* SHARED INPUT AREA - Always at bottom */}
                {(location.pathname === '/' || location.pathname === '/chat') && (
                    <>
                        <div className="input-section" style={{ width: '100%' }}>
                            <div className="input-box" style={{ margin: '0 auto' }}>
                                <textarea
                                    placeholder="Summarize the latest"
                                    rows={1}
                                    value={inputPrompt}
                                    onChange={(e) => setInputPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), navigate('/chat'), handleSendMessage())}
                                />
                                <div className="input-actions" style={{ marginBottom: '0.5rem' }}>
                                    <div className="action-buttons" style={{ color: '#000', fontWeight: 500 }}>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={(e) => { navigate('/chat'); handleFileUpload(e); }}
                                            accept=".pdf,.docx,.doc"
                                        />
                                        <span className="action-btn" onClick={() => fileInputRef.current.click()}>📎 Attach</span>
                                        <span className="action-btn" onClick={() => { navigate('/chat'); handleVoiceInput(); }}>{isListening ? '🔴 Listening...' : '🎙️ Voice Message'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                        <span>{inputPrompt.length}/3,000</span>
                                        <button
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                background: inputPrompt.trim() ? 'var(--accent)' : '#eaecf0',
                                                borderRadius: '50%',
                                                border: 'none',
                                                display: 'grid',
                                                placeItems: 'center',
                                                color: '#fff',
                                                cursor: inputPrompt.trim() ? 'pointer' : 'default',
                                                transition: 'all 0.2s'
                                            }}
                                            disabled={!inputPrompt.trim()}
                                            onClick={() => { navigate('/chat'); handleSendMessage(); }}
                                        >
                                            ↑
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Mobile Only Quick Summary */}
                        <div className="mobile-assessment-summary">
                            {[
                                { name: 'Cancer', val: diagnosis.cancer, color: '#dc3545' },
                                { name: 'Pneumonia', val: diagnosis.pneumonia, color: '#32CD32' },
                                { name: 'COVID-19', val: diagnosis.covid, color: '#00BFFF' }
                            ].map(d => (
                                <div key={d.name} style={{ background: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }}></div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.name}: {Math.round(d.val)}%</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* ── RIGHT SIDEBAR ── */}
            <aside className="right-sidebar">
                <div className="section-header">
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Medical Assessment</h3>
                </div>

                <div className="project-list">
                    {[
                        { name: 'Lung Cancer', val: diagnosis.cancer, color: '#dc3545' },
                        { name: 'Pneumonia', val: diagnosis.pneumonia, color: '#32CD32' },
                        { name: 'COVID-19', val: diagnosis.covid, color: '#00BFFF' },
                        { name: 'Tuberculosis', val: diagnosis.tb, color: '#FF8C00' },
                        { name: 'Bronchitis', val: diagnosis.bronchitis, color: '#9370DB' },
                        { name: 'Influenza', val: diagnosis.flu, color: '#40E0D0' },
                        { name: 'Asthma', val: diagnosis.asthma, color: '#FFD700' },
                        { name: 'Heart Failure', val: diagnosis.heart_failure, color: '#FF69B4' },
                        { name: 'Anemia', val: diagnosis.anemia, color: '#A52A2A' },
                        { name: 'Emphysema', val: diagnosis.emphysema, color: '#5F9EA0' }
                    ].map(d => (
                        <div key={d.name} className="project-item" style={{ marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontSize: '0.8rem' }}>{d.name}</h4>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{Math.round(d.val || 0)}%</span>
                            </div>
                            <div style={{ height: '6px', background: '#eaecf0', borderRadius: '3px', overflow: 'hidden', margin: '6px 0' }}>
                                <div style={{ width: `${d.val || 0}%`, height: '100%', background: d.color, transition: '0.5s', borderRadius: '3px' }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Logged in as {session.user.email}
                </div>
            </aside>
        </div>
    );
};

export default Layout;
