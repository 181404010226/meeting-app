// src/components/AdminPanel.jsx
import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import axios from '../services/api';

const AdminPanel = () => {
    const [sessionName, setSessionName] = useState('');

    const createSession = async () => {
        try {
            await axios.post('/api/sessions', { name: sessionName });
            alert('Session created successfully!');
            setSessionName('');
        } catch (error) {
            console.error(error);
            alert('Failed to create session.');
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <h2>Create Monthly Summary Session</h2>
            <TextField
                label="Session Name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={createSession}>
                Create Session
            </Button>
        </Box>
    );
};

export default AdminPanel;