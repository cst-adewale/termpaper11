import jsbayes from 'jsbayes';

/**
 * Eleven's Brain: Bayesian Network Logic
 * This module defines the causal structure and calculates diagnostic probabilities.
 */

const createDoctorBrain = () => {
    const g = jsbayes.newGraph();

    // 1. Defining Nodes (Random Variables)
    const smoking = g.addNode('smoking', ['yes', 'no']);
    const pneumonia = g.addNode('pneumonia', ['yes', 'no']);
    const lungCancer = g.addNode('cancer', ['yes', 'no']);
    const cough = g.addNode('cough', ['yes', 'no']);
    const fever = g.addNode('fever', ['yes', 'no']);
    const xray = g.addNode('xray', ['abnormal', 'normal']);

    // 2. Defining Causal Links (Edges)
    lungCancer.addParent(smoking);
    cough.addParent(lungCancer);
    cough.addParent(pneumonia);
    fever.addParent(pneumonia);
    xray.addParent(lungCancer);

    // 3. Defining Probabilities (CPTs)
    // P(Smoking)
    smoking.setCpt([0.3, 0.7]); // 30% smokers

    // P(Pneumonia) - General baseline
    pneumonia.setCpt([0.05, 0.95]);

    // P(Lung Cancer | Smoking)
    lungCancer.setCpt([
        [0.15, 0.85], // Smoking = yes
        [0.01, 0.99]  // Smoking = no
    ]);

    // P(Fever | Pneumonia)
    fever.setCpt([
        [0.90, 0.10], // Pneumonia = yes
        [0.05, 0.95]  // Pneumonia = no
    ]);

    // P(Xray | Lung Cancer)
    xray.setCpt([
        [0.85, 0.15], // Cancer = yes
        [0.10, 0.90]  // Cancer = no
    ]);

    // P(Cough | Lung Cancer, Pneumonia)
    cough.setCpt([
        [0.99, 0.01], // Cancer=yes, Pneumonia=yes
        [0.80, 0.20], // Cancer=yes, Pneumonia=no
        [0.70, 0.30], // Cancer=no,  Pneumonia=yes
        [0.05, 0.95]  // Cancer=no,  Pneumonia=no
    ]);

    return { graph: g, nodes: { smoking, pneumonia, lungCancer, cough, fever, xray } };
};

export const brain = createDoctorBrain();

/**
 * Calculate Entropy of a node given current evidence
 * Used to determine "Best Next Question"
 */
const calculateEntropy = (node) => {
    const probs = node.value; // JSBayes updates this after sampling
    return -probs.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
};

/**
 * Get the best symptom question to ask next.
 * It looks for symptoms that haven't been answered yet and 
 * finds which one would reduce the uncertainty of the diseases the most.
 */
export const getNextQuestion = (evidence) => {
    const symptoms = ['smoking', 'cough', 'fever', 'xray'];
    const diseases = ['cancer', 'pneumonia'];

    // Simple heuristic: Ask about symptoms that are not in evidence 
    // and have the highest variance in the current model.
    let bestNode = null;
    let maxEntropy = -1;

    symptoms.forEach(s => {
        if (!(s in evidence)) {
            const node = brain.nodes[s];
            const entropy = calculateEntropy(node);
            if (entropy > maxEntropy) {
                maxEntropy = entropy;
                bestNode = s;
            }
        }
    });

    return bestNode;
};

/**
 * Update the model with new evidence and re-sample
 */
export const updateInference = (evidence) => {
    // Reset evidence
    Object.values(brain.nodes).forEach(n => brain.graph.observe(n.name, null));

    // Apply new evidence
    Object.entries(evidence).forEach(([name, value]) => {
        brain.graph.observe(name, value);
    });

    return brain.graph.sample(10000)
        .then(() => {
            const results = {};
            ['cancer', 'pneumonia'].forEach(d => {
                results[d] = brain.nodes[d].value[0] * 100; // Probability of 'yes' (index 0)
            });
            return results;
        });
};
