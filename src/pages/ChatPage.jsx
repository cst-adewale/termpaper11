import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { updateInference } from '../logic/doctorLogic';

const ChatPage = () => {
    const {
        messages, setMessages,
        setEvidence, setDiagnosis,
        chatEndRef,
        isFinishing, handleResponse
    } = useApp();

    const location = useLocation();

    useEffect(() => {
        if (location.state?.loadedMessages) {
            setMessages(location.state.loadedMessages.map(m => ({ role: m.role, text: m.text, node: m.node })));
            const ev = {};
            location.state.loadedMessages.forEach(m => {
                if (m.node && (m.text.toLowerCase() === 'yes' || m.text.toLowerCase() === 'abnormal')) ev[m.node] = 'yes';
                if (m.node && (m.text.toLowerCase() === 'no' || m.text.toLowerCase() === 'normal')) ev[m.node] = 'no';
            });
            setEvidence(ev);
            updateInference(ev).then(res => setDiagnosis(res));
        }
    }, [location.state]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="messages-wrapper" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
            {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`} style={{
                    alignSelf: msg.role === 'bot' ? 'flex-start' : 'flex-end',
                    background: msg.role === 'bot' ? '#f2f4f7' : 'var(--accent)',
                    color: msg.role === 'bot' ? '#000' : '#fff',
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    maxWidth: '70%',
                    boxShadow: 'var(--card-shadow)'
                }}>
                    {msg.text}
                </div>
            ))}

            {!isFinishing && messages.length > 0 && messages[messages.length - 1].role === 'bot' && messages[messages.length - 1].node && (
                <div className="options-row" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={() => handleResponse(messages[messages.length - 1].node, messages[messages.length - 1].node === 'xray' ? 'abnormal' : 'yes')}
                        style={{ padding: '0.6rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', background: '#fff', fontWeight: 500 }}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => handleResponse(messages[messages.length - 1].node, messages[messages.length - 1].node === 'xray' ? 'normal' : 'no')}
                        style={{ padding: '0.6rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', background: '#fff', fontWeight: 500 }}
                    >
                        No
                    </button>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>
    );
};

export default ChatPage;
