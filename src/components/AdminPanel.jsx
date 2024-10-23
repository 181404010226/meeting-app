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
            setSessions(response.data);
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setError('Failed to fetch sessions.');
        } finally {
            setLoading(false);
        }
    };

    const deleteSession = async (sessionId) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                await axios.delete(`/api/sessions/${sessionId}`);
                alert('Session deleted successfully!');
                fetchSessions();
            } catch (err) {
                console.error('Error deleting session:', err);
                alert('Failed to delete session.');
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
                {sessions.map((session) => (
                    <ListItem
                        key={session._id}
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => deleteSession(session._id)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText primary={session.name} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default AdminPanel;