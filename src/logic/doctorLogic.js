import jsbayes from 'jsbayes';

/**
 * Eleven's Brain: Massive Bayesian Network Logic
 * Handles 100+ symptoms and multiple disease pathways.
 */

const createDoctorBrain = () => {
    const g = jsbayes.newGraph();

    // --- DISEASES (Target Nodes) ---
    const diseases = ['cancer', 'pneumonia', 'covid', 'tb', 'bronchitis', 'flu', 'asthma', 'heart_failure', 'anemia', 'emphysema'];
    const nodes = {};

    diseases.forEach(d => {
        nodes[d] = g.addNode(d, ['yes', 'no']);
    });

    // --- RISK FACTORS ---
    const risks = {
        smoking: ['yes', 'no'],
        pollution: ['high', 'low'],
        exposure: ['yes', 'no'],
        genetics: ['high', 'low'],
        age_senior: ['yes', 'no'],
        obesity: ['yes', 'no']
    };

    Object.entries(risks).forEach(([name, values]) => {
        nodes[name] = g.addNode(name, values);
    });

    // --- SYMPTOM CATEGORIES & DATA (Approx 100 symptoms) ---
    const symptomMap = {
        respiratory: [
            'cough', 'breathshortness', 'wheezing', 'chestpain', 'bloodincough', 'fastbreathing', 'shallowbreathing', 'stridor',
            'cough_dry', 'cough_wet', 'phlegm_yellow', 'phlegm_green', 'phlegm_rust', 'orthopnea', 'paroxysmal_nocturnal_dyspnea'
        ],
        upper_respiratory: [
            'sorethroat', 'runnynose', 'sneezing', 'blockednose', 'hoarseness', 'loss_of_smell', 'loss_of_taste', 'ear_pain', 'sinus_pressure',
            'nosebleed', 'post_nasal_drip', 'neck_swelling', 'tonsil_inflammation'
        ],
        systemic: [
            'fever', 'chills', 'fatigue', 'bodyaches', 'headache', 'nightsweats', 'weightloss', 'loss_appetite', 'sweating', 'dizziness',
            'fainting', 'malaise', 'weakness', 'lymph_nodes_swollen', 'dehydration', 'pale_skin', 'cyanosis', 'clubbing_fingers'
        ],
        cardiovascular: [
            'palpitations', 'tachycardia', 'bradycardia', 'irregular_heartbeat', 'ankle_swelling', 'leg_swelling', 'high_blood_pressure',
            'low_blood_pressure', 'cold_extremities', 'chest_tightness'
        ],
        digestive: [
            'nausea', 'vomiting', 'diarrhea', 'constipation', 'stomach_pain', 'bloating', 'heartburn', 'difficulty_swallowing',
            'jaundice', 'blood_in_stool', 'dark_urine'
        ],
        musculoskeletal: [
            'joint_pain', 'back_pain', 'stiff_neck', 'muscle_cramps', 'weak_grip', 'unsteady_walk', 'bone_pain'
        ],
        neurological: [
            'confusion', 'brain_fog', 'memory_loss', 'tremors', 'numbness', 'tingling', 'blurred_vision', 'sensitivity_to_light',
            'slurred_speech', 'seizures'
        ],
        clinical_signs: [
            'xray_abnormal', 'low_oxygen', 'high_pulse', 'low_blood_sugar', 'high_white_cells', 'crepitations_lung', 'dull_percussion'
        ]
    };

    // Add all 100+ symptoms to graph
    Object.values(symptomMap).flat().forEach(s => {
        if (!nodes[s]) {
            nodes[s] = g.addNode(s, ['yes', 'no']);
        }
    });

    // --- CAUSAL LINKS (Edges) ---
    // Risks -> Diseases
    nodes.cancer.addParent(nodes.smoking);
    nodes.cancer.addParent(nodes.pollution);
    nodes.cancer.addParent(nodes.genetics);

    nodes.pneumonia.addParent(nodes.exposure);
    nodes.pneumonia.addParent(nodes.age_senior);

    nodes.covid.addParent(nodes.exposure);

    nodes.tb.addParent(nodes.pollution);
    nodes.tb.addParent(nodes.exposure);

    nodes.bronchitis.addParent(nodes.smoking);
    nodes.bronchitis.addParent(nodes.pollution);

    nodes.flu.addParent(nodes.exposure);

    nodes.asthma.addParent(nodes.genetics);
    nodes.asthma.addParent(nodes.pollution);

    nodes.heart_failure.addParent(nodes.smoking);
    nodes.heart_failure.addParent(nodes.obesity);
    nodes.heart_failure.addParent(nodes.age_senior);

    nodes.anemia.addParent(nodes.genetics);

    nodes.emphysema.addParent(nodes.smoking);

    // Diseases -> Symptoms (Mapping dozens of symptoms to diseases)
    const mapSymptomToDiseases = (symptom, targetDiseases) => {
        targetDiseases.forEach(d => {
            if (nodes[symptom] && nodes[d]) {
                nodes[symptom].addParent(nodes[d]);
            }
        });
    };

    // Respiratory mapping
    mapSymptomToDiseases('cough', ['cancer', 'pneumonia', 'covid', 'tb', 'bronchitis', 'flu', 'asthma', 'emphysema']);
    mapSymptomToDiseases('breathshortness', ['cancer', 'pneumonia', 'covid', 'tb', 'heart_failure', 'emphysema', 'asthma', 'anemia']);
    mapSymptomToDiseases('wheezing', ['asthma', 'bronchitis', 'emphysema']);
    mapSymptomToDiseases('bloodincough', ['cancer', 'tb']);
    mapSymptomToDiseases('chestpain', ['cancer', 'pneumonia', 'heart_failure']);
    mapSymptomToDiseases('fever', ['pneumonia', 'covid', 'tb', 'flu', 'bronchitis']);
    mapSymptomToDiseases('fatigue', ['anemia', 'heart_failure', 'cancer', 'covid', 'flu', 'tb']);
    mapSymptomToDiseases('weightloss', ['cancer', 'tb']);
    mapSymptomToDiseases('nightsweats', ['tb', 'cancer']);
    mapSymptomToDiseases('xray_abnormal', ['cancer', 'pneumonia', 'tb', 'heart_failure', 'emphysema']);
    mapSymptomToDiseases('low_oxygen', ['pneumonia', 'covid', 'heart_failure', 'emphysema']);
    mapSymptomToDiseases('ankle_swelling', ['heart_failure']);
    mapSymptomToDiseases('pale_skin', ['anemia']);
    mapSymptomToDiseases('loss_of_smell', ['covid']);
    mapSymptomToDiseases('loss_of_taste', ['covid']);

    // Map remaining symptoms to at least one general "infectious" or "systemic" disease cluster
    const infectious = ['pneumonia', 'covid', 'flu', 'tb'];
    symptomMap.upper_respiratory.forEach(s => mapSymptomToDiseases(s, infectious));
    symptomMap.systemic.filter(s => !['fatigue', 'fever', 'weightloss', 'nightsweats'].includes(s)).forEach(s => mapSymptomToDiseases(s, infectious));

    // --- PROBABILITY TABLES (CPTs) ---
    // Use generic but sensible CPT generator to avoid massive manual arrays
    Object.keys(nodes).forEach(key => {
        const node = nodes[key];
        const parentCount = node.parents.length;

        if (parentCount === 0) {
            // Root nodes (Risks)
            node.setCpt([0.1, 0.9]); // 10% baseline for risks
        } else {
            // Children (Diseases and Symptoms)
            const combinations = Math.pow(2, parentCount);
            const table = [];
            for (let i = 0; i < combinations; i++) {
                // Heuristic: If i < combinations - 1, at least one parent is 'yes'
                if (i < combinations - 1) {
                    table.push([0.7, 0.3]); // High probability of condition if parent exists
                } else {
                    table.push([0.01, 0.99]); // Very low baseline probability
                }
            }
            node.setCpt(table);
        }
    });

    return { graph: g, nodes, diseases, symptomMap };
};

export const brain = createDoctorBrain();

export const updateInference = (evidence) => {
    // Reset all observations
    Object.values(brain.nodes).forEach(n => brain.graph.observe(n.name, null));

    // Apply evidence
    Object.entries(evidence || {}).forEach(([name, value]) => {
        if (brain.nodes[name]) {
            // Note: jsbayes uses value strings exactly as defined in addNode
            // We assume 'yes'/'no' for symptoms
            // If evidence is an empty object or null, we just reset.
            if (value === 'yes' || value === 'no' || value === 'high' || value === 'low' || value === 'abnormal' || value === 'normal') {
                brain.graph.observe(name, value);
            }
        }
    });

    // Increase samples for better accuracy in a large network
    return brain.graph.sample(10000)
        .then(() => {
            const results = {};
            brain.diseases.forEach(d => {
                const node = brain.nodes[d];
                // FAULT TOLERANCE: Check if value and value[0] exist. Default to 0 if not.
                const prob = (node && node.value && !isNaN(node.value[0])) ? node.value[0] : 0;
                results[d] = prob * 100;
            });
            return results;
        })
        .catch(err => {
            console.error("Bayesian Inference Error:", err);
            const fallback = {};
            brain.diseases.forEach(d => fallback[d] = 0);
            return fallback;
        });
};

export const getNextQuestion = (evidence) => {
    // Logic to find high entropy symptom unasked
    const symptomKeys = Object.keys(brain.nodes).filter(k =>
        !brain.diseases.includes(k) && !['smoking', 'pollution', 'exposure', 'genetics', 'age_senior', 'obesity'].includes(k)
    );

    let best = null;
    let maxE = -1;

    symptomKeys.forEach(s => {
        if (!(s in (evidence || {}))) {
            const node = brain.nodes[s];
            const p = (node && node.value && !isNaN(node.value[0])) ? node.value[0] : 0.5;
            // Simple entropy calculation
            const e = -(p * Math.log2(p + 0.00001) + (1 - p) * Math.log2(1 - p + 0.00001));
            if (e > maxE) {
                maxE = e;
                best = s;
            }
        }
    });
    return best;
};
