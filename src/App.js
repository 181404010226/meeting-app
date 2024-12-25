// meeting-app/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import MeetingSession from './components/MeetingSession';
import MinutesEditor from './components/MinutesEditor';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import { useAppContext } from './context/AppContext';

// 创建主题配置
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// 布局组件
const Layout = ({ children }) => (
  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    {children}
  </Container>
);

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUser } = useAppContext();

  const queryParams = new URLSearchParams(location.search);
  const loginSuccess = queryParams.get('login_success');

  // 立即执行登录成功的处理
  if (loginSuccess === 'true') {
    localStorage.setItem('isAuthenticated', 'true');
    fetchUser().then(() => {
      const currentPath = window.location.pathname;
      navigate(currentPath, { replace: true });
    }).catch((err) => {
      localStorage.removeItem('isAuthenticated');
      navigate('/login', { replace: true });
    });
  }

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }
  
  return children;
};

// Minutes路由组件
const MinutesRoute = () => {
  const { sessionId } = useParams();
  return <MinutesEditor sessionId={sessionId} />;
};

// 主应用组件
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* 公共路由 */}
          <Route 
            path="/login" 
            element={
              <Layout>
                <Login />
              </Layout>
            } 
          />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* 受保护的路由 */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/meeting/:sessionId"
            element={
              <ProtectedRoute>
                <Layout>
                  <MeetingSession />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/sessions/:sessionId/minutes"
            element={
              <ProtectedRoute>
                <Layout>
                  <MinutesRoute />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 路由 */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;