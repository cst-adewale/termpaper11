import { useState, useEffect, useRef } from 'react'
import { getNextQuestion, updateInference } from './logic/doctorLogic'
import Dashboard from './Dashboard'
import Auth from './components/Auth'
import { supabase } from './supabase'
import Settings from './components/Settings'
import Help from './components/Help'
import Documents from './components/Documents'
import newConvIcon from './assets/new_conversation_icon.png'
import { createSession, saveMessage, loadHistory, loadMessages, updateSessionSummary } from './logic/historyManager'
import { parseDocument, scanForSymptoms } from './logic/documentParser'
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
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const fileInputRef = useRef(null)

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

  // Load history when session is available
  useEffect(() => {
    if (session?.user?.id) {
      loadHistory(session.user.id).then(hist => setHistory(hist || []))
      // Create initial session if none
      if (!currentSessionId) {
        createSession(session.user.id).then(id => setCurrentSessionId(id))
      }
    }
  }, [session])

  useEffect(() => scrollToBottom(), [messages])

  const handleActionClick = (text) => {
    setInputPrompt(text)
    setIsMenuOpen(false)
  }

  const startNewConversation = async () => {
    if (session?.user?.id) {
      const newId = await createSession(session.user.id)
      setCurrentSessionId(newId)
    }
    setMessages([{ role: 'bot', text: "Hello, I am Eleven. I'm here to help analyze your symptoms. What are you feeling today?" }])
    setEvidence({})
    setDiagnosis({ cancer: 0, pneumonia: 0 })
    setIsFinishing(false)
    setInputPrompt('')
  }

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const britishVoice = voices.find(v => v.lang === 'en-GB') || voices[0]
    if (britishVoice) utterance.voice = britishVoice
    window.speechSynthesis.speak(utterance)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await parseDocument(file)
      const findings = scanForSymptoms(text)

      const findingsText = Object.keys(findings).length > 0
        ? `I've analyzed ${file.name}. Found indications of: ${Object.keys(findings).join(', ')}.`
        : `I've read ${file.name} but didn't find specific risk factors. Tell me more.`

      const botMsg = { role: 'bot', text: findingsText }
      setMessages(prev => [...prev, botMsg])
      if (currentSessionId) saveMessage(currentSessionId, 'bot', findingsText)
      speak(findingsText)

      if (Object.keys(findings).length > 0) {
        setEvidence(prev => ({ ...prev, ...findings }))
        updateInference({ ...evidence, ...findings }).then(res => setDiagnosis(res))
      }
    } catch (err) {
      alert("Error parsing document: " + err.message)
    }
  }

  const loadSession = async (sessId) => {
    const msgs = await loadMessages(sessId)
    if (msgs && msgs.length > 0) {
      setMessages(msgs.map(m => ({ role: m.role, text: m.text, node: m.node })))
      setCurrentSessionId(sessId)
      setView('chat')
    }
  }

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.start()
    setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInputPrompt(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  const handleSendMessage = () => {
    if (!inputPrompt.trim()) return
    const text = inputPrompt.trim()
    setInputPrompt('')

    // Check if waiting for answer
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role === 'bot' && lastMsg.node && !isFinishing) {
      // Simple NLP for Yes/No
      const normalized = text.toLowerCase()
      if (normalized.includes('yes') || normalized.includes('sure') || normalized.includes('yeah') || normalized.includes('abnormal')) {
        handleResponse(lastMsg.node, lastMsg.node === 'xray' ? 'abnormal' : 'yes')
        return
      }
      if (normalized.includes('no') || normalized.includes('nope') || normalized.includes('normal')) {
        handleResponse(lastMsg.node, lastMsg.node === 'xray' ? 'normal' : 'no')
        return
      }
    }

    // Add user message to UI
    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    if (currentSessionId) {
      saveMessage(currentSessionId, 'user', text)
      // Update summary if it's the first real user message (2nd total)
      if (messages.length === 1) updateSessionSummary(currentSessionId, text)
    }

    // Trigger start if requested or if it's the first interaction
    const normalized = text.toLowerCase()
    if (messages.length === 1 || normalized.includes('start') || normalized.includes('symptom') || normalized.includes('check')) {
      setTimeout(() => {
        // If starting fresh
        const initialMsg = "Have you started experiencing any symptoms recently? Let's check. Do you have a history of smoking?"
        setMessages(prev => [...prev, { role: 'bot', text: initialMsg, node: 'smoking' }])
        speak(initialMsg)
        // Start tracking evidence if not already
        if (Object.keys(evidence).length === 0) setEvidence({})
      }, 500)
    } else {
      // Fallback response for unknown input
      setTimeout(() => {
        const fallback = "I'm listening. You can say 'Start' to begin a diagnosis, or answer 'Yes' / 'No' to my questions."
        setMessages(prev => [...prev, { role: 'bot', text: fallback }])
        speak(fallback)
      }, 500)
    }
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
        const text = getQuestionText(nextNode)
        setMessages(prev => [...prev, { role: 'bot', text, node: nextNode }])
        speak(text)
      }, 700)
    } else {
      setIsFinishing(true)
      setTimeout(() => {
        const text = "I've analyzed all signals. View the results in the assessment panel."
        setMessages(prev => [...prev, { role: 'bot', text }])
        speak(text)
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
    return <Auth onGuestLogin={(guestSession) => setSession(guestSession)} />
  }

  if (view === 'dashboard') return <Dashboard symptoms={evidence} diagnosis={[]} onBack={() => setView('chat')} />
  if (view === 'settings') return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`left-sidebar ${isMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>{renderSidebar()}</aside>
      <main className="main-content" style={{ overflowY: 'auto' }}><Settings /></main>
    </div>
  )
  if (view === 'help') return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`left-sidebar ${isMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>{renderSidebar()}</aside>
      <main className="main-content" style={{ overflowY: 'auto' }}><Help /></main>
    </div>
  )
  if (view === 'documents') return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`left-sidebar ${isMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>{renderSidebar()}</aside>
      <main className="main-content" style={{ overflowY: 'auto' }}><Documents /></main>
    </div>
  )

  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || `User ${session.user.id.slice(0, 5)}`
  const userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}&name=${encodeURIComponent(userName)}`

  function renderSidebar() {
    return (
      <>
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
          <a onClick={() => setView('chat')} className={`nav-link ${view === 'chat' ? 'active' : ''}`}>
            <img src={newConvIcon} alt="New" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
            {!isSidebarCollapsed && 'New Conversation'}
          </a>
          <a onClick={() => setView('documents')} className={`nav-link ${view === 'documents' ? 'active' : ''}`}><span>📂</span> {!isSidebarCollapsed && 'Documents'}</a>
          <a onClick={() => setView('history')} className={`nav-link ${view === 'history' ? 'active' : ''}`}><span>🕒</span> {!isSidebarCollapsed && 'History'}</a>

          {!isSidebarCollapsed && history.length > 0 && (
            <div className="history-list" style={{ marginTop: '0.5rem', paddingLeft: '2rem' }}>
              {history.map(item => (
                <div key={item.id} onClick={() => loadSession(item.id)} className="history-item" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.summary || 'Consultation ' + new Date(item.created_at).toLocaleDateString()}
                </div>
              ))}
            </div>
          )}

          {!isSidebarCollapsed && <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Settings & Help</div>}
          <a onClick={() => setView('settings')} className={`nav-link ${view === 'settings' ? 'active' : ''}`}><span>⚙️</span> {!isSidebarCollapsed && 'Settings'}</a>
          <a onClick={() => setView('help')} className={`nav-link ${view === 'help' ? 'active' : ''}`}><span>❓</span> {!isSidebarCollapsed && 'Help'}</a>
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
      </>
    )
  }

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
        {renderSidebar()}
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
              <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Start a consultation to analyze your symptoms using advanced Bayesian probability. Not sure where to begin?</p>

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
                  onClick={handleSendMessage}
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