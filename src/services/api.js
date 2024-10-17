import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.REACT_APP_API_ENV === 'local') {
    return 'http://localhost:8080'; // 假设本地 API 运行在 8080 端口
  } else {
    return process.env.REACT_APP_API_URL; // 远程 API URL
  }
};

const instance = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
});

export default instance;