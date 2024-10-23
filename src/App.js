// meeting-app/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import MeetingSession from './components/MeetingSession';
import Home from './components/Home';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { getBaseUrl } from './services/api';
import './App.css';

const AppContent = () => {
  const { loading } = useAppContext();

  if (loading) {
    return <div>Loading...</div>; // Or a global loader component
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<ProtectedRoute component={<AdminPanel />} />} />
        <Route path="/meeting/:sessionId" element={<ProtectedRoute component={<MeetingSession />} />} />
        {/* Redirect any unknown routes to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

// ProtectedRoute Component to guard private routes
const ProtectedRoute = ({ component }) => {
  const { user, loading } = useAppContext();

  if (loading) {
    return <div>Loading...</div>; // Or a global loader component
  }

  if (!user) {
    // If user is not authenticated, redirect to Home or Login
    return <Navigate to="/" />;
  }

  return component;
};

const App = () => {
  console.log('API Base URL:', getBaseUrl());
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
};

export default App;