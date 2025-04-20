// Base URL for all API requests
const BASE_URL = '';

/**
 * Generic function to make API requests
 * @param {string} endpoint
 * @param {string} method
 * @param {object} data
 * @param {boolean} requiresAuth 
 * @returns {Promise<any>} 
 */
const apiRequest = async (endpoint, method = 'GET', data = null, requiresAuth = false) => {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required but token not found');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers,
        credentials: 'omit'
    };
    
    if (method !== 'GET' && data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || 'An error occurred');
            }
            
            return responseData;
        } else {
            if (!response.ok) {
                throw new Error('An error occurred');
            }
            
            return await response.text();
        }
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

/**
 * Handle multipart/form-data requests (for file uploads)
 * @param {string} endpoint
 * @param {FormData} formData 
 * @param {boolean} requiresAuth
 * @param {string} method
 * @returns {Promise<any>} 
 */
const uploadRequest = async (endpoint, formData, requiresAuth = true, method = 'POST') => {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = {};
    
    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required but token not found');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Setup request options
    const options = {
        method,
        headers,
        body: formData,
        credentials: 'omit'
    };
    
    try {
        console.log(`Making ${method} upload request to:`, url);
        const response = await fetch(url, options);
        
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            const text = await response.text();
            console.log('Non-JSON response:', text);
            responseData = { message: text };
        }
        
        if (!response.ok) {
            throw new Error(responseData.message || 'An error occurred');
        }
        
        return responseData;
    } catch (error) {
        console.error('Upload Request Error:', error);
        throw error;
    }
};

// Auth API
export const authAPI = {
    signup: (userData) => apiRequest('/api/users/signup', 'POST', userData),
    login: (credentials) => apiRequest('/api/users/login', 'POST', credentials),
    getUserProfile: () => apiRequest('/api/users/userProfile', 'GET', null, true),
    updateUserProfile: (formData) => uploadRequest('/api/users/userUpdate', formData, true, 'PUT')
};

// Products
export const productsAPI = {
    getAllProducts: () => apiRequest('/api/products'),
    getProductById: (id) => apiRequest(`/api/products/${id}`),
    createProduct: (productData) => apiRequest('/api/products/create', 'POST', productData, true)
};

export const ordersAPI = {
    createOrder: (orderData) => apiRequest('/api/invoices', 'POST', orderData, true),
    getUserOrders: () => apiRequest('/api/invoices', 'GET', null, true),
    getAllOrders: () => apiRequest('/api/invoices/all', 'GET', null, true)
};

export default {
    authAPI,
    productsAPI,
    ordersAPI
}; 