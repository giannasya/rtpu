import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000',
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding Authorization header:', config.headers.Authorization);
    } else {
      console.log('No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (
      error.response?.status === 401 ||
      (error.response?.status === 403 && error.config?.url !== '/users/me')
    ) {
      console.log('Unauthorized or Forbidden, clearing localStorage for URL:', error.config?.url);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('user-updated'));
    }
    return Promise.reject(error);
  }
);

export default instance;