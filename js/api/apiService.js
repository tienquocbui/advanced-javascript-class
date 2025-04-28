// Base URL for all API requests
const BASE_URL = 'https://kelvins-assignment.onrender.com';

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
    
    console.log('Making API request to:', url);
    
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
        credentials: 'omit',
        mode: 'cors'
    };
    
    if (method !== 'GET' && data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        console.log('API Response status:', response.status);
        
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json();
            
            console.log('API Response data:', responseData);
            
            if (!response.ok) {
                throw new Error(responseData.message || 'An error occurred');
            }
            
            return responseData;
        } else {
            if (!response.ok) {
                throw new Error('An error occurred');
            }
            
            const textResponse = await response.text();
            console.log('API Text response:', textResponse);
            return textResponse;
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
        credentials: 'omit', 
        mode: 'cors'
    };
    
    try {
        console.log(`Making ${method} upload request to:`, url);
        console.log('Form data contents:', Array.from(formData.entries()));
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Server response error:', errorMessage);
            throw new Error(errorMessage || `Server returned ${response.status}: ${response.statusText}`);
        }
        
        try {
            return await response.json();
        } catch (e) {
            return { success: true, message: 'Operation completed successfully' };
        }
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
    updateUserProfile: (formData) => uploadRequest('/api/users/profile', formData, true, 'POST')
};

// Products
export const productsAPI = {
    getAllProducts: () => apiRequest('/api/products'),
    getProductById: (id) => apiRequest(`/api/products/${id}`),
    createProduct: (productData) => uploadRequest('/api/products/create', productData, true, 'POST'),
    updateProduct: (id, productData) => uploadRequest(`/api/products/update/${id}`, productData, true, 'PUT')
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