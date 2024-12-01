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

    // 添加 WebSocket 消息处理函数
    const handleWebSocketMessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'participantsList':
                    setParticipants(data.participants);
                    break;
                case 'nextParticipant':
                    setCurrentParticipant(data.participant);
                    break;
                case 'summarySubmitted':
                    // 处理总结提交后的更新
                    if (data.sessionId === sessionId) {
                        setCurrentParticipant(null);
                    }
                    break;
                case 'meetingEnded':
                    navigate('/');
                    break;
                default:
                    console.log('Unhandled message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    };

    useEffect(() => {
        let ws = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const reconnectDelay = 3000; // 3秒重连延迟
        let isComponentMounted = true;

        const connectWebSocket = () => {
            if (!isComponentMounted) return;
            if (socket && socket.readyState === WebSocket.CONNECTING) {
                console.log('WebSocket is already connecting...');
                return;
            }

            // 获取当前环境的WebSocket URL
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsHost = process.env.FRONTEND_URL
                ? new URL(process.env.FRONTEND_URL).host
                : window.location.host;
            
            const wsUrl = `${wsProtocol}//${wsHost}/ws/sessions/${sessionId}`;
            console.log('Attempting to connect to WebSocket URL:', wsUrl);
            
            try {
                ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log('WebSocket connected successfully');
                    reconnectAttempts = 0; // 重置重连次数
                    setSocket(ws);
                    ws.send(JSON.stringify({ type: 'joinSession', sessionId }));
                };

                ws.onclose = (event) => {
                    console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
                    setSocket(null);
                    
                    if (isComponentMounted && reconnectAttempts < maxReconnectAttempts) {
                        reconnectAttempts++;
                        console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
                        setTimeout(connectWebSocket, reconnectDelay);
                    } else if (reconnectAttempts >= maxReconnectAttempts) {
                        console.error('Max reconnection attempts reached');
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error occurred:', error);
                    // 可以在这里添加用户提示
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                };

                ws.onmessage = handleWebSocketMessage;
            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                if (isComponentMounted && reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    setTimeout(connectWebSocket, reconnectDelay);
                }
            }
        };

        connectWebSocket();

        return () => {
            isComponentMounted = false;
            if (ws) {
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