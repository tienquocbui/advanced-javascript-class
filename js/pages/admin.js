import { productsAPI, ordersAPI } from '../api/apiService.js';
import { isLoggedIn, getCurrentUser } from '../utils/auth.js';
import { navigateTo } from '../utils/navigation.js';
import { showToast } from '../utils/toast.js';
import { formatCurrency } from '../utils/formatter.js';

export const renderAdminPage = async () => {
    const pageContainer = document.getElementById('page-container');
    
    if (!isLoggedIn()) {
        document.dispatchEvent(new CustomEvent('showLogin'));
        return;
    }
    
    const user = getCurrentUser();
    
    if (!user || user.role !== 'admin') {
        pageContainer.innerHTML = `
            <div class="access-denied">
                <h2>Access Denied</h2>
                <p>You do not have permission to access the admin dashboard.</p>
                <button id="go-home" class="btn btn-primary">Go to Homepage</button>
            </div>
        `;
        
        document.getElementById('go-home').addEventListener('click', () => {
            navigateTo('home');
        });
        
        showToast('Access denied. Admin privileges required.', 'error');
        
        return;
    }
    
    pageContainer.innerHTML = `
        <div class="admin-page">
            <h1>Admin Dashboard</h1>
            
            <div class="admin-nav">
                <button class="admin-nav-item active" data-section="products">Products</button>
                <button class="admin-nav-item" data-section="orders">Orders</button>
                <button class="admin-nav-item" data-section="users">Users</button>
            </div>
            
            <div class="admin-content">
                <div id="products-section" class="admin-section active">
                    <div class="section-header">
                        <h2>Product Management</h2>
                        <button id="add-product" class="btn btn-primary">Add New Product</button>
                    </div>
                    
                    <div class="products-list">
                        <div class="loading-spinner"></div>
                        <p>Loading products...</p>
                    </div>
                </div>
                
                <div id="orders-section" class="admin-section">
                    <div class="section-header">
                        <h2>Order Management</h2>
                    </div>
                    
                    <div class="orders-list">
                        <div class="loading-spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                </div>
                
                <div id="users-section" class="admin-section">
                    <div class="section-header">
                        <h2>User Management</h2>
                    </div>
                    
                    <p>User management functionality is not available in this version.</p>
                </div>
            </div>
        </div>

        <!-- Product Modal -->
        <div id="product-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="product-modal-title">Add New Product</h2>
                    <button id="close-product-modal" class="modal-close">&times;</button>
                </div>
                <form id="product-form" class="product-form">
                    <input type="hidden" id="product-id">
                    <div class="form-group">
                        <label for="product-name">Product Name *</label>
                        <input type="text" id="product-name" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="product-description">Description</label>
                        <textarea id="product-description" name="description"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="product-price">Price *</label>
                        <input type="number" id="product-price" name="price" step="0.01" min="0" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" id="cancel-product" class="btn btn-secondary">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const productForm = document.getElementById('product-form');
    const closeProductModal = document.getElementById('close-product-modal');
    const cancelProduct = document.getElementById('cancel-product');
    
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (productForm.hasAttribute('data-edit-mode')) {
                handleEditProduct(e);
            } else {
                handleAddProduct(e);
            }
        });
    }
    
    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            document.getElementById('product-modal').classList.add('hidden');
        });
    }
    
    if (cancelProduct) {
        cancelProduct.addEventListener('click', () => {
            document.getElementById('product-modal').classList.add('hidden');
        });
    }
    
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            document.querySelectorAll('.admin-nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            document.getElementById(`${section}-section`).classList.add('active');
            item.classList.add('active');
            
            if (section === 'products' && !document.querySelector('.product-table')) {
                loadProducts();
            } else if (section === 'orders' && !document.querySelector('.order-table')) {
                loadOrders();
            }
        });
    });
    
    document.getElementById('add-product').addEventListener('click', () => {
        showAddProductModal();
    });
    
    loadProducts();
};

const loadProducts = async () => {
    const productsList = document.querySelector('.products-list');
    
    try {
        const response = await productsAPI.getAllProducts();
        const products = response.products || [];
        
        if (products.length === 0) {
            productsList.innerHTML = `
                <div class="no-data">
                    <p>No products available.</p>
                </div>
            `;
            return;
        }
        
        productsList.innerHTML = `
            <table class="product-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => `
                        <tr data-id="${product._id}">
                            <td><img src="${product.imageUrl || 'https://via.placeholder.com/50x50?text=No+Image'}" alt="${product.title}" class="product-thumbnail"></td>
                            <td>${product.title}</td>
                            <td>${formatCurrency(product.price)}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary edit-product">Edit</button>
                                <button class="btn btn-sm btn-danger delete-product">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('tr').getAttribute('data-id');
                const product = products.find(p => p._id === productId);
                
                if (product) {
                    showEditProductModal(product);
                }
            });
        });
        
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('tr').getAttribute('data-id');
                const product = products.find(p => p._id === productId);
                
                if (product) {
                    showDeleteConfirmation(product);
                }
            });
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
        
        productsList.innerHTML = `
            <div class="error-message">
                <p>Failed to load products. Please try again later.</p>
                <button class="btn btn-primary retry">Retry</button>
            </div>
        `;
        
        productsList.querySelector('.retry').addEventListener('click', () => {
            loadProducts();
        });
        
        showToast('Failed to load products. Please try again.', 'error');
    }
};

const loadOrders = async () => {
    const ordersList = document.querySelector('.orders-list');
    
    try {
        const response = await ordersAPI.getAllOrders();
        const orders = response.invoices || [];
        
        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="no-data">
                    <p>No orders available.</p>
                </div>
            `;
            return;
        }
        
        ordersList.innerHTML = `
            <table class="order-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr data-id="${order._id}">
                            <td>${order._id.slice(-8)}</td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>${order.user.firstName} ${order.user.lastName}</td>
                            <td>$${order.totalAmount.toFixed(2)}</td>
                            <td><span class="status-badge ${getStatusClass(order.status)}">${order.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-secondary view-order">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.querySelectorAll('.view-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.closest('tr').getAttribute('data-id');
                const order = orders.find(o => o._id === orderId);
                
                if (order) {
                    showOrderDetails(order);
                }
            });
        });
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        
        ordersList.innerHTML = `
            <div class="error-message">
                <p>Failed to load orders. Please try again later.</p>
                <button class="btn btn-primary retry">Retry</button>
            </div>
        `;
        
        // Add retry functionality
        ordersList.querySelector('.retry').addEventListener('click', () => {
            loadOrders();
        });
        
        showToast('Failed to load orders. Please try again.', 'error');
    }
};

const showAddProductModal = () => {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    
    title.textContent = 'Add New Product';
    form.reset();
    form.removeAttribute('data-edit-mode');
    
    modal.classList.remove('hidden');
};

const showEditProductModal = (product) => {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    
    title.textContent = 'Edit Product';
    form.setAttribute('data-edit-mode', 'true');
    
    document.getElementById('product-id').value = product._id;
    document.getElementById('product-name').value = product.title;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    
    modal.classList.remove('hidden');
};

const showDeleteConfirmation = (product) => {
    const modalContent = `
        <div class="modal-header">
            <h2 class="modal-title">Delete Product</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-content">
            <p>Are you sure you want to delete "${product.title}"?</p>
            <p>This action cannot be undone.</p>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                <button type="button" class="btn btn-danger confirm-delete" data-id="${product._id}">Delete</button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
    
    const confirmDeleteBtn = document.querySelector('.confirm-delete');
    const cancelBtn = document.querySelector('.cancel-btn');
    const closeBtn = document.querySelector('.modal-close');
    
    confirmDeleteBtn.addEventListener('click', () => {
        const productId = confirmDeleteBtn.getAttribute('data-id');
        handleDeleteProduct(productId);
    });
    
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
};

const showOrderDetails = (order) => {
    const modalContent = `
        <div class="modal-header">
            <h2 class="modal-title">Order Details</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-content">
            <div class="order-details-header">
                <div>
                    <strong>Order ID:</strong> ${order._id}
                </div>
                <div>
                    <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div>
                    <strong>Customer:</strong> ${order.user.firstName} ${order.user.lastName}
                </div>
                <div>
                    <strong>Email:</strong> ${order.user.email}
                </div>
                <div>
                    <strong>Status:</strong> <span class="status-badge ${getStatusClass(order.status)}">${order.status}</span>
                </div>
            </div>
            
            <h3>Items</h3>
            <table class="order-items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.products.map(item => `
                        <tr>
                            <td>${item.product.title}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.product.price)}</td>
                            <td>${formatCurrency(parseFloat(item.product.price) * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>Total</strong></td>
                        <td><strong>$${order.totalAmount.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary close-btn">Close</button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
    
    const closeBtn = document.querySelector('.close-btn');
    const modalCloseBtn = document.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
};

const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Get form values
    const titleInput = document.getElementById('product-name');
    const descriptionInput = document.getElementById('product-description');
    const priceInput = document.getElementById('product-price');
    
    // Get and validate values
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const price = parseFloat(priceInput.value);

    console.log('Form values:', { title, description, price }); // Debug log

    // Validate required fields
    if (!title || !price || isNaN(price)) {
        showToast('Please fill in all required fields with valid values', 'error');
        return;
    }
    
    const formData = {
        title,
        description,
        price,
        imageUrl: 'https://via.placeholder.com/400x400?text=Product+Image'
    };
    
    try {
        console.log('Sending product data:', formData); // Debug log
        
        // Check if we have a valid token
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please log in to create products', 'error');
            return;
        }
        
        const response = await productsAPI.createProduct(formData);
        console.log('Product creation response:', response); // Debug log
        
        if (response && response.product) {
            showToast('Product created successfully!', 'success');
            document.getElementById('product-modal').classList.add('hidden');
            document.getElementById('product-form').reset();
            loadProducts();
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        const errorMessage = error.message || 'Failed to create product. Please try again.';
        showToast(errorMessage, 'error');
    }
};

const handleEditProduct = async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const title = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);

    // Validate required fields
    if (!title || !price || isNaN(price)) {
        showToast('Please fill in all required fields with valid values', 'error');
        return;
    }
    
    const formData = {
        title,
        description,
        price,
        imageUrl: 'https://via.placeholder.com/400x400?text=Product+Image'
    };
    
    try {
        console.log('Sending product update data:', formData); // Debug log
        const response = await productsAPI.updateProduct(productId, formData);
        console.log('Product update response:', response); // Debug log
        showToast('Product updated successfully!', 'success');
        document.getElementById('product-modal').classList.add('hidden');
        document.getElementById('product-form').reset();
        loadProducts();
    } catch (error) {
        console.error('Error updating product:', error);
        const errorMessage = error.message || 'Failed to update product. Please try again.';
        showToast(errorMessage, 'error');
    }
};

const handleDeleteProduct = async (productId) => {
    
    closeModal();
    
    showToast('Product deleted successfully! (Note: This is a mock implementation)', 'success');
    
    loadProducts();
};

const showModal = (content) => {
    const modalContainer = document.getElementById('modal-container');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    modalContainer.innerHTML = content;
    
    modalContainer.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
    
    modalBackdrop.addEventListener('click', closeModal);
};

const closeModal = () => {
    const modalContainer = document.getElementById('modal-container');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    modalContainer.classList.add('hidden');
    modalBackdrop.classList.add('hidden');
};

const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'status-completed';
        case 'shipped':
            return 'status-shipped';
        case 'processing':
            return 'status-processing';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return 'status-pending';
    }
}; 