import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import MeetingSession from './components/MeetingSession';
import Home from './components/Home';
import { AppContextProvider, useAppContext } from './context/AppContext';
import './App.css';

const AppContent = () => {
  const { setUser } = useAppContext();

  React.useEffect(() => {
    // Check if the user is logged in when the app loads
    fetch('/api/user', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                console.log('User data received:', data.user);  // 添加日志
                setUser(data.user);
            } else {
                console.log('No user data received');  // 添加日志
            }
        })
        .catch(error => {
            console.error('Error fetching user:', error);
            console.log('Error details:', error.message);  // 添加更详细的错误日志
        });
  }, [setUser]);

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

const App = () => {
    return (
        <AppContextProvider>
            <AppContent />
        </AppContextProvider>
    );
};

// ProtectedRoute Component to guard private routes
const ProtectedRoute = ({ component }) => {
    const { user } = useAppContext();

    if (!user) {
        // If user is not authenticated, redirect to Home or Login
        return <Navigate to="/" />;
    }

    return component;
};

export default App;