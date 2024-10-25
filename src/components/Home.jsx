import axios from '../services/api';
import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import { Button, Box, Avatar, Typography, AppBar, Toolbar, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { useAppContext } from '../context/AppContext';

const Home = () => {
    const { user, loading, error, fetchUser } = useAppContext();
    const location = useLocation();
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [sessionsError, setSessionsError] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const loginSuccess = queryParams.get('login_success');

        if (loginSuccess === 'true' && !user) {
            fetchUser();
        }

        fetchSessions();
    }, [location, user, fetchUser]);

    const fetchSessions = async () => {
        try {
            const response = await axios.get('/api/sessions');
            // 确保即使后端返回 null 也转换为空数组
            setSessions(response.data || []);
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setSessionsError('Failed to fetch sessions.');
            setSessions([]); // 发生错误时设置为空数组
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleLogout = () => {
        window.location.href = `${getBaseUrl()}/logout`;
    };

    if (loading || loadingSessions) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
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
                            <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
                                Logout
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Box sx={{ padding: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Welcome to the Meeting App
                </Typography>
                {user ? (
                    <Box sx={{ mt: 4 }}>
                        <Button variant="contained" color="primary" component={Link} to="/admin" sx={{ mr: 2 }}>
                            Admin Panel
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
                <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
                    Available Meetings
                </Typography>
                {sessionsError ? (
                    <Typography color="error">{sessionsError}</Typography>
                ) : (
                    <List>
                        {sessions.length === 0 ? (
                            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                                No meetings available at the moment.
                            </Typography>
                        ) : (
                            sessions.map((session) => (
                                <ListItem key={session._id}>
                                    <ListItemText primary={session.name} />
                                    <Button variant="outlined" component={Link} to={`/meeting/${session._id}`}>
                                        Join
                                    </Button>
                                </ListItem>
                            ))
                        )}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default Home;