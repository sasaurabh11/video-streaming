import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthContent from './components/auth/AuthContent';
import Dashboard from './components/layout/Dashboard';

export default function App() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthProvider>
      <AuthContent showRegister={showRegister} setShowRegister={setShowRegister} />
      <Dashboard />
    </AuthProvider>
  );
}