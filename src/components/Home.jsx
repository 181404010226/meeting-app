import React, { useEffect } from 'react';
import { getBaseUrl } from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import { Button, Box, Avatar, Typography, AppBar, Toolbar, CircularProgress } from '@mui/material';
import { useAppContext } from '../context/AppContext';

const Home = () => {
    const { user, loading, error, fetchUser } = useAppContext(); // Ensure fetchUser is destructured
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const loginSuccess = queryParams.get('login_success');

        if (loginSuccess === 'true' && !user) {
            fetchUser();
        }
    }, [location, user, fetchUser]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress /> {/* Now correctly imported */}
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ padding: 4, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
                <Button variant="contained" onClick={fetchUser} sx={{ mt: 2 }}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <AppBar position="static">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6">Meeting App</Typography>
                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 2 }}>{user.name}</Typography>
                            <Avatar src={user.avatar_url} alt={user.name} />
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Box sx={{ padding: 4, textAlign: 'center' }}>
                <h1>Welcome to the Meeting App</h1>
                {user ? (
                    <Box sx={{ mt: 4 }}>
                        <Button variant="contained" color="primary" component={Link} to="/admin" sx={{ mr: 2 }}>
                            Admin Panel
                        </Button>
                        <Button variant="contained" color="secondary" component={Link} to="/meeting">
                            Join Meeting
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ mt: 4 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            href={`${getBaseUrl()}/login`}
                        >
                            Login with GitHub
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Home;