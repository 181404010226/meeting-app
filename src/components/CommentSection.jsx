import React, { useEffect, useState } from 'react';
import { 
    TextField, 
    Button, 
    Box, 
    List, 
    ListItem, 
    ListItemText,
    CircularProgress,
    Typography,
    Rating
} from '@mui/material';
import axios from '../services/api';

const CommentSection = ({ sessionId, socket }) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [stars, setStars] = useState(null); // 新增状态
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchComments();

        // 不再直接设置 socket.onmessage
        const handleWebSocketMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'newComment') {
                    setComments(prevComments => [...prevComments, data.comment]);
                }
            } catch (err) {
                console.error('Error parsing WebSocket message:', err);
            }
        };

        if (socket) {
            socket.addEventListener('message', handleWebSocketMessage);
        }

        return () => {
            if (socket) {
                socket.removeEventListener('message', handleWebSocketMessage);
            }
        };
    }, [sessionId, socket]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/sessions/${sessionId}/comments`);
            setComments(response.data || []);
            setError(null);
        } catch (error) {
            console.error(error);
            setComments([]);
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const submitComment = async () => {
        if (comment.trim() && stars !== null) {
            try {
                await axios.post(`/api/sessions/${sessionId}/comments`, { content: comment, stars });
                setComment('');
                setStars(null);
                // 新评论将通过 WebSocket 自动添加
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
                                primary={`${c.content} (${c.stars}星)`} 
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
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Rating
                    name="stars"
                    value={stars}
                    onChange={(event, newValue) => {
                        setStars(newValue);
                    }}
                    max={10}
                />
                <Typography sx={{ ml: 2 }}>{stars !== null ? `${stars} 星` : '请选择星数'}</Typography>
            </Box>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={submitComment} 
                sx={{ mt: 1 }}
                disabled={!comment.trim() || stars === null}
            >
                Submit Comment
            </Button>
        </Box>
    );
};

export default CommentSection;