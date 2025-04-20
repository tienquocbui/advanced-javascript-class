import { showToast } from './toast.js';

let cart = [];
let cartDropdownVisible = false;

export const initCart = () => {
    loadCart();
    
    const cartToggle = document.getElementById('cart-toggle');
    cartToggle.addEventListener('click', toggleCartDropdown);
    
    updateCartCount();
    
    document.addEventListener('click', (event) => {
        if (cartDropdownVisible && !event.target.closest('#cart-toggle') && !event.target.closest('.cart-dropdown')) {
            hideCartDropdown();
        }
    });
};

const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error parsing cart from localStorage:', error);
            cart = [];
        }
    }
};

const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

export const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            product,
            quantity
        });
    }
    
    saveCart();
    updateCartCount();
    
    showToast(`${product.title} added to cart!`, 'success');
    
    if (cartDropdownVisible) {
        renderCartDropdown();
    }
};

export const removeFromCart = (productId) => {
    const itemIndex = cart.findIndex(item => item.product._id === productId);
    
    if (itemIndex !== -1) {
        const removedItem = cart[itemIndex];
        // Remove item from cart
        cart.splice(itemIndex, 1);
        
        // Save cart and update UI
        saveCart();
        updateCartCount();
        
        // Show toast notification
        showToast(`${removedItem.product.title} removed from cart.`, 'info');
        
        if (cartDropdownVisible) {
            renderCartDropdown();
        }
    }
};

export const updateCartItemQuantity = (productId, quantity) => {
    const item = cart.find(item => item.product._id === productId);
    
    if (item) {
        item.quantity = quantity;
        
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        
        saveCart();
        
        if (cartDropdownVisible) {
            renderCartDropdown();
        }
    }
};

export const getCartTotal = () => {
    return cart.reduce((total, item) => {
        return total + (parseFloat(item.product.price) * item.quantity);
    }, 0).toFixed(2);
};

export const getCart = () => {
    return [...cart];
};

export const clearCart = () => {
    cart = [];
    saveCart();
    updateCartCount();
    
    showToast('Cart has been cleared.', 'info');
    
    if (cartDropdownVisible) {
        renderCartDropdown();
    }
};

const updateCartCount = () => {
    const cartCount = document.getElementById('cart-count');
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    
    cartCount.textContent = itemCount;
    
    if (itemCount === 0) {
        cartCount.style.display = 'none';
    } else {
        cartCount.style.display = 'flex';
    }
};

const toggleCartDropdown = () => {
    if (cartDropdownVisible) {
        hideCartDropdown();
    } else {
        showCartDropdown();
    }
};

const showCartDropdown = () => {
    let dropdown = document.querySelector('.cart-dropdown');
    
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'cart-dropdown';
        document.body.appendChild(dropdown);
    }
    
    renderCartDropdown();
    
    dropdown.style.display = 'block';
    cartDropdownVisible = true;
};

const hideCartDropdown = () => {
    const dropdown = document.querySelector('.cart-dropdown');
    
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    cartDropdownVisible = false;
};

const renderCartDropdown = () => {
    const dropdown = document.querySelector('.cart-dropdown');
    
    if (!dropdown) return;
    
    if (cart.length === 0) {
        dropdown.innerHTML = `
            <div class="cart-empty">
                <p>Your cart is empty</p>
                <button class="btn btn-primary continue-shopping">Continue Shopping</button>
            </div>
        `;
        
        const continueButton = dropdown.querySelector('.continue-shopping');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                hideCartDropdown();
            });
        }
    } else {
        const itemsHtml = cart.map(item => `
            <div class="cart-item" data-id="${item.product._id}">
                <img class="cart-item-image" src="${item.product.imageUrl}" alt="${item.product.title}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.product.title}</div>
                    <div class="cart-item-price">$${item.product.price}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-decrease">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="quantity-increase">+</button>
                    <button class="remove-item"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        
        const total = getCartTotal();
        
        dropdown.innerHTML = `
            <div class="cart-items">
                ${itemsHtml}
            </div>
            <div class="cart-total">
                <span>Total:</span>
                <span>$${total}</span>
            </div>
            <div class="cart-buttons">
                <button class="btn btn-secondary clear-cart">Clear Cart</button>
                <button class="btn btn-primary checkout">Checkout</button>
            </div>
        `;
        
        
        dropdown.querySelectorAll('.quantity-decrease').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const id = cartItem.dataset.id;
                const item = cart.find(item => item.product._id === id);
                if (item) {
                    updateCartItemQuantity(id, item.quantity - 1);
                }
            });
        });
        
        dropdown.querySelectorAll('.quantity-increase').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const id = cartItem.dataset.id;
                const item = cart.find(item => item.product._id === id);
                if (item) {
                    updateCartItemQuantity(id, item.quantity + 1);
                }
            });
        });
        
        dropdown.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const id = cartItem.dataset.id;
                removeFromCart(id);
            });
        });
        
        const clearButton = dropdown.querySelector('.clear-cart');
        if (clearButton) {
            clearButton.addEventListener('click', clearCart);
        }
        
        const checkoutButton = dropdown.querySelector('.checkout');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                hideCartDropdown();
                document.dispatchEvent(new CustomEvent('checkout', {
                    detail: { cart: getCart() }
                }));
            });
        }
    }
}; 