import { productsAPI } from '../api/apiService.js';
import { navigateTo } from '../utils/navigation.js';
import { addToCart } from '../utils/cart.js';
import { showToast } from '../utils/toast.js';
import { formatCurrency } from '../utils/formatter.js';

// Use an absolute path for the default product image
const DEFAULT_PRODUCT_IMAGE = '/assets/product.png';

/**
 * Get a proper image URL or return default if empty
 */
const getProperImageUrl = (url) => {
    // If URL is empty, null, or undefined, return default image
    if (!url || url.trim() === '') {
        return DEFAULT_PRODUCT_IMAGE;
    }
    
    // Handle postimg.cc URLs that don't end with an image extension
    if (url.includes('postimg.cc') && !url.includes('.jpg') && !url.includes('.png')) {
        return 'https://i.postimg.cc/BjSDrq9k/temp-Image-ki7-Rwh.jpg';
    }
    
    return url;
};

export const renderProductDetail = async (params) => {
    const { id } = params;
    
    if (!id) {
        navigateTo('products');
        return;
    }
    
    const pageContainer = document.getElementById('page-container');
    
    // Loading state
    pageContainer.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading product information...</p>
        </div>
    `;
    
    try {
        const response = await productsAPI.getProductById(id);
        console.log('Product detail response:', response);
        
        const product = response.product;
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        const imageUrl = getProperImageUrl(product.imageUrl);
        
        pageContainer.innerHTML = `
            <div class="product-detail-page">
                <div class="product-detail-nav">
                    <button class="btn-text back-to-products">
                        <i class="fas fa-arrow-left"></i> Back to Products
                    </button>
                </div>
                
                <div class="product-detail-content">
                    <div class="product-detail-image">
                        <img src="${imageUrl}" alt="${product.title}" onerror="this.onerror=null; this.src='${DEFAULT_PRODUCT_IMAGE}';">
                    </div>
                    
                    <div class="product-detail-info">
                        <h1 class="product-detail-title">${product.title}</h1>
                        <div class="product-detail-price">${formatCurrency(product.price)}</div>
                        <div class="product-detail-description">${product.description}</div>
                        
                        <div class="product-detail-quantity">
                            <label for="quantity">Quantity</label>
                            <div class="quantity-controls">
                                <button class="quantity-decrease">-</button>
                                <input type="number" id="quantity" min="1" value="1">
                                <button class="quantity-increase">+</button>
                            </div>
                        </div>
                        
                        <div class="product-detail-actions">
                            <button class="btn btn-primary add-to-cart">Add to Cart</button>
                            <button class="btn btn-secondary buy-now">Buy Now</button>
                        </div>
                        
                        <div class="product-detail-meta">
                            <p><i class="fas fa-truck"></i> Free shipping on orders over $50</p>
                            <p><i class="fas fa-box"></i> Free returns within 30 days</p>
                            <p><i class="fas fa-shield-alt"></i> 1 year warranty</p>
                        </div>
                    </div>
                </div>
                
                <div class="product-additional-info">
                    <h2>Product Details</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id.</p>
                    <p>Fusce sed enim in nisl gravida porttitor. Suspendisse potenti. Vivamus luctus bibendum metus, eu posuere sapien dapibus id. Aliquam erat volutpat. In hac habitasse platea dictumst.</p>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.querySelector('.back-to-products').addEventListener('click', () => {
            navigateTo('products');
        });
        
        // Quantity controls
        const quantityInput = document.getElementById('quantity');
        const decreaseBtn = document.querySelector('.quantity-decrease');
        const increaseBtn = document.querySelector('.quantity-increase');
        
        decreaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
        
        // Add to cart button
        document.querySelector('.add-to-cart').addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value) || 1;
            
            addToCart(product, quantity);
            
            showToast(`Added ${quantity} ${product.title} to cart`, 'success');
        });
        
        // Buy now button
        document.querySelector('.buy-now').addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value) || 1;
            
            addToCart(product, quantity);
            
            navigateTo('checkout');
        });
        
    } catch (error) {
        console.error('Error fetching product:', error);
        
        pageContainer.innerHTML = `
            <div class="error-message">
                <h2>Product Not Found</h2>
                <p>Sorry, the product you're looking for doesn't exist or has been removed.</p>
                <button class="btn btn-primary back-to-products">Back to Products</button>
            </div>
        `;
        
        document.querySelector('.back-to-products').addEventListener('click', () => {
            navigateTo('products');
        });
    }
}; 