import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const symptomsList = [
    // Respiratory
    { id: 'cough', label: 'General Cough', category: 'Respiratory' },
    { id: 'cough_dry', label: 'Dry Cough', category: 'Respiratory' },
    { id: 'cough_wet', label: 'Wet/Productive Cough', category: 'Respiratory' },
    { id: 'breathshortness', label: 'Shortness of Breath', category: 'Respiratory' },
    { id: 'wheezing', label: 'Wheezing', category: 'Respiratory' },
    { id: 'chestpain', label: 'Chest Pain/Pressure', category: 'Respiratory' },
    { id: 'bloodincough', label: 'Coughing up Blood', category: 'Respiratory' },
    { id: 'fastbreathing', label: 'Rapid Breathing (Tachypnea)', category: 'Respiratory' },
    { id: 'shallowbreathing', label: 'Shallow Breathing', category: 'Respiratory' },
    { id: 'stridor', label: 'High-pitched Breathing (Stridor)', category: 'Respiratory' },
    { id: 'phlegm_yellow', label: 'Yellow Phlegm', category: 'Respiratory' },
    { id: 'phlegm_green', label: 'Green Phlegm', category: 'Respiratory' },
    { id: 'phlegm_rust', label: 'Rust-colored Phlegm', category: 'Respiratory' },
    { id: 'orthopnea', label: 'Difficulty Breathing while Lying Down', category: 'Respiratory' },
    { id: 'paroxysmal_nocturnal_dyspnea', label: 'Sudden Nighttime Breathlessness', category: 'Respiratory' },

    // Upper Respiratory & ENT
    { id: 'sorethroat', label: 'Sore Throat', category: 'Head & ENT' },
    { id: 'runnynose', label: 'Runny Nose', category: 'Head & ENT' },
    { id: 'sneezing', label: 'Sneezing', category: 'Head & ENT' },
    { id: 'blockednose', label: 'Nasal Congestion', category: 'Head & ENT' },
    { id: 'hoarseness', label: 'Hoarse Voice', category: 'Head & ENT' },
    { id: 'loss_of_smell', label: 'Loss of Smell', category: 'Head & ENT' },
    { id: 'loss_of_taste', label: 'Loss of Taste', category: 'Head & ENT' },
    { id: 'ear_pain', label: 'Ear Pain', category: 'Head & ENT' },
    { id: 'sinus_pressure', label: 'Sinus Pressure/Pain', category: 'Head & ENT' },
    { id: 'nosebleed', label: 'Nosebleed', category: 'Head & ENT' },
    { id: 'post_nasal_drip', label: 'Post-nasal Drip', category: 'Head & ENT' },
    { id: 'neck_swelling', label: 'Neck Swelling', category: 'Head & ENT' },
    { id: 'tonsil_inflammation', label: 'Swollen Tonsils', category: 'Head & ENT' },

    // Systemic
    { id: 'fever', label: 'Fever', category: 'Systemic' },
    { id: 'chills', label: 'Chills/Shivering', category: 'Systemic' },
    { id: 'fatigue', label: 'Fatigue/Exhaustion', category: 'Systemic' },
    { id: 'bodyaches', label: 'Muscle/Body Aches', category: 'Systemic' },
    { id: 'headache', label: 'Headache', category: 'Systemic' },
    { id: 'nightsweats', label: 'Night Sweats', category: 'Systemic' },
    { id: 'weightloss', label: 'Unexplained Weight Loss', category: 'Systemic' },
    { id: 'loss_appetite', label: 'Loss of Appetite', category: 'Systemic' },
    { id: 'sweating', label: 'Excessive Sweating', category: 'Systemic' },
    { id: 'dizziness', label: 'Dizziness/Vertigo', category: 'Systemic' },
    { id: 'fainting', label: 'Fainting (Syncope)', category: 'Systemic' },
    { id: 'malaise', label: 'General Feeling of Unwellness', category: 'Systemic' },
    { id: 'weakness', label: 'Generalized Weakness', category: 'Systemic' },
    { id: 'lymph_nodes_swollen', label: 'Swollen Lymph Nodes', category: 'Systemic' },
    { id: 'dehydration', label: 'Signs of Dehydration', category: 'Systemic' },
    { id: 'pale_skin', label: 'Pale Skin/Complexion', category: 'Systemic' },
    { id: 'cyanosis', label: 'Bluish Skin/Lips (Cyanosis)', category: 'Systemic' },
    { id: 'clubbing_fingers', label: 'Clubbing of Fingers/Toes', category: 'Systemic' },

    // Cardiovascular
    { id: 'palpitations', label: 'Heart Palpitations', category: 'Cardiovascular' },
    { id: 'tachycardia', label: 'Rapid Heart Rate', category: 'Cardiovascular' },
    { id: 'bradycardia', label: 'Slow Heart Rate', category: 'Cardiovascular' },
    { id: 'irregular_heartbeat', label: 'Irregular Heartbeat', category: 'Cardiovascular' },
    { id: 'ankle_swelling', label: 'Ankle Swelling (Edema)', category: 'Cardiovascular' },
    { id: 'leg_swelling', label: 'Leg Swelling', category: 'Cardiovascular' },
    { id: 'high_blood_pressure', label: 'Known High Blood Pressure', category: 'Cardiovascular' },
    { id: 'low_blood_pressure', label: 'Known Low Blood Pressure', category: 'Cardiovascular' },
    { id: 'cold_extremities', label: 'Cold Hands/Feet', category: 'Cardiovascular' },
    { id: 'chest_tightness', label: 'Chest Tightness', category: 'Cardiovascular' },

    // Digestive
    { id: 'nausea', label: 'Nausea', category: 'Digestive' },
    { id: 'vomiting', label: 'Vomiting', category: 'Digestive' },
    { id: 'diarrhea', label: 'Diarrhea', category: 'Digestive' },
    { id: 'constipation', label: 'Constipation', category: 'Digestive' },
    { id: 'stomach_pain', label: 'Abdominal Pain', category: 'Digestive' },
    { id: 'bloating', label: 'Bloating/Gas', category: 'Digestive' },
    { id: 'heartburn', label: 'Heartburn/Acid Reflux', category: 'Digestive' },
    { id: 'difficulty_swallowing', label: 'Difficulty Swallowing', category: 'Digestive' },
    { id: 'jaundice', label: 'Yellowing of Eyes/Skin (Jaundice)', category: 'Digestive' },
    { id: 'blood_in_stool', label: 'Blood in Stool', category: 'Digestive' },
    { id: 'dark_urine', label: 'Dark Colored Urine', category: 'Digestive' },

    // Musculoskeletal
    { id: 'joint_pain', label: 'Joint Pain', category: 'Musculoskeletal' },
    { id: 'back_pain', label: 'Back Pain', category: 'Musculoskeletal' },
    { id: 'stiff_neck', label: 'Stiff Neck', category: 'Musculoskeletal' },
    { id: 'muscle_cramps', label: 'Muscle Cramps', category: 'Musculoskeletal' },
    { id: 'weak_grip', label: 'Weak Grip Strength', category: 'Musculoskeletal' },
    { id: 'unsteady_walk', label: 'Unsteady Gait', category: 'Musculoskeletal' },
    { id: 'bone_pain', label: 'Deep Bone Pain', category: 'Musculoskeletal' },

    // Neurological
    { id: 'confusion', label: 'Confusion/Disorientation', category: 'Neurological' },
    { id: 'brain_fog', label: 'Brain Fog/Difficulty Thinking', category: 'Neurological' },
    { id: 'memory_loss', label: 'Short-term Memory Loss', category: 'Neurological' },
    { id: 'tremors', label: 'Hand Tremors/Shaking', category: 'Neurological' },
    { id: 'numbness', label: 'Numbness', category: 'Neurological' },
    { id: 'tingling', label: 'Tingling/Pins & Needles', category: 'Neurological' },
    { id: 'blurred_vision', label: 'Blurred Vision', category: 'Neurological' },
    { id: 'sensitivity_to_light', label: 'Sensitivity to Light', category: 'Neurological' },
    { id: 'slurred_speech', label: 'Slurred Speech', category: 'Neurological' },
    { id: 'seizures', label: 'History of Seizures', category: 'Neurological' },

    // Clinical Signs
    { id: 'xray_abnormal', label: 'Abnormal X-Ray Findings', category: 'Clinical Signs' },
    { id: 'low_oxygen', label: 'Low Oxygen Levels (Oximeter)', category: 'Clinical Signs' },
    { id: 'high_pulse', label: 'High Resting Pulse', category: 'Clinical Signs' },
    { id: 'low_blood_sugar', label: 'Low Blood Sugar (Hypoglycemia)', category: 'Clinical Signs' },
    { id: 'high_white_cells', label: 'High White Blood Cell Count', category: 'Clinical Signs' },
    { id: 'crepitations_lung', label: 'Lung Crackles/Crepitations', category: 'Clinical Signs' },
    { id: 'dull_percussion', label: 'Dull Lung Percussion', category: 'Clinical Signs' },

    // Risk Factors
    { id: 'smoking', label: 'Heavy Smoking History', category: 'Risk Factors' },
    { id: 'pollution', label: 'Living in High Pollution Area', category: 'Risk Factors' },
    { id: 'exposure', label: 'Confirmed Disease Exposure', category: 'Risk Factors' },
    { id: 'genetics', label: 'Family History of Condition', category: 'Risk Factors' },
    { id: 'age_senior', label: 'Age 65 or Older', category: 'Risk Factors' },
    { id: 'obesity', label: 'Obesity (High BMI)', category: 'Risk Factors' }
];

const SymptomPicker = () => {
    const { evidence, setEvidence, setDiagnosis } = useApp();
    const [selected, setSelected] = useState(evidence);
    const navigate = useNavigate();

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

    const categories = Array.from(new Set(symptomsList.map(s => s.category)));

    return (
        <div style={{ width: '100%', maxWidth: '1200px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'sticky', top: '0', background: '#f9fafb', padding: '1rem 0', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Symptom Explorer (100+ Nodes)</h1>
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
                <strong>How it works:</strong> Your selections are fed into a 120-node Bayesian Network. Probabilities are recalculated using 10,000 Monte Carlo samples to show you the most likely diagnostic pathways based on current medical logic.
            </div>
        </div>
    );
};

export default SymptomPicker;
