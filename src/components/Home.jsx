import React from 'react';
import { getBaseUrl } from '../services/api';
import { Link } from 'react-router-dom';
import { Button, Box, Avatar, Typography, AppBar, Toolbar } from '@mui/material';
import { useAppContext } from '../context/AppContext';

const Home = () => {
    const { user } = useAppContext();

    return (
        <Box>
            <AppBar position="static">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6">Meeting App</Typography>
                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ mr: 2 }}>{user.name}</Typography>
                            <Avatar src={user.avatar_url} alt={user.name} />
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Box sx={{ padding: 4, textAlign: 'center' }}>
                <h1>Welcome to the Meeting App</h1>
                {user ? (
                    <Box sx={{ mt: 4 }}>
                        <Button variant="contained" color="primary" component={Link} to="/admin" sx={{ mr: 2 }}>
                            Admin Panel
                        </Button>
                        <Button variant="contained" color="secondary" component={Link} to="/meeting">
                            Join Meeting
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ mt: 4 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            href={`${getBaseUrl()}/login`}
                        >
                            Login with GitHub
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Home;