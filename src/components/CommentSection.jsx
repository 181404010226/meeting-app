// src/components/CommentSection.jsx
import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, List, ListItem, ListItemText } from '@mui/material';
import axios from '../services/api';

const CommentSection = ({ sessionId }) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchComments();
        // Optionally set up polling or WebSocket listeners for real-time comments
    }, [sessionId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/sessions/${sessionId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const submitComment = async () => {
        if (comment.trim()) {
            try {
                await axios.post(`/api/sessions/${sessionId}/comments`, { content: comment });
                setComments([...comments, { content: comment, created_at: new Date() }]);
                setComment('');
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <h3>Comments</h3>
            <List>
                {comments.map((c, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={c.content} secondary={new Date(c.created_at).toLocaleString()} />
                    </ListItem>
                ))}
            </List>
            <TextField
                label="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
            />
            <Button variant="contained" color="primary" onClick={submitComment} sx={{ mt: 1 }}>
                Submit Comment
            </Button>
        </Box>
    );
};

export default CommentSection;