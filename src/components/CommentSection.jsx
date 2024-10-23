// src/components/CommentSection.jsx
import React, { useEffect, useState } from 'react';
import { 
    TextField, 
    Button, 
    Box, 
    List, 
    ListItem, 
    ListItemText,
    CircularProgress,
    Typography 
} from '@mui/material';
import axios from '../services/api';

const CommentSection = ({ sessionId }) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchComments();
    }, [sessionId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/sessions/${sessionId}/comments`);
            setComments(response.data || []); // 确保始终是数组
            setError(null);
        } catch (error) {
            console.error(error);
            setComments([]); // 出错时设置为空数组
            setError('Failed to load comments');
        } finally {
            setLoading(false);
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
                setError('Failed to submit comment');
            }
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <h3>Comments</h3>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
            ) : (
                <List>
                    {comments && comments.map((c, index) => (
                        <ListItem key={index}>
                            <ListItemText 
                                primary={c.content} 
                                secondary={new Date(c.created_at).toLocaleString()} 
                            />
                        </ListItem>
                    ))}
                </List>
            )}
            <TextField
                label="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
            />
            <Button 
                variant="contained" 
                color="primary" 
                onClick={submitComment} 
                sx={{ mt: 1 }}
                disabled={!comment.trim()}
            >
                Submit Comment
            </Button>
        </Box>
    );
};

export default CommentSection;