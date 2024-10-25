import React from 'react';
import { Box, Avatar, Tooltip, Typography } from '@mui/material';

const ParticipantsList = ({ participants }) => {
    return (
        <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: 2,
            overflowX: 'auto',
            borderBottom: '1px solid #eee'
        }}>
            <Typography variant="subtitle2" sx={{ minWidth: 'fit-content' }}>
                参与者 ({participants.length}):
            </Typography>
            <Box sx={{ 
                display: 'flex',
                gap: 1,
                flexWrap: 'nowrap'
            }}>
                {participants.map((participant) => (
                    <Tooltip 
                        key={`participant-${participant.id}`}
                        title={`${participant.username}\n加入时间: ${new Date(participant.joinedAt).toLocaleTimeString()}`}
                        arrow
                    >
                        <Avatar
                            src={participant.avatarUrl}
                            alt={participant.username}
                            sx={{ 
                                width: 32, 
                                height: 32,
                                border: '2px solid #fff',
                                boxShadow: '0 0 3px rgba(0,0,0,0.2)'
                            }}
                        />
                    </Tooltip>
                ))}
            </Box>
        </Box>
    );
};

export default ParticipantsList;
