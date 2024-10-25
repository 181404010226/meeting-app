import React, { useEffect, useState } from 'react';
import ParticipantSummary from './ParticipantSummary';
import ParticipantsList from './ParticipantsList';
import CommentSection from './CommentSection';
import axios, { getBaseUrl } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, AppBar, Toolbar, Typography } from '@mui/material';

const MeetingSession = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [currentParticipant, setCurrentParticipant] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let ws = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        let pingInterval;
        let isComponentMounted = true;

        const handleWebSocketMessage = (event) => {
            try {
                if (!event.data) return;
                const data = JSON.parse(event.data);
                if (!data || !data.type) return;

                switch (data.type) {
                    case 'connected':
                        console.log('Successfully connected to session');
                        break;
                    case 'participantsList':
                        if (Array.isArray(data.participants)) {
                            setParticipants(data.participants);
                        }
                        break;
                    case 'nextParticipant':
                        setCurrentParticipant(data.participant);
                        break;
                    case 'meetingEnded':
                        setCurrentParticipant(null);
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        const connectWebSocket = () => {
            if (!isComponentMounted) return;
            if (ws && ws.readyState === WebSocket.CONNECTING) {
                console.log('WebSocket is already connecting...');
                return;
            }

            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const baseUrl = getBaseUrl().replace(/^https?:\/\//, '');
            const wsUrl = `${protocol}://${baseUrl}/ws/sessions/${sessionId}`;
            
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('WebSocket connected');
                reconnectAttempts = 0;
                ws.send(JSON.stringify({ type: 'joinSession', sessionId }));
                
                pingInterval = setInterval(() => {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    } else {
                        clearInterval(pingInterval);
                    }
                }, 15000);
            };

            ws.addEventListener('message', handleWebSocketMessage);

            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                if (isComponentMounted && reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    setTimeout(connectWebSocket, 3000 * Math.min(reconnectAttempts, 5));
                }
            };

            setSocket(ws);
        };

        connectWebSocket();

        return () => {
            isComponentMounted = false;
            if (pingInterval) {
                clearInterval(pingInterval);
            }
            if (ws) {
                ws.removeEventListener('message', handleWebSocketMessage);
                ws.close();
            }
        };
    }, [sessionId]);

    const submitSummary = async (summary) => {
        try {
            await axios.post(`/api/sessions/${sessionId}/summaries`, { summary });
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'summarySubmitted', sessionId, summary }));
            }
        } catch (error) {
            console.error('Error submitting summary:', error);
        }
    };

    const handleExitMeeting = () => {
        navigate('/');
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6">Meeting Session</Typography>
                    <Button color="inherit" onClick={handleExitMeeting}>
                        Exit Meeting
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ padding: 2 }}>
                <ParticipantsList participants={participants} />
                {currentParticipant ? (
                    <ParticipantSummary participant={currentParticipant} onSubmit={submitSummary} />
                ) : (
                    <Typography variant="h6">Waiting for the next participant...</Typography>
                )}
                <CommentSection sessionId={sessionId} socket={socket} />
            </Box>
        </Box>
    );
};

export default MeetingSession;