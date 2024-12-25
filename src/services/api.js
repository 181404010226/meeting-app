import axios from 'axios';

export const getBaseUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:8080';
};

const instance = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
});

export default instance;