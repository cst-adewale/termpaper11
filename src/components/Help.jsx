import React from 'react';

const Help = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <h1 style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                Eleven Medical AI - System Documentation
            </h1>

            <section style={{ marginBottom: '3rem' }}>
                <h2>1. Project Overview</h2>
                <p>
                    <strong>Eleven Medical AI</strong> is a next-generation diagnostic assistant designed to simulate a doctor-patient consultation.
                    It leverages <strong>Bayesian Belief Networks (BBN)</strong> to handle uncertainty in medical diagnosis, providing probabilistic assessments based on observed symptoms.
                </p>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent)', marginTop: '1rem' }}>
                    <strong>Core Philosophy:</strong> Unlike rigid "if-then" rule-based systems, Eleven thinks in probabilities. It understands that "Cough" increases the <em>likelihood</em> of "Pneumonia" but doesn't guarantee it.
                </div>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>2. Key Features</h2>
                <ul style={{ lineHeight: '1.8', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                    <li><strong>Conversational Diagnostic Interface:</strong> A natural language chat system where users describe their symptoms.</li>
                    <li><strong>Probabilistic Reasoning Engine:</strong> Real-time calculation of disease risks (e.g., Lung Cancer, Pneumonia) using `jsbayes`.</li>
                    <li><strong>Adaptive Interviewing:</strong> The AI calculates "Information Entropy" to ask the <em>most relevant</em> next question, reducing the number of questions needed for a diagnosis.</li>
                    <li><strong>Voice Interaction:</strong>
                        <ul>
                            <li><strong>Speech-to-Text:</strong> Dictate symptoms directly using the microphone.</li>
                            <li><strong>Text-to-Speech:</strong> The AI responds with a human-like voice (British English locale).</li>
                        </ul>
                    </li>
                    <li><strong>Document Intelligence:</strong> (New) Upload medical reports (PDF/Video). The system scans for keywords to automatically populate clinical evidence.</li>
                    <li><strong>Persistent History:</strong> Chat sessions are saved to the server, allowing users to review past consultations.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>3. Technical Architecture</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3>Frontend</h3>
                        <p>Built with <strong>React 19 & Vite</strong> for high performance.</p>
                        <p><strong>State Management:</strong> React Hooks (useState, useEffect) manage the complex interaction between the Chat UI and the Bayesian Logic.</p>
                    </div>
                    <div>
                        <h3>Backend & Storage</h3>
                        <p><strong>Supabase:</strong> Provides authentication, database (PostgreSQL), and file storage.</p>
                        <p><strong>Row Level Security (RLS):</strong> Ensures users can only access their own private medical data.</p>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>4. The Bayesian Engine (How it Works)</h2>
                <p>The "Brain" of Eleven is defined in <code>doctorLogic.js</code>.</p>
                <ol style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                    <li style={{ marginBottom: '1rem' }}>
                        <strong>Graph Definition:</strong> We define nodes (e.g., <em>Smoking</em>, <em>Cancer</em>) and directed edges (<em>Smoking &rarr; Cancer</em>).
                    </li>
                    <li style={{ marginBottom: '1rem' }}>
                        <strong>CPTs (Conditional Probability Tables):</strong> We define the statistical rules. Example:
                        <br />
                        <code>P(Cancer | Smoker) = 0.15</code> vs <code>P(Cancer | Non-Smoker) = 0.01</code>.
                    </li>
                    <li style={{ marginBottom: '1rem' }}>
                        <strong>Inference:</strong> When you provide evidence (e.g., "I smoke"), the engine re-samples the network to update the posterior probability of all diseases.
                    </li>
                </ol>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2>5. User Guide</h2>
                <h3>Starting a Check</h3>
                <p>Simply type "Start" or click the "Symptom Check" card. The AI will begin by asking about risk factors.</p>

                <h3>Uploading Documents</h3>
                <p>Click the <strong>Paperclip (📎)</strong> icon to upload a medical report. The system will scan it for known keywords like "Fever", "Abnormal X-ray", etc., and update your diagnosis automatically.</p>

                <h3>Voice Commands</h3>
                <p>Click the <strong>Microphone (🎙️)</strong> button. Speak clearly. The system will transcribe your speech and process it as a chat message.</p>
            </section>
        </div>
    );
};

export default Help;
