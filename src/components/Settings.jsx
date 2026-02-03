import React from 'react';

const Settings = () => {
    return (
        <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
            <h1>Settings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your application preferences.</p>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <h3>Appearance</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <span>Dark Mode</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Controlled by Sidebar)</span>
                </div>
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3>Notifications</h3>
                <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input type="checkbox" defaultChecked />
                        Receive email updates
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" defaultChecked />
                        Enable voice alerts
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Settings;
