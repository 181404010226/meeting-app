import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/api';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Add a timestamp to the URL to prevent caching
                const response = await axios.get(`/api/user?t=${new Date().getTime()}`, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    },
                });
                console.log('User API response:', response.data);
                if (response.data && response.data.user) {
                    setUser(response.data.user);
                } else {
                    setError('User data is empty or invalid');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setError(error.message || 'Failed to fetch user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AppContext.Provider value={{ user, setUser }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);