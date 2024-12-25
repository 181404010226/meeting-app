import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { getBaseUrl } from '../services/api';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const redirect = queryParams.get('redirect') || '/';
    
    // Only handle redirection if already authenticated
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate(redirect, { replace: true });
    }
  }, [location, navigate]);

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      window.location.href = `${getBaseUrl()}/login`;
    } catch (error) {
      setError('登录失败，请重试');
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            登录
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleGitHubLogin}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? '登录中...' : '使用 GitHub 登录'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 