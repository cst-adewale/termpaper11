import React from 'react';

const Documents = () => {
    return (
        <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
            <h1>Documents</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage your uploaded medical records and reports.</p>

            <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', background: '#f9fafb' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                        <div style={{ fontWeight: 600 }}>Medical_Report_00{i}.pdf</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uploaded 2 days ago</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Documents;
