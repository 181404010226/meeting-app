import axios from 'axios';

export const getBaseUrl = () => {
  return '';
};

const instance = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
});

export default instance;