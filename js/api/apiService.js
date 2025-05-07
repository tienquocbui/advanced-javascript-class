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
    console.log('Request method:', method);
    console.log('Request data:', data);
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required but token not found');
        }
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Auth token present:', !!token);
    }
    
    const options = {
        method,
        headers,
        credentials: 'omit',
        mode: 'cors'
    };
    
    if (method !== 'GET' && data) {
        // Ensure data is properly formatted
        const requestData = {
            title: data.title,
            price: Number(data.price),
            description: data.description || '',
            imageUrl: data.imageUrl || 'https://via.placeholder.com/400x400?text=Product+Image'
        };
        options.body = JSON.stringify(requestData);
        console.log('Request body:', options.body);
    }
    
    try {
        console.log('Sending request with options:', options);
        const response = await fetch(url, options);
        
        console.log('API Response status:', response.status);
        console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
        
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
    updateUserProfile: (formData) => uploadRequest('/api/users/userUpdate', formData, true, 'POST')
};

// Products
export const productsAPI = {
    async getAllProducts() {
        return apiRequest('/api/products', 'GET');
    },
    
    async getProductById(id) {
        return apiRequest(`/api/products/${id}`, 'GET');
    },
    
    async createProduct(data) {
        console.log('Creating product with data:', data);
        
        // Ensure data is properly formatted
        const productData = {
            title: data.title,
            price: Number(data.price),
            description: data.description || '',
            imageUrl: data.imageUrl || 'https://via.placeholder.com/400x400?text=Product+Image'
        };
        
        console.log('Formatted product data:', productData);
        return apiRequest('/api/products/create', 'POST', productData, true);
    },
    
    async updateProduct(id, data) {
        // Ensure data is properly formatted
        const productData = {
            title: data.title,
            price: Number(data.price),
            description: data.description || '',
            imageUrl: data.imageUrl || 'https://via.placeholder.com/400x400?text=Product+Image'
        };
        
        return apiRequest(`/api/products/${id}`, 'PUT', productData, true);
    },
    
    async deleteProduct(id) {
        return apiRequest(`/api/products/${id}`, 'DELETE', null, true);
    }
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