import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add shop domain to requests
api.interceptors.request.use((config) => {
    const urlParams = new URLSearchParams(window.location.search);
    let shop = urlParams.get('shop');

    // Store shop in localStorage for persistence
    if (shop) {
        localStorage.setItem('shopify_shop', shop);
    } else {
        // Fallback to localStorage
        shop = localStorage.getItem('shopify_shop');
    }

    if (shop) {
        config.headers['x-shopify-shop-domain'] = shop;
        config.params = { ...config.params, shop };
    } else {
        console.warn('No shop domain found! API calls may fail.');
    }

    return config;
});

// Products
export const fetchProducts = () => api.get('/api/products');
export const fetchCollections = () => api.get('/api/products/collections');

// Promos
export const fetchPromos = () => api.get('/api/promos');
export const createPromo = (data) => api.post('/api/promos', data);
export const updatePromo = (id, data) => api.put(`/api/promos/${id}`, data);
export const deletePromo = (id) => api.delete(`/api/promos/${id}`);

// Campaigns
export const fetchCampaigns = () => api.get('/api/campaigns');
export const fetchCampaign = (id) => api.get(`/api/campaigns/${id}`);
export const createCampaign = (data) => api.post('/api/campaigns', data);
export const updateCampaign = (id, data) => api.put(`/api/campaigns/${id}`, data);
export const deleteCampaign = (id) => api.delete(`/api/campaigns/${id}`);

// Reviews
export const fetchReviews = () => api.get('/api/reviews');
export const fetchCampaignReviews = (campaignId) =>
    api.get(`/api/reviews/campaign/${campaignId}`);
export const updateReviewStatus = (id, status) =>
    api.patch(`/api/reviews/${id}/status`, { status });

export default api;
