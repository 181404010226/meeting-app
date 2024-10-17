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
                console.log('Fetching user data...');
                const response = await axios.get(`/api/user`, {
                    params: { t: new Date().getTime() }, // 使用 params 添加时间戳
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    },
                    // 关闭浏览器缓存
                    // 注意：Axios 会自动处理缓存问题，但明确指定也无妨
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

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <AppContext.Provider value={{ user, setUser, error }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);