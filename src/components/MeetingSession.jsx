// meeting-app/src/components/MeetingSession.jsx
import React, { useEffect, useState } from 'react';
import ParticipantSummary from './ParticipantSummary';
import CommentSection from './CommentSection';
import axios from '../services/api';
import { getBaseUrl } from '../services/api';

const MeetingSession = ({ sessionId }) => {
    const [participants, setParticipants] = useState([]);
    const [currentParticipant, setCurrentParticipant] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(`${protocol}://${getBaseUrl().replace(/^https?:\/\//, '')}/ws/sessions/${sessionId}`);

        ws.onopen = () => {
            console.log('WebSocket connected');
            // Optionally, send a message to join the session
            ws.send(JSON.stringify({ type: 'joinSession', sessionId }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'updateParticipants') {
                setParticipants(data.data);
            } else if (data.type === 'nextParticipant') {
                setCurrentParticipant(data.participant);
            } else if (data.type === 'summarySubmitted') {
                // Handle summary submitted if needed
                console.log('Summary Submitted:', data.summary);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setSocket(ws);

        // Cleanup on unmount
        return () => {
            ws.close();
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