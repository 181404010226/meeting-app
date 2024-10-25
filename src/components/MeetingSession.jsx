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
        
        const connectWebSocket = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            ws = new WebSocket(`${protocol}://${getBaseUrl().replace(/^https?:\/\//, '')}/ws/sessions/${sessionId}`);
    
            ws.onopen = () => {
                console.log('WebSocket connected');
                reconnectAttempts = 0;
                ws.send(JSON.stringify({ type: 'joinSession', sessionId }));
            };

            ws.onmessage = (event) => {
                try {
                    if (!event.data) return;
                    const data = JSON.parse(event.data);
                    if (!data || !data.type) return;

                    switch (data.type) {
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
                if (reconnectAttempts < maxReconnectAttempts) {
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
