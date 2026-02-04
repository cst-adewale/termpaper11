import jsbayes from 'jsbayes';
import { supabase } from '../supabase';

/**
 * Eleven's Brain: Dynamic Bayesian Network Logic
 * Now data-driven via Supabase tables: medical_nodes and medical_links.
 */

let brainState = {
    graph: null,
    nodes: {},
    diseases: [],
    symptomMap: {}
};

export const initializeDoctorBrain = async () => {
    console.log("Initializing Eleven's Brain from Database...");
    const g = jsbayes.newGraph();
    const nodes = {};
    const diseases = [];
    const symptomMap = {};

    try {
        // 1. Fetch Nodes
        const { data: dbNodes, error: nodesError } = await supabase
            .from('medical_nodes')
            .select('*');

        if (nodesError) throw nodesError;

        dbNodes.forEach(n => {
            // Determine possible values based on type or use defaults
            const values = (n.id === 'xray_abnormal') ? ['abnormal', 'normal'] :
                (n.type === 'risk' && ['pollution', 'genetics'].includes(n.id)) ? ['high', 'low'] :
                    ['yes', 'no'];

            nodes[n.id] = g.addNode(n.id, values);

            if (n.type === 'disease') diseases.push(n.id);
            if (n.type === 'symptom' && n.category) {
                if (!symptomMap[n.category]) symptomMap[n.category] = [];
                symptomMap[n.category].push(n.id);
            }
        });

        // 2. Fetch Links
        const { data: dbLinks, error: linksError } = await supabase
            .from('medical_links')
            .select('*');

        if (linksError) throw linksError;

        dbLinks.forEach(link => {
            if (nodes[link.child_id] && nodes[link.parent_id]) {
                nodes[link.child_id].addParent(nodes[link.parent_id]);
            }
        });

        // 3. Generate CPTs (Conditional Probability Tables)
        Object.keys(nodes).forEach(id => {
            const node = nodes[id];
            const dbNode = dbNodes.find(n => n.id === id);
            const parentCount = node.parents.length;

            if (parentCount === 0) {
                // Root nodes use baseline_prob from DB
                const p = dbNode?.baseline_prob || 0.1;
                node.setCpt([p, 1 - p]);
            } else {
                // Children use heuristic mapping
                const combinations = Math.pow(2, parentCount);
                const table = [];
                for (let i = 0; i < combinations; i++) {
                    // Logic: i=0 is all 'yes', last one is all 'no' (roughly)
                    // If at least one parent is 'yes' (simplified index check)
                    if (i < combinations - 1) {
                        table.push([0.7, 0.3]);
                    } else {
                        table.push([0.01, 0.99]);
                    }
                }
                node.setCpt(table);
            }
        });

        brainState = { graph: g, nodes, diseases, symptomMap };
        console.log("Brain Initialized Successfully with", dbNodes.length, "nodes");
        return brainState;
    } catch (err) {
        console.error("Failed to initialize Bayesian Brain:", err);
        return null;
    }
};

export const updateInference = async (evidence) => {
    if (!brainState.graph) {
        await initializeDoctorBrain();
    }

    const { graph, nodes, diseases } = brainState;
    if (!graph) return {};

    // Reset observations
    Object.values(nodes).forEach(n => graph.observe(n.name, null));

    // Apply evidence
    Object.entries(evidence || {}).forEach(([name, value]) => {
        if (nodes[name]) {
            // Validate value is within allowed range for this node
            if (nodeAllowsValue(nodes[name], value)) {
                graph.observe(name, value);
            }
        }
    });

    try {
        await graph.sample(10000);
        const results = {};
        diseases.forEach(d => {
            const node = nodes[d];
            const prob = (node && node.value && !isNaN(node.value[0])) ? node.value[0] : 0;
            results[d] = prob * 100;
        });
        return results;
    } catch (err) {
        console.error("Inference Error:", err);
        return diseases.reduce((acc, d) => ({ ...acc, [d]: 0 }), {});
    }
};

export const getNextQuestion = (evidence) => {
    const { nodes, diseases } = brainState;
    if (!nodes) return null;

    const risks = ['smoking', 'pollution', 'exposure', 'genetics', 'age_senior', 'obesity'];
    const symptomKeys = Object.keys(nodes).filter(k =>
        !diseases.includes(k) && !risks.includes(k)
    );

    let best = null;
    let maxE = -1;

    symptomKeys.forEach(s => {
        if (!(s in (evidence || {}))) {
            const node = nodes[s];
            const p = (node && node.value && !isNaN(node.value[0])) ? node.value[0] : 0.5;
            const e = -(p * Math.log2(p + 0.00001) + (1 - p) * Math.log2(1 - p + 0.00001));
            if (e > maxE) {
                maxE = e;
                best = s;
            }
        }
    });
    return best;
};

const nodeAllowsValue = (node, value) => {
    return node.values.includes(value);
};

