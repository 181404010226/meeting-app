// meeting-app/src/components/MeetingSession.jsx
import React, { useEffect, useState } from 'react';
import ParticipantSummary from './ParticipantSummary';
import ParticipantsList from './ParticipantsList';
import CommentSection from './CommentSection';
import axios from '../services/api';
import { getBaseUrl } from '../services/api';
import { useParams } from 'react-router-dom';


const MeetingSession = () => {
    const { sessionId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [currentParticipant, setCurrentParticipant] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let ws = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        let pingInterval;
        let isComponentMounted = true; // 添加组件挂载状态标志
        
        const connectWebSocket = () => {
            if (!isComponentMounted) return; // 如果组件已卸载，不要继续连接
            if (ws && ws.readyState === WebSocket.CONNECTING) {
                console.log('WebSocket is already connecting...');
                return;
            }
            
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const baseUrl = getBaseUrl().replace(/^https?:\/\//, '');
            const wsUrl = `${protocol}://${baseUrl}/ws/sessions/${sessionId}`;
            console.log('Connecting to WebSocket:', wsUrl);
            
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('WebSocket connected');
                reconnectAttempts = 0;
                ws.send(JSON.stringify({ type: 'joinSession', sessionId }));
                
                // 添加定时发送心跳的功能
                pingInterval = setInterval(() => {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    } else {
                        clearInterval(pingInterval);
                    }
                }, 15000);
            };

            ws.onmessage = (event) => {
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
                            console.log('Received unknown message type:', data.type);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
    
            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                if (isComponentMounted && reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
                    setTimeout(connectWebSocket, 3000 * Math.min(reconnectAttempts, 5));
                }
            };
    
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
    
            setSocket(ws);
        };
    
        connectWebSocket();
    
        return () => {
            isComponentMounted = false; // 组件卸载时设置标志
            if (pingInterval) {
                clearInterval(pingInterval);
            }
            if (ws) {
                ws.onclose = null;
                ws.onerror = null;
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

    return (
        <div>
            <h2>Meeting Session</h2>
            <ParticipantsList participants={participants} />
            {currentParticipant ? (
                <ParticipantSummary participant={currentParticipant} onSubmit={submitSummary} />
            ) : (
                <p>Waiting for the next participant...</p>
            )}
            <CommentSection sessionId={sessionId} />
        </div>
    );
};

export default MeetingSession;
