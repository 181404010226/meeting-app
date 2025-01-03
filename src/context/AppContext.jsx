// meeting-app/src/context/AppContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Initial loading state
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        setLoading(true);
        try {
            console.log('Sending request to:', '/api/user'); // 输出请求地址
            const response = await api.get('/api/user');
            console.log('API response:', response); // 输出完整的响应对象
            console.log('Fetched user:', response.data.user);
            setUser(response.data.user);
            setError(null);
        } catch (err) {
            console.error('Error fetching user:', err); // Debug log
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
        <AppContext.Provider value={{ user, setUser, loading, error, fetchUser}}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);