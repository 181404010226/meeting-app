import React from 'react';
import api from './services/api';  // 导入 api 实例
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import MeetingSession from './components/MeetingSession';
import Home from './components/Home';
import { AppContextProvider, useAppContext } from './context/AppContext';
import './App.css';

const AppContent = () => {
  const { setUser } = useAppContext();

  React.useEffect(() => {
    // 使用 api 实例检查用户是否登录
    api.get('/api/user')
      .then(response => {
        const data = response.data;
        if (data.user) {
          console.log('User data received:', data.user);
          setUser(data.user);
        } else {
          console.log('No user data received');
        }
      })
      .catch(error => {
        console.error('Error fetching user:', error);
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