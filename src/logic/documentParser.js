import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

/**
 * Parses a file (PDF or Word) and extracts text.
 * @param {File} file 
 * @returns {Promise<string>} extracted text
 */
export const parseDocument = async (file) => {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        return parsePDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return parseWord(file);
    } else {
        throw new Error('Unsupported file type. Please upload PDF or DOCX.');
    }
};

const parsePDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
    }
    return fullText;
};

const parseWord = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

/**
 * Scans text for medical keywords to infer evidence.
 */
export const scanForSymptoms = (text) => {
    const evidence = {};
    const lowerText = text.toLowerCase();

    const patterns = {
        smoking: ['smoke', 'smoking', 'tobacco', 'cigarettes'],
        cough: ['cough', 'coughing', 'chronic cough'],
        fever: ['fever', 'high temperature', 'chills'],
        xray: ['abnormal x-ray', 'nodule', 'mass', 'opacity', 'lesion']
    };

    Object.keys(patterns).forEach(node => {
        if (patterns[node].some(keyword => lowerText.includes(keyword))) {
            // For X-ray we map to 'abnormal', others 'yes'
            evidence[node] = node === 'xray' ? 'abnormal' : 'yes';
        }
    });

    return evidence;
};
