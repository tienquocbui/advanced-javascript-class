import { getCart, getCartTotal, clearCart } from '../utils/cart.js';
import { isLoggedIn, getCurrentUser } from '../utils/auth.js';
import { navigateTo } from '../utils/navigation.js';
import { ordersAPI } from '../api/apiService.js';
import { showToast } from '../utils/toast.js';

export const renderCheckoutPage = () => {
    const pageContainer = document.getElementById('page-container');
    
    const cart = getCart();
    
    if (cart.length === 0) {
        pageContainer.innerHTML = `
            <div class="empty-cart-message">
                <h2>Your cart is empty</h2>
                <p>Add some products to your cart before proceeding to checkout.</p>
                <button id="continue-shopping" class="btn btn-primary">Continue Shopping</button>
            </div>
        `;
        
        document.getElementById('continue-shopping').addEventListener('click', () => {
            navigateTo('products');
        });
        
        return;
    }
    
    if (!isLoggedIn()) {
        pageContainer.innerHTML = `
            <div class="checkout-login-required">
                <h2>Login Required</h2>
                <p>Please login or create an account to complete your purchase.</p>
                <div class="checkout-login-buttons">
                    <button id="checkout-login" class="btn btn-primary">Login</button>
                    <button id="checkout-signup" class="btn btn-secondary">Create Account</button>
                </div>
            </div>
        `;
        
        document.getElementById('checkout-login').addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('showLogin'));
        });
        
        document.getElementById('checkout-signup').addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('showSignup'));
        });
        
        return;
    }
    
    const user = getCurrentUser();
    
    const subtotal = getCartTotal();
    const shipping = subtotal > 50 ? 0 : 10;
    const total = (parseFloat(subtotal) + shipping).toFixed(2);
    
    // Render checkout page
    pageContainer.innerHTML = `
        <div class="checkout-page">
            <h1>Checkout</h1>
            
            <div class="checkout-content">
                <div class="checkout-details">
                    <div class="checkout-section">
                        <h2>Shipping Information</h2>
                        <form id="shipping-form">
                            <div class="form-group">
                                <label for="fullName" class="form-label">Full Name</label>
                                <input type="text" id="fullName" class="form-input" value="${user.firstName} ${user.lastName}" required>
                            </div>
                            <div class="form-group">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" id="email" class="form-input" value="${user.email}" required>
                            </div>
                            <div class="form-group">
                                <label for="address" class="form-label">Address</label>
                                <input type="text" id="address" class="form-input" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="city" class="form-label">City</label>
                                    <input type="text" id="city" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label for="zip" class="form-label">Zip Code</label>
                                    <input type="text" id="zip" class="form-input" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="country" class="form-label">Country</label>
                                <select id="country" class="form-input" required>
                                    <option value="">Select Country</option>
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="FR">France</option>
                                    <option value="DE">Germany</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    
                    <div class="checkout-section">
                        <h2>Payment Information</h2>
                        <form id="payment-form">
                            <div class="form-group">
                                <label for="cardName" class="form-label">Name on Card</label>
                                <input type="text" id="cardName" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label for="cardNumber" class="form-label">Card Number</label>
                                <input type="text" id="cardNumber" class="form-input" placeholder="XXXX XXXX XXXX XXXX" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="expDate" class="form-label">Expiration Date</label>
                                    <input type="text" id="expDate" class="form-input" placeholder="MM/YY" required>
                                </div>
                                <div class="form-group">
                                    <label for="cvv" class="form-label">CVV</label>
                                    <input type="text" id="cvv" class="form-input" placeholder="123" required>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="checkout-summary">
                    <h2>Order Summary</h2>
                    <div class="cart-items">
                        ${cart.map(item => `
                            <div class="cart-item">
                                <img class="cart-item-image" src="${item.product.imageUrl || 'https://via.placeholder.com/60x60?text=No+Image'}" alt="${item.product.title}">
                                <div class="cart-item-details">
                                    <div class="cart-item-title">${item.product.title}</div>
                                    <div class="cart-item-price">$${item.product.price} x ${item.quantity}</div>
                                </div>
                                <div class="cart-item-total">$${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-summary">
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span>$${subtotal}</span>
                        </div>
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>$${total}</span>
                        </div>
                    </div>
                    
                    <button id="place-order" class="btn btn-primary">Place Order</button>
                    <button id="back-to-cart" class="btn btn-secondary">Back to Cart</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('place-order').addEventListener('click', handlePlaceOrder);
    document.getElementById('back-to-cart').addEventListener('click', () => {
        navigateTo('products');
    });
};

const handlePlaceOrder = async () => {
    const shippingForm = document.getElementById('shipping-form');
    const paymentForm = document.getElementById('payment-form');
    
    if (!shippingForm.checkValidity() || !paymentForm.checkValidity()) {
        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
        } else {
            paymentForm.reportValidity();
        }
        return;
    }
    
    const cart = getCart();
    const total = parseFloat(getCartTotal());
    
    const orderItems = cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity
    }));
    
    const orderData = {
        products: orderItems,
        totalAmount: total
    };
    
    try {
        const placeOrderButton = document.getElementById('place-order');
        placeOrderButton.disabled = true;
        placeOrderButton.textContent = 'Processing...';
        
        const response = await ordersAPI.createOrder(orderData);
        
        clearCart();
        
        showToast('Order placed successfully!', 'success');
        
        displayOrderConfirmation(response.invoice);
        
    } catch (error) {
        console.error('Error placing order:', error);
        
        const placeOrderButton = document.getElementById('place-order');
        placeOrderButton.disabled = false;
        placeOrderButton.textContent = 'Place Order';
        
        showToast(error.message || 'Failed to place order. Please try again.', 'error');
    }
};

const displayOrderConfirmation = (order) => {
    const pageContainer = document.getElementById('page-container');
    
    pageContainer.innerHTML = `
        <div class="order-confirmation">
            <div class="confirmation-header">
                <i class="fas fa-check-circle"></i>
                <h1>Order Confirmed!</h1>
                <p>Thank you for your purchase. Your order has been successfully placed.</p>
            </div>
            
            <div class="order-details">
                <h2>Order Details</h2>
                <div class="detail-row">
                    <span>Order ID:</span>
                    <span>${order._id}</span>
                </div>
                <div class="detail-row">
                    <span>Date:</span>
                    <span>${new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span>Total:</span>
                    <span>$${order.totalAmount.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span>Status:</span>
                    <span class="order-status">${order.status}</span>
                </div>
            </div>
            
            <div class="confirmation-actions">
                <button id="view-orders" class="btn btn-primary">View My Orders</button>
                <button id="continue-shopping" class="btn btn-secondary">Continue Shopping</button>
            </div>
        </div>
    `;
    
    document.getElementById('view-orders').addEventListener('click', () => {
        navigateTo('orders');
    });
    
    document.getElementById('continue-shopping').addEventListener('click', () => {
        navigateTo('products');
    });
}; 