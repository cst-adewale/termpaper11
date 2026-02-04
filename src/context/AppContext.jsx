import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { loadHistory, createSession, saveMessage, updateSessionSummary } from '../logic/historyManager';
import { initializeDoctorBrain, updateInference, getNextQuestion } from '../logic/doctorLogic';
import { parseDocument, scanForSymptoms } from '../logic/documentParser';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [diagnosis, setDiagnosis] = useState({
        cancer: 0, pneumonia: 0, covid: 0, tb: 0, bronchitis: 0, flu: 0,
        asthma: 0, heart_failure: 0, anemia: 0, emphysema: 0
    });

    const [brainReady, setBrainReady] = useState(false);
    const [evidence, setEvidence] = useState({});

    // Chat State
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hello, I am Eleven. I'm here to help analyze your symptoms. What are you feeling today?" }
    ]);
    const [inputPrompt, setInputPrompt] = useState('');
    const [isFinishing, setIsFinishing] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Initialize Brain
        initializeDoctorBrain().then(() => setBrainReady(true));

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (session?.user?.id) {
            loadHistory(session.user.id).then(hist => setHistory(hist || []));
        }
    }, [session]);

    const refreshHistory = async () => {
        if (session?.user?.id) {
            const hist = await loadHistory(session.user.id);
            setHistory(hist || []);
        }
    };

    const speak = (text) => {
        if (!voiceEnabled || !window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const britishVoice = voices.find(v => v.lang === 'en-GB') || voices[0];
        if (britishVoice) utterance.voice = britishVoice;
        window.speechSynthesis.speak(utterance);
    };

    const handleSendMessage = async (overrideText = null) => {
        const text = (typeof overrideText === 'string' ? overrideText : inputPrompt).trim();
        if (!text) return;
        setInputPrompt('');

        // Add user message to UI
        const userMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);

        // Lazy create session
        let sessionId = currentSessionId;
        if (!sessionId && session?.user?.id) {
            sessionId = await createSession(session.user.id);
            setCurrentSessionId(sessionId);
            refreshHistory();
        }
        if (sessionId) {
            await saveMessage(sessionId, 'user', text);
            if (messages.length === 1) updateSessionSummary(sessionId, text);
        }

        // Check if waiting for answer
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'bot' && lastMsg.node && !isFinishing) {
            const normalized = text.toLowerCase();
            if (normalized.includes('yes') || normalized.includes('sure') || normalized.includes('yeah') || normalized.includes('abnormal')) {
                handleResponse(lastMsg.node, lastMsg.node === 'xray' ? 'abnormal' : 'yes');
                return;
            }
            if (normalized.includes('no') || normalized.includes('nope') || normalized.includes('normal')) {
                handleResponse(lastMsg.node, lastMsg.node === 'xray' ? 'normal' : 'no');
                return;
            }
        }

        // Trigger start if requested or if it's the first interaction
        const normalized = text.toLowerCase();
        if (messages.length === 1 || normalized.includes('start') || normalized.includes('symptom') || normalized.includes('check')) {
            setTimeout(() => {
                const initialMsg = "Have you started experiencing any symptoms recently? Let's check. Do you have a history of smoking?";
                setMessages(prev => [...prev, { role: 'bot', text: initialMsg, node: 'smoking' }]);
                if (sessionId) saveMessage(sessionId, 'bot', initialMsg, 'smoking');
                speak(initialMsg);
                if (Object.keys(evidence).length === 0) setEvidence({});
            }, 500);
        }
    };

    const handleResponse = async (nodeName, value) => {
        const newEvidence = { ...evidence, [nodeName]: value };
        setEvidence(newEvidence);
        setMessages(prev => [...prev, { role: 'user', text: value === 'yes' || value === 'abnormal' ? 'Yes' : 'No' }]);

        if (currentSessionId) {
            saveMessage(currentSessionId, 'user', value === 'yes' || value === 'abnormal' ? 'Yes' : 'No');
        }

        const results = await updateInference(newEvidence);
        setDiagnosis(results);
        const nextNode = getNextQuestion(newEvidence);
        if (nextNode) {
            setTimeout(() => {
                const text = getQuestionText(nextNode);
                setMessages(prev => [...prev, { role: 'bot', text, node: nextNode }]);
                if (currentSessionId) saveMessage(currentSessionId, 'bot', text, nextNode);
                speak(text);
            }, 700);
        } else {
            setIsFinishing(true);
            setTimeout(() => {
                const text = "I've analyzed all signals. View the results in the assessment panel.";
                setMessages(prev => [...prev, { role: 'bot', text }]);
                if (currentSessionId) saveMessage(currentSessionId, 'bot', text);
                speak(text);
            }, 700);
        }
    };

    const getQuestionText = node => {
        const questions = {
            smoking: 'Do you have a history of smoking?',
            cough: 'Are you experiencing a persistent cough?',
            fever: 'Do you have a fever?',
            xray: 'Has a recent X-ray shown any abnormalities?'
        };
        return questions[node] || 'Tell me more...';
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await parseDocument(file);
            const findings = scanForSymptoms(text);

            const findingsText = Object.keys(findings).length > 0
                ? `I've analyzed ${file.name}. Found indications of: ${Object.keys(findings).join(', ')}.`
                : `I've read ${file.name} but didn't find specific risk factors. Tell me more.`;

            const botMsg = { role: 'bot', text: findingsText };
            setMessages(prev => [...prev, botMsg]);

            let sessionId = currentSessionId;
            if (!sessionId && session?.user?.id) {
                sessionId = await createSession(session.user.id);
                setCurrentSessionId(sessionId);
                refreshHistory();
            }

            if (sessionId) saveMessage(sessionId, 'bot', findingsText);
            speak(findingsText);

            if (Object.keys(findings).length > 0) {
                const newEvidence = { ...evidence, ...findings };
                setEvidence(newEvidence);
                updateInference(newEvidence).then(res => setDiagnosis(res));
            }
        } catch (err) {
            alert("Error parsing document: " + err.message);
        }
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Browser does not support Speech Recognition");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputPrompt(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
    };

    const startNewConversation = () => {
        setCurrentSessionId(null);
        setMessages([{ role: 'bot', text: "Hello, I am Eleven. I'm here to help analyze your symptoms. What are you feeling today?" }]);
        setEvidence({});
        setDiagnosis({ cancer: 0, pneumonia: 0 });
        setIsFinishing(false);
        setInputPrompt('');
    };

    return (
        <AppContext.Provider value={{
            session, setSession,
            history, setHistory, refreshHistory,
            currentSessionId, setCurrentSessionId,
            isSidebarCollapsed, setIsSidebarCollapsed,
            isMenuOpen, setIsMenuOpen,
            voiceEnabled, setVoiceEnabled,
            diagnosis, setDiagnosis,
            evidence, setEvidence,
            messages, setMessages,
            inputPrompt, setInputPrompt,
            isFinishing, setIsFinishing,
            isListening, setIsListening,
            handleSendMessage, handleFileUpload, handleVoiceInput, handleResponse,
            chatEndRef, fileInputRef,
            startNewConversation
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
