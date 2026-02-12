import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Make sure backend is running on port 5000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a response interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
