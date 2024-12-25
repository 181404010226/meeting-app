import axios from 'axios';

export const getBaseUrl = () => {
    return ''; // 必须保持为空才能到首页
};

const instance = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
});

export default instance;