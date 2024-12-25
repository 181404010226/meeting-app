import React, { useState, useEffect } from 'react';
import { Box, Paper, TextField, Typography, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MinutesEditor = ({ sessionId }) => {
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMinutes = async () => {
            try {
                const response = await axios.get(`/api/sessions/${sessionId}/minutes`);
                setContent(response.data.content || '');
            } catch (error) {
                console.error('Error fetching minutes:', error);
            }
        };

        fetchMinutes();
    }, [sessionId]);

    const handleContentChange = (event) => {
        setContent(event.target.value);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/sessions/${sessionId}/minutes`, { content });
        } catch (error) {
            console.error('Error saving minutes:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate(`/meeting/${sessionId}`); 
    };

    return (
        <Box sx={{ p: 3, maxWidth: '800px', margin: '0 auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">会议纪要</Typography>
                <Box>
                    <Button 
                        variant="outlined" 
                        onClick={handleBack} 
                        sx={{ mr: 2 }}
                    >
                        返回会议
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '保存中...' : '保存'}
                    </Button>
                </Box>
            </Box>
            <Paper elevation={3} sx={{ p: 2 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={20}
                    value={content}
                    onChange={handleContentChange}
                    variant="outlined"
                    placeholder="在此输入会议纪要..."
                />
            </Paper>
        </Box>
    );
};

export default MinutesEditor; 