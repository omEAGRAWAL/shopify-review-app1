import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get campaign by public URL
export const getCampaign = (publicUrl) =>
    api.get(`/api/campaigns/public/${publicUrl}`);

// Submit review
export const submitReview = (data) =>
    api.post('/api/reviews/submit', data);

export default api;
