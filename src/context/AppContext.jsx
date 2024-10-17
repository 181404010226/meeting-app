import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/user?t=${new Date().getTime()}`, {
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AppContext.Provider value={{ user, setUser, loading, error, fetchUser }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);