import { addToCart } from '../utils/cart.js';
import { navigateTo } from '../utils/navigation.js';

// Default product image path
const DEFAULT_PRODUCT_IMAGE = './assets/product.png';

/**
 * Get a proper image URL or return default if empty
 * @param {string|null} url - The image URL to process
 * @returns {string} - A valid image URL
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

/**
 * Create a product card element
 * @param {Object} product 
 * @returns {HTMLElement} 
 */
export const createProductCard = (product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const imageUrl = getProperImageUrl(product.imageUrl);
    
    // Build card HTML
    card.innerHTML = `
        <img class="product-image" src="${imageUrl}" alt="${product.title}" onerror="this.onerror=null; this.src='${DEFAULT_PRODUCT_IMAGE}';">
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">$${product.price}</div>
            <p class="product-description">${product.description}</p>
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart">Add to Cart</button>
                <button class="btn btn-secondary view-details">Details</button>
            </div>
        </div>
    `;
    
    const addToCartBtn = card.querySelector('.add-to-cart');
    const viewDetailsBtn = card.querySelector('.view-details');
    
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product);
    });
    
    viewDetailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateTo('product', { id: product._id });
    });
    
    card.addEventListener('click', () => {
        navigateTo('product', { id: product._id });
    });
    
    return card;
};

/**
 * Create a product card HTML string (for template literals)
 * @param {Object} product 
 * @returns {string} 
 */
export const productCardTemplate = (product) => {
    const imageUrl = getProperImageUrl(product.imageUrl);
    
    return `
        <div class="product-card" data-id="${product._id}">
            <img class="product-image" src="${imageUrl}" alt="${product.title}" onerror="this.onerror=null; this.src='${DEFAULT_PRODUCT_IMAGE}';">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">$${product.price}</div>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <button class="btn btn-primary add-to-cart">Add to Cart</button>
                    <button class="btn btn-secondary view-details">Details</button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Add event listeners to product cards rendered as HTML strings
 * @param {HTMLElement} container
 */
export const addProductCardListeners = (container) => {
    // Add to cart buttons
    container.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const card = e.target.closest('.product-card');
            const productId = card.dataset.id;
            
            try {
                const productData = JSON.parse(card.dataset.product);
                addToCart(productData);
            } catch (error) {
                import('../api/apiService.js').then(({ productsAPI }) => {
                    productsAPI.getProductById(productId).then(response => {
                        addToCart(response.product);
                    });
                });
            }
        });
    });
    
    container.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = e.target.closest('.product-card').dataset.id;
            navigateTo('product', { id: productId });
        });
    });
    
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = card.dataset.id;
            navigateTo('product', { id: productId });
        });
    });
}; 