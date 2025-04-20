import { ordersAPI } from '../api/apiService.js';
import { navigateTo } from '../utils/navigation.js';
import { showToast } from '../utils/toast.js';
import { isLoggedIn } from '../utils/auth.js';

export const renderOrdersPage = async () => {
    const pageContainer = document.getElementById('page-container');
    
    if (!isLoggedIn()) {
        document.dispatchEvent(new CustomEvent('showLogin'));
        return;
    }
    
    pageContainer.innerHTML = `
        <div class="orders-page">
            <h1>My Orders</h1>
            <div class="orders-container">
                <div class="loading-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        </div>
    `;
    
    try {
        // Fetch user's orders
        const response = await ordersAPI.getUserOrders();
        const orders = response.invoices || [];
        
        // Check if user has orders
        if (orders.length === 0) {
            pageContainer.querySelector('.orders-container').innerHTML = `
                <div class="no-orders">
                    <p>You haven't placed any orders yet.</p>
                    <button id="browse-products" class="btn btn-primary">Browse Products</button>
                </div>
            `;
            
            document.getElementById('browse-products').addEventListener('click', () => {
                navigateTo('products');
            });
            
            return;
        }
        
        const ordersContainer = pageContainer.querySelector('.orders-container');
        ordersContainer.innerHTML = `
            <div class="orders-list">
                ${orders.map(order => renderOrderItem(order)).join('')}
            </div>
        `;
        
        document.querySelectorAll('.order-details-toggle').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderItem = e.target.closest('.order-item');
                orderItem.classList.toggle('expanded');
                
                const isExpanded = orderItem.classList.contains('expanded');
                button.textContent = isExpanded ? 'Hide Details' : 'View Details';
            });
        });
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        
        pageContainer.querySelector('.orders-container').innerHTML = `
            <div class="error-message">
                <p>Failed to load your orders. Please try again later.</p>
                <button class="btn btn-primary retry">Retry</button>
            </div>
        `;
        
        pageContainer.querySelector('.retry').addEventListener('click', () => {
            renderOrdersPage();
        });
        
        showToast('Failed to load your orders. Please try again.', 'error');
    }
};

const renderOrderItem = (order) => {
    const orderDate = new Date(order.createdAt).toLocaleDateString();
    
    const totalItems = order.products.reduce((total, item) => total + item.quantity, 0);
    
    const statusClass = getStatusClass(order.status);
    
    return `
        <div class="order-item" data-id="${order._id}">
            <div class="order-header">
                <div class="order-info">
                    <div class="order-date">${orderDate}</div>
                    <div class="order-id">Order #${order._id.slice(-8)}</div>
                    <div class="order-status ${statusClass}">${order.status}</div>
                </div>
                <div class="order-summary">
                    <div class="order-total">$${order.totalAmount.toFixed(2)}</div>
                    <div class="order-items-count">${totalItems} item${totalItems !== 1 ? 's' : ''}</div>
                </div>
            </div>
            
            <div class="order-details">
                <h3>Order Items</h3>
                <div class="order-products">
                    ${order.products.map(item => `
                        <div class="order-product">
                            <img class="product-image" src="${item.product.imageUrl || 'https://via.placeholder.com/60x60?text=No+Image'}" alt="${item.product.title}">
                            <div class="product-details">
                                <div class="product-title">${item.product.title}</div>
                                <div class="product-price">$${item.product.price} x ${item.quantity}</div>
                            </div>
                            <div class="product-total">$${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-summary-details">
                    <div class="summary-detail">
                        <span>Subtotal:</span>
                        <span>$${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div class="summary-detail">
                        <span>Shipping:</span>
                        <span>${order.totalAmount >= 50 ? 'Free' : '$10.00'}</span>
                    </div>
                    <div class="summary-detail total">
                        <span>Total:</span>
                        <span>$${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div class="order-actions">
                <button class="btn btn-text order-details-toggle">View Details</button>
            </div>
        </div>
    `;
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