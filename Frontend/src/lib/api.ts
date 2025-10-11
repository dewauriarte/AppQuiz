import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token and AI API keys
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add AI provider API keys if available (for AI endpoints)
  const claudeKey = localStorage.getItem('ANTHROPIC_API_KEY');
  const geminiKey = localStorage.getItem('GOOGLE_AI_API_KEY');
  const openaiKey = localStorage.getItem('OPENAI_API_KEY');

  if (claudeKey) {
    config.headers['X-Anthropic-Key'] = claudeKey;
  }
  if (geminiKey) {
    config.headers['X-Google-AI-Key'] = geminiKey;
  }
  if (openaiKey) {
    config.headers['X-OpenAI-Key'] = openaiKey;
  }

  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // TODO: Implement token refresh endpoint
          // const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          // localStorage.setItem('accessToken', data.accessToken);
          // originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          // return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

