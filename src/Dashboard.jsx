import { useState } from 'react'
import './Dashboard.css'

function Dashboard({ symptoms, diagnosis, onBack }) {
  return (
    <div className="v1-dashboard-overlay">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>MediBayes AI <small style={{ fontSize: '0.6em' }}>v1.0.1 (Legacy)</small></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Full Diagnostic Dashboard</p>
        </div>
        <button className="back-btn" onClick={onBack}>Return to Eleven</button>
      </header>

      <div className="dashboard-grid">
        <aside className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>SYMPTOMS</h2>
          {Object.entries(symptoms).map(([key, value]) => (
            <div key={key} className={`symptom-item ${value ? 'active' : ''}`}>
              <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
              <span style={{ color: value ? 'var(--brand-primary)' : 'inherit' }}>{value ? 'YES' : 'NO'}</span>
            </div>
          ))}
        </aside>

        <main className="diagnosis-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {diagnosis.map((item) => (
            <div key={item.id} className="diagnosis-card glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{item.name}</h3>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: item.risk === 'high' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: item.risk === 'high' ? '#f43f5e' : '#10b981'
                  }}>
                    {item.risk.toUpperCase()} RISK
                  </span>
                </div>
                <div className="probability-ring">
                  {Math.round(item.prob)}%
                  <svg width="60" height="60" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="30" cy="30" r="26"
                      fill="none"
                      stroke={item.risk === 'high' ? '#f43f5e' : '#10b981'}
                      strokeWidth="4"
                      strokeDasharray={`${(item.prob / 100) * 163.3} 163.3`}
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
