import { useState, useEffect, useRef } from 'react'
import { getNextQuestion, updateInference } from './logic/doctorLogic'
import Dashboard from './Dashboard'
import Auth from './components/Auth'
import { supabase } from './supabase'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('chat')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello, I am Eleven. I'm here to help analyze your symptoms. What are you feeling today?" }
  ])
  const [history, setHistory] = useState([])
  const [evidence, setEvidence] = useState({})
  const [diagnosis, setDiagnosis] = useState({ cancer: 0, pneumonia: 0 })
  const [isFinishing, setIsFinishing] = useState(false)
  const [inputPrompt, setInputPrompt] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const chatEndRef = useRef(null)
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => scrollToBottom(), [messages])

  const handleActionClick = (text) => {
    setInputPrompt(text)
    setIsMenuOpen(false)
  }

  const startNewConversation = () => {
    if (messages.length > 1) {
      setHistory(prev => [{ id: Date.now(), messages: [...messages], date: new Date().toLocaleDateString() }, ...prev])
    }
    setMessages([{ role: 'bot', text: "Hello, I am Eleven. I'm here to help analyze your symptoms. What are you feeling today?" }])
    setEvidence({})
    setDiagnosis({ cancer: 0, pneumonia: 0 })
    setIsFinishing(false)
    setInputPrompt('')
  }

  const handleResponse = async (nodeName, value) => {
    const newEvidence = { ...evidence, [nodeName]: value }
    setEvidence(newEvidence)
    setMessages(prev => [...prev, { role: 'user', text: value === 'yes' || value === 'abnormal' ? 'Yes' : 'No' }])
    const results = await updateInference(newEvidence)
    setDiagnosis(results)
    const nextNode = getNextQuestion(newEvidence)
    if (nextNode) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: getQuestionText(nextNode), node: nextNode }])
      }, 700)
    } else {
      setIsFinishing(true)
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: "I've analyzed all signals. View the results in the assessment panel." }])
      }, 700)
    }
  }

  const getQuestionText = node => {
    const questions = {
      smoking: 'Do you have a history of smoking?',
      cough: 'Are you experiencing a persistent cough?',
      fever: 'Do you have a fever?',
      xray: 'Has a recent X-ray shown any abnormalities?'
    }
    return questions[node] || 'Tell me more...'
  }

  if (!session) {
    return <Auth />
  }

  if (view === 'dashboard') {
    return <Dashboard symptoms={evidence} diagnosis={[]} onBack={() => setView('chat')} />;
  }

  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || `User ${session.user.id.slice(0, 5)}`
  const userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}&name=${encodeURIComponent(userName)}`

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? '✕' : '☰'}
      </button>

      {/* ── LEFT SIDEBAR ── */}
      <aside className={`left-sidebar ${isMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="logo-section">
          <div className="logo-pause-small">
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          {!isSidebarCollapsed && <h1 style={{ fontSize: '1.25rem' }}>Eleven</h1>}
          <div
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            {isSidebarCollapsed ? '📂' : '⇤'}
          </div>
        </div>

        {!isSidebarCollapsed && (
          <div className="search-bar">
            <span style={{ marginRight: '8px' }}>🔍</span>
            <input type="text" placeholder="Search" style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⌘K</span>
          </div>
        )}

        <nav className="sidebar-nav">
          <a href="#" className="nav-link active"><span>💬</span> {!isSidebarCollapsed && 'AI Chat'}</a>
          <a href="#" className="nav-link"><span>📄</span> {!isSidebarCollapsed && 'Documents'}</a>
          <a href="#" className="nav-link"><span>🕒</span> {!isSidebarCollapsed && 'History'}</a>

          {!isSidebarCollapsed && history.length > 0 && (
            <div className="history-list" style={{ marginTop: '0.5rem', paddingLeft: '2rem' }}>
              {history.map(item => (
                <div key={item.id} className="history-item" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', cursor: 'pointer' }}>
                  Consultation {item.date}
                </div>
              ))}
            </div>
          )}

          {!isSidebarCollapsed && <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Settings & Help</div>}
          <a href="#" className="nav-link"><span>⚙️</span> {!isSidebarCollapsed && 'Settings'}</a>
          <a href="#" className="nav-link"><span>❓</span> {!isSidebarCollapsed && 'Help'}</a>
        </nav>

        {!isSidebarCollapsed && (
          <div className="theme-toggle" style={{ marginTop: 'auto', marginBottom: '1.5rem' }}>
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
        <div className="chat-container">
          {messages.length === 1 ? (
            <div className="hero-section">
              <div className="logo-pause-large">
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
              <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Welcome to Eleven</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Get started by Script a task and Chat can do the rest. Not sure where to start?</p>

              <div className="quick-actions">
                <div className="action-card" onClick={() => handleActionClick('Analyze my current respiratory symptoms')}>
                  <div className="action-info">
                    <div className="action-icon" style={{ background: '#fff4e6' }}>📝</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Symptom Check</div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>+</span>
                </div>
                <div className="action-card" onClick={() => handleActionClick('Show me the latest diagnostic data findings')}>
                  <div className="action-info">
                    <div className="action-icon" style={{ background: '#e7f5ff' }}>🖼️</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Diagnostic Data</div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>+</span>
                </div>
                <div className="action-card" onClick={() => handleActionClick('Provide detailed analysis info for probabilities')}>
                  <div className="action-info">
                    <div className="action-icon" style={{ background: '#ebfbee' }}>👤</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Analysis Info</div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>+</span>
                </div>
                <div className="action-card" onClick={() => handleActionClick('Build and show the full medical dashboard')}>
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
          ) : (
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

              {!isFinishing && messages[messages.length - 1].role === 'bot' && (
                <div className="options-row" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={() => handleResponse(messages[messages.length - 1].node, messages[messages.length - 1].node === 'xray' ? 'abnormal' : 'yes')} style={{ padding: '0.6rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', background: '#fff' }}>Yes</button>
                  <button onClick={() => handleResponse(messages[messages.length - 1].node, messages[messages.length - 1].node === 'xray' ? 'normal' : 'no')} style={{ padding: '0.6rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', background: '#fff' }}>No</button>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="input-section">
          <div className="input-box">
            <textarea
              placeholder="Summarize the latest"
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
            />
            <div className="input-actions" style={{ marginBottom: '0.5rem' }}>
              <div className="action-buttons" style={{ color: '#000', fontWeight: 500 }}>
                <span className="action-btn" onClick={() => startNewConversation()}>⚡ New Conversation</span>
                <span className="action-btn">📎 Attach</span>
                <span className="action-btn">🎙️ Voice Message</span>
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
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="right-sidebar">
        <div className="section-header">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Medical Assessment</h3>
          <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>...</span>
        </div>

        <div className="project-list">
          <div className="project-item">
            <h4>Lung Cancer Risk</h4>
            <div style={{ height: '8px', background: '#eaecf0', borderRadius: '4px', overflow: 'hidden', margin: '8px 0' }}>
              <div style={{ width: `${diagnosis.cancer}%`, height: '100%', background: diagnosis.cancer > 20 ? '#dc3545' : 'var(--accent)', transition: '0.5s' }}></div>
            </div>
            <p>{Math.round(diagnosis.cancer)}% probability calculated.</p>
          </div>

          <div className="project-item">
            <h4>Pneumonia Risk</h4>
            <div style={{ height: '8px', background: '#eaecf0', borderRadius: '4px', overflow: 'hidden', margin: '8px 0' }}>
              <div style={{ width: `${diagnosis.pneumonia}%`, height: '100%', background: diagnosis.pneumonia > 20 ? '#dc3545' : '#32CD32', transition: '0.5s' }}></div>
            </div>
            <p>{Math.round(diagnosis.pneumonia)}% probability calculated.</p>
          </div>
        </div>

        <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Logged in as {session.user.email}
        </div>
      </aside>
    </div>
  )
}

export default App