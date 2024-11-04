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
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        fetchComments();

        // 不再直接设置 socket.onmessage
        const handleWebSocketMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'newComment') {
                    const newComment = {
                        ...data.comment,
                        created_at: new Date(data.comment.created_at),
                    };
                    setComments(prevComments => [...prevComments, newComment]);
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
            const formattedComments = response.data.map(comment => ({
                ...comment,
                created_at: new Date(comment.created_at)
            }));
            console.log('Formatted comments:', formattedComments);
            setComments(formattedComments);
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
        if (comment.trim() && stars !== null && !isSubmitting) {
            setIsSubmitting(true);
            try {
                const response = await axios.post(`/api/sessions/${sessionId}/comments`, {
                    content: comment,
                    stars: stars
                });
                
                if (response.data.success) {
                    setComment('');
                    setStars(null);
                }
            } catch (error) {
                console.error('Error submitting comment:', error);
                setError(error.response?.data || 'Failed to submit comment');
            } finally {
                setIsSubmitting(false);
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
                        <ListItem key={index} alignItems="flex-start">
                            <Box
                                component="img"
                                src={c.avatar_url || '/default-avatar.png'}
                                alt="user avatar"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    mr: 2
                                }}
                            />
                            <ListItemText 
                                primary={
                                    <Box>
                                        <Typography
                                            component="span"
                                            variant="subtitle2"
                                            sx={{ fontWeight: 'bold', mr: 1 }}
                                        >
                                        {c.username || 'Anonymous'}  {/* 直接使用 username */}
                                        </Typography>
                                        <Rating value={c.stars} readOnly max={10} size="small" />
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                            sx={{ display: 'block', my: 1 }}
                                        >
                                            {c.content}
                                        </Typography>
                                        <Typography
                                            component="span"
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {new Date(c.created_at).toLocaleString()}
                                        </Typography>
                                    </>
                                }
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
                disabled={!comment.trim() || stars === null || isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </Button>
        </Box>
    );
};

export default CommentSection;