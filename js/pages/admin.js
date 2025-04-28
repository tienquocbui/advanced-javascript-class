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
    `;
    
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
    const form = `
        <form id="add-product-form">
            <div class="form-group">
                <label for="product-name" class="form-label">Product Name</label>
                <input type="text" id="product-name" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label for="product-price" class="form-label">Price ($)</label>
                <input type="number" id="product-price" class="form-input" min="0.01" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label for="product-description" class="form-label">Description</label>
                <textarea id="product-description" class="form-input" rows="4" required></textarea>
            </div>
            
            <div class="form-group">
                <label for="product-image" class="form-label">Image URL</label>
                <input type="url" id="product-image" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label for="product-category" class="form-label">Category</label>
                <input type="text" id="product-category" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label for="product-inventory" class="form-label">Inventory</label>
                <input type="number" id="product-inventory" class="form-input" min="0" required>
            </div>
            
            <div class="form-actions">
                <button type="button" id="cancel-product" class="btn btn-secondary">Cancel</button>
                <button type="submit" id="save-product" class="btn btn-primary">Add Product</button>
            </div>
        </form>
    `;
    
    // Update modal title
    const modalTitle = document.getElementById('product-modal').querySelector('.modal-title');
    modalTitle.textContent = 'Add New Product';
    
    // Show the modal with form content
    showModal(form);
    
    // Setup event listeners for the form
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
};

const showEditProductModal = (product) => {
    const form = `
        <form id="edit-product-form" data-id="${product._id}">
            <div class="form-group">
                <label for="product-name" class="form-label">Product Name</label>
                <input type="text" id="product-name" class="form-input" value="${product.title}" required>
            </div>
            
            <div class="form-group">
                <label for="product-price" class="form-label">Price ($)</label>
                <input type="number" id="product-price" class="form-input" min="0.01" step="0.01" value="${product.price}" required>
            </div>
            
            <div class="form-group">
                <label for="product-description" class="form-label">Description</label>
                <textarea id="product-description" class="form-input" rows="4" required>${product.description}</textarea>
            </div>
            
            <div class="form-group">
                <label for="product-image" class="form-label">Image URL</label>
                <input type="url" id="product-image" class="form-input" value="${product.imageUrl}" required>
            </div>
            
            <div class="form-group">
                <label for="product-category" class="form-label">Category</label>
                <input type="text" id="product-category" class="form-input" value="${product.category || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="product-inventory" class="form-label">Inventory</label>
                <input type="number" id="product-inventory" class="form-input" min="0" value="${product.inventory || 0}" required>
            </div>
            
            <div class="form-actions">
                <button type="button" id="cancel-product" class="btn btn-secondary">Cancel</button>
                <button type="submit" id="save-product" class="btn btn-primary">Update Product</button>
            </div>
        </form>
    `;
    
    // Update modal title
    const modalTitle = document.getElementById('product-modal').querySelector('.modal-title');
    modalTitle.textContent = 'Edit Product';
    
    // Show the modal with form content
    showModal(form);
    
    // Set up the event listeners for the form
    const editProductForm = document.getElementById('edit-product-form');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProduct);
    }
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
    
    const title = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const description = document.getElementById('product-description').value;
    const imageUrl = document.getElementById('product-image').value;
    const category = document.getElementById('product-category').value;
    const inventory = document.getElementById('product-inventory').value;
    
    const productData = {
        title,
        price,
        description,
        imageUrl,
        category,
        inventory
    };
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        
        await productsAPI.createProduct(productData);
        
        closeModal();
        
        showToast('Product added successfully!', 'success');
        
        loadProducts();
        
    } catch (error) {
        console.error('Error adding product:', error);
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Product';
        
        showToast(error.message || 'Failed to add product. Please try again.', 'error');
    }
};

const handleEditProduct = async (e) => {
    e.preventDefault();
    
    const productId = e.target.getAttribute('data-id');
    const title = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const description = document.getElementById('product-description').value;
    const imageUrl = document.getElementById('product-image').value;
    const category = document.getElementById('product-category').value;
    const inventory = document.getElementById('product-inventory').value;
    
    const productData = {
        id: productId,
        title,
        price,
        description,
        imageUrl,
        category,
        inventory
    };
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
        
        await productsAPI.updateProduct(productId, productData);
        
        closeModal();
        
        showToast('Product updated successfully!', 'success');
        
        loadProducts();
    } catch (error) {
        console.error('Error updating product:', error);
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Product';
        
        showToast(error.message || 'Failed to update product. Please try again.', 'error');
    }
};

const handleDeleteProduct = async (productId) => {
    
    closeModal();
    
    showToast('Product deleted successfully! (Note: This is a mock implementation)', 'success');
    
    loadProducts();
};

const showModal = (content) => {
    // Get the proper modal elements from the admin.html
    const modalBackdrop = document.getElementById('product-modal');
    const modalContainer = modalBackdrop.querySelector('.modal-container');
    const modalContent = modalBackdrop.querySelector('.modal-content');
    const modalHeader = modalBackdrop.querySelector('.modal-header');
    const modalTitle = modalBackdrop.querySelector('.modal-title');
    
    // Check if we're using the content as a whole modal or just the form content
    if (content.includes('modal-header')) {
        // Parse the content to extract title and body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Extract the title from the modal header
        const titleElement = tempDiv.querySelector('.modal-title');
        if (titleElement) {
            modalTitle.textContent = titleElement.textContent;
        }
        
        // Extract the inner content
        const innerContent = tempDiv.querySelector('.modal-content');
        if (innerContent) {
            modalContent.innerHTML = innerContent.innerHTML;
        }
    } else {
        // Just update the form content directly
        modalContent.innerHTML = content;
    }
    
    // Show the modal
    modalBackdrop.classList.remove('hidden');
    
    // Setup event listeners
    const closeBtn = modalBackdrop.querySelector('.modal-close');
    const cancelBtn = modalBackdrop.querySelector('#cancel-product');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
};

const closeModal = () => {
    const productModal = document.getElementById('product-modal');
    const orderModal = document.getElementById('order-modal');
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    
    // Hide all possible modals
    productModal.classList.add('hidden');
    orderModal.classList.add('hidden');
    confirmDeleteModal.classList.add('hidden');
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