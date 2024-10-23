// meeting-app/src/components/MeetingSession.jsx
import React, { useEffect, useState } from 'react';
import ParticipantSummary from './ParticipantSummary';
import CommentSection from './CommentSection';
import axios from '../services/api';
import { getBaseUrl } from '../services/api';
import { useParams } from 'react-router-dom';


const MeetingSession = () => {
    const { sessionId } = useParams();  // 从 URL 参数中获取 sessionId
    const [participants, setParticipants] = useState([]);
    const [currentParticipant, setCurrentParticipant] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let ws = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        
        const connectWebSocket = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            ws = new WebSocket(`${protocol}://${getBaseUrl().replace(/^https?:\/\//, '')}/ws/sessions/${sessionId}`);
    
            ws.onopen = () => {
                console.log('WebSocket connected');
                reconnectAttempts = 0;
                ws.send(JSON.stringify({ type: 'joinSession', sessionId }));
            };
    
            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                if (reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++;
                    console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
                    setTimeout(connectWebSocket, 3000 * reconnectAttempts);
                }
            };
    
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
    
            setSocket(ws);
        };
    
        connectWebSocket();
    
        return () => {
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

    return (
        <div>
            <h2>Meeting Session</h2>
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