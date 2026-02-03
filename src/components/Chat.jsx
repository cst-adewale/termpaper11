import React from 'react';

const Chat = ({
    messages,
    inputPrompt,
    setInputPrompt,
    handleSendMessage,
    handleVoiceInput,
    isListening,
    fileInputRef,
    handleFileUpload,
    chatEndRef,
    isFinishing,
    handleResponse
}) => {
    return (
        <div className="chat-container">
            <div className="messages-wrapper" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`} style={{
                        alignSelf: msg.role === 'bot' ? 'flex-start' : 'flex-end',
                        background: msg.role === 'bot' ? '#f2f4f7' : 'var(--accent)',
                        color: msg.role === 'bot' ? '#000' : '#fff',
                        padding: '1rem 1.25rem',
                        borderRadius: '16px',
                        maxWidth: '70%'
                    }}>
                        {msg.text}
                    </div>
                ))}

                {!isFinishing && messages.length > 0 && messages[messages.length - 1].role === 'bot' && messages[messages.length - 1].node && (
                    <div className="options-row" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            onClick={() => handleResponse(messages[messages.length - 1].node, messages[messages.length - 1].node === 'xray' ? 'abnormal' : 'yes')}
                            style={{ padding: '0.6rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', background: '#fff' }}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => handleResponse(messages[messages.length - 1].node, messages[messages.length - 1].node === 'xray' ? 'normal' : 'no')}
                            style={{ padding: '0.6rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', background: '#fff' }}
                        >
                            No
                        </button>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="input-section">
                <div className="input-box">
                    <textarea
                        placeholder="Summarize the latest"
                        rows={1}
                        value={inputPrompt}
                        onChange={(e) => setInputPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    />
                    <div className="input-actions" style={{ marginBottom: '0.5rem' }}>
                        <div className="action-buttons" style={{ color: '#000', fontWeight: 500 }}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                accept=".pdf,.docx,.doc"
                            />
                            <span className="action-btn" onClick={() => fileInputRef.current.click()}>📎 Attach</span>
                            <span className="action-btn" onClick={handleVoiceInput}>{isListening ? '🔴 Listening...' : '🎙️ Voice Message'}</span>
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
                                onClick={() => handleSendMessage()}
                            >
                                ↑
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
