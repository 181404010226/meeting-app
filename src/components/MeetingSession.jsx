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
        let pingInterval;
        let pongTimeout;
        let isComponentMounted = true;

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
                
                // 修改 ping 间隔为 30 秒
                if (pingInterval) clearInterval(pingInterval);
                pingInterval = setInterval(() => {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                        
                        // 设置 pong 超时检查
                        if (pongTimeout) clearTimeout(pongTimeout);
                        pongTimeout = setTimeout(() => {
                            console.log('Pong timeout - reconnecting...');
                            ws.close();
                        }, 10000); // 10 秒内没收到 pong 就重连
                    }
                }, 30000); // 30 秒发送一次 ping
            };

            // 添加 pong 消息处理
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'pong') {
                        if (pongTimeout) clearTimeout(pongTimeout);
                        return;
                    }
                    handleWebSocketMessage(event);
                } catch (error) {
                    console.error('Error handling message:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                clearInterval(pingInterval);
                clearTimeout(pongTimeout);
                
                if (isComponentMounted && reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    setTimeout(connectWebSocket, 3000 * Math.min(reconnectAttempts, 5));
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                ws.close();
            };

            setSocket(ws);
        };

        connectWebSocket();

        return () => {
            isComponentMounted = false;
            if (pingInterval) clearInterval(pingInterval);
            if (pongTimeout) clearTimeout(pongTimeout);
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