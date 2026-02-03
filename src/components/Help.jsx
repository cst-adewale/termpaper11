import React from 'react';

const Help = () => {
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Help & Guide</h1>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2>Getting Started</h2>
                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    Welcome to Eleven Medical AI. This application helps assess respiratory health risks using advanced Bayesian probabilistic modeling.
                </p>
                <ol style={{ paddingLeft: '1.5rem', marginTop: '1rem', lineHeight: '1.8' }}>
                    <li><strong>Sign Up/Login:</strong> Create an account to save your history.</li>
                    <li><strong>Start a Chat:</strong> Tell the AI about your symptoms (e.g., "I have a cough").</li>
                    <li><strong>Answer Questions:</strong> The AI will ask specific follow-up questions to refine its diagnosis.</li>
                    <li><strong>View Results:</strong> Real-time probabilities for conditions effectively update in the sidebar.</li>
                </ol>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
                <h2>How the Bayesian Engine Works</h2>
                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        The core of this application is a <strong>Bayesian Belief Network</strong> (BBN). Unlike standard rule-based systems, a BBN deals with <em>uncertainty</em> using probability theory.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>1. Nodes & Edges</h3>
                    <p>The network consists of <strong>Nodes</strong> (Variables like <em>Smoking</em>, <em>Lung Cancer</em>, <em>Cough</em>) and <strong>Edges</strong> (Causal arrows, e.g., <em>Smoking induces Lung Cancer</em>).</p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>2. Inference (The "Thinking" Process)</h3>
                    <p>
                        When you say "I smoke", we treat this as <strong>Evidence</strong>. The algorithm then propagates this information through the network to update the probability of hidden nodes (like <em>Lung Cancer</em>).
                    </p>
                    <code style={{ display: 'block', background: '#2d2d2d', color: '#fff', padding: '1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem' }}>
                        P(Disease | Symptoms) = [P(Symptoms | Disease) * P(Disease)] / P(Symptoms)
                    </code>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>3. Entropy & Next Question</h3>
                    <p>
                        To decide what to ask next, the AI calculates the <strong>Information Entropy</strong> of all unknown nodes. It selects the question that will provide the most information gain (reduce uncertainty the most).
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Help;
