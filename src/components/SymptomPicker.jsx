import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const SymptomPicker = () => {
    const { evidence, setEvidence, setDiagnosis } = useApp();
    const [symptomsList, setSymptomsList] = useState([]);
    const [selected, setSelected] = useState(evidence);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNodes = async () => {
            const { data, error } = await supabase
                .from('medical_nodes')
                .select('id, name, category, type')
                .in('type', ['symptom', 'risk']);

            if (!error && data) {
                const formatted = data.map(n => ({
                    id: n.id,
                    label: n.name,
                    category: n.category || (n.type === 'risk' ? 'Risk Factors' : 'General')
                }));
                setSymptomsList(formatted);
            }
            setLoading(false);
        };
        fetchNodes();
    }, []);

    const toggleSymptom = (id) => {
        setSelected(prev => ({
            ...prev,
            [id]: prev[id] === 'yes' ? 'no' : 'yes'
        }));
    };

    const handleApply = async () => {
        setEvidence(selected);
        const { updateInference } = await import('../logic/doctorLogic');
        const results = await updateInference(selected);
        setDiagnosis(results);
        navigate('/');
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Medical Database...</div>;

    const categories = Array.from(new Set(symptomsList.map(s => s.category)));

    return (
        <div style={{ width: '100%', maxWidth: '1200px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'sticky', top: '0', background: '#f9fafb', padding: '1rem 0', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Symptom Explorer</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Select your indications to update the Bayesian Brain.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setSelected({})}
                        style={{ background: '#fff', border: '1px solid var(--border)', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    >
                        Apply Assessment
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', paddingBottom: '3rem' }}>
                {categories.map(cat => (
                    <div key={cat} style={{ background: '#fff', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--accent)', display: 'flex', justifyContent: 'space-between' }}>
                            {cat}
                            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{symptomsList.filter(s => s.category === cat).length}</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {symptomsList.filter(s => s.category === cat).map(s => (
                                <label key={s.id} style={{ display: 'flex', alignItems: 'start', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: '#333', lineWeight: 1.4 }}>
                                    <input
                                        type="checkbox"
                                        checked={selected[s.id] === 'yes'}
                                        onChange={() => toggleSymptom(s.id)}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', marginTop: '2px' }}
                                    />
                                    {s.label}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong>Dynamic Engine:</strong> Your selections are fed into a live Bayesian Network pulled from your database. Probabilities are recalculated using 10,000 Monte Carlo samples.
            </div>
        </div>
    );
};

export default SymptomPicker;
