import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import ParticipantSummary from './ParticipantSummary';
import CommentSection from './CommentSection';
import axios from '../services/api';
import { getBaseUrl } from '../services/api';

const socket = io(getBaseUrl()); // 使用 getBaseUrl 函数获取正确的 URL

const MeetingSession = ({ sessionId }) => {
    const [participants, setParticipants] = useState([]);
    const [currentParticipant, setCurrentParticipant] = useState(null);

    useEffect(() => {
        socket.emit('joinSession', sessionId);

        socket.on('updateParticipants', (data) => {
            setParticipants(data);
        });

        socket.on('nextParticipant', (participant) => {
            setCurrentParticipant(participant);
        });

        return () => {
            socket.disconnect();
        };
    }, [sessionId]);

    const submitSummary = async (summary) => {
        await axios.post(`/api/sessions/${sessionId}/summaries`, { summary });
        socket.emit('summarySubmitted', { sessionId, summary });
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