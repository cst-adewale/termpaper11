import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Home from './components/Home';
import ChatPage from './pages/ChatPage';
import Settings from './components/Settings';
import Help from './components/Help';
import SymptomPicker from './components/SymptomPicker';
import Documents from './components/Documents';
import Dashboard from './Dashboard';
import Auth from './components/Auth';
import './App.css';

function App() {
  const { session, setSession } = useApp();

  if (!session) {
    return <Auth onGuestLogin={(guestSession) => setSession(guestSession)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
        <Route path="documents" element={<Documents />} />
        <Route path="click-model" element={<SymptomPicker />} />
        <Route path="history" element={<Navigate to="/" replace />} /> {/* History list is in Sidebar */}
      </Route>
      <Route path="/dashboard" element={<Dashboard onBack={() => window.history.back()} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;