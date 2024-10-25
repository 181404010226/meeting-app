import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, List, ListItem, ListItemText, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../services/api';

const AdminPanel = () => {
    const [sessionName, setSessionName] = useState('');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const createSession = async () => {
        try {
            await axios.post('/api/sessions', { name: sessionName });
            alert('Session created successfully!');
            setSessionName('');
            fetchSessions();
        } catch (err) {
            console.error('Error creating session:', err);
            alert('Failed to create session.');
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await axios.get('/api/sessions');
            // 确保即使后端返回 null 也转换为空数组
            setSessions(response.data || []);
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setError('Failed to fetch sessions.');
            setSessions([]); // 发生错误时设置为空数组
        } finally {
            setLoading(false);
        }
    };

    const deleteSession = async (sessionId) => {
        if (!sessionId) {
            console.error('Invalid session ID');
            return;
        }
    
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                const response = await axios.delete(`/api/sessions/${sessionId}`);
                if (response.status === 200) {
                    alert('Session deleted successfully!');
                    fetchSessions();
                } else {
                    throw new Error('Failed to delete session');
                }
            } catch (err) {
                console.error('Error deleting session:', err);
                alert(err.response?.data || 'Failed to delete session.');
            }
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    if (loading) {
        return <Typography>Loading sessions...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Admin Panel
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <TextField
                    label="Session Name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    variant="outlined"
                    fullWidth
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={createSession}
                    sx={{ ml: 2, height: '56px' }}
                >
                    Create Session
                </Button>
            </Box>
            <Typography variant="h5" gutterBottom>
                Existing Sessions
            </Typography>
            <List>
                {sessions.length === 0 ? (
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        No sessions available. Create one to get started.
                    </Typography>
                ) : (
                    sessions.map((session) => (
                        <ListItem
                            key={session._id}
                            secondaryAction={
                                <IconButton 
                                    edge="end" 
                                    aria-label="delete" 
                                    onClick={() => deleteSession(session._id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={session.name} />
                        </ListItem>
                    ))
                )}
            </List>
        </Box>
    );
};

export default AdminPanel;