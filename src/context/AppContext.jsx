// meeting-app/src/context/AppContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Start with loading=true
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/user');
            setUser(response.data.user);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error fetching user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AppContext.Provider value={{ user, setUser, loading, error, fetchUser }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);