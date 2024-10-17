// src/components/ParticipantSummary.jsx
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const ParticipantSummary = ({ participant, onSubmit }) => {
    const [summary, setSummary] = useState('');

    const handleSubmit = () => {
        if (summary.trim()) {
            onSubmit(summary);
            setSummary('');
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <h3>{participant.username}'s Summary</h3>
            <TextField
                label="Your Summary"
                multiline
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
                Submit Summary
            </Button>
        </Box>
    );
};

export default ParticipantSummary;