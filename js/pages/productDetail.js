import { productsAPI } from '../api/apiService.js';
import { addToCart } from '../utils/cart.js';
import { navigateTo } from '../utils/navigation.js';
import { showToast } from '../utils/toast.js';

export const renderProductDetailPage = async (productId) => {
    const pageContainer = document.getElementById('page-container');
    
    if (!productId) {
        showToast('Product not found.', 'error');
        navigateTo('products');
        return;
    }
    
    pageContainer.innerHTML = `
        <div class="product-detail-page">
            <div class="product-detail-loading">
                <div class="loading-spinner"></div>
                <p>Loading product...</p>
            </div>
        </div>
    `;
    
    try {
        const response = await productsAPI.getProductById(productId);
        const product = response.product;
        
        pageContainer.innerHTML = `
            <div class="product-detail-page">
                <div class="product-detail-nav">
                    <button id="back-to-products" class="btn btn-text">
                        <i class="fas fa-arrow-left"></i> Back to Products
                    </button>
                </div>
                
                <div class="product-detail-content">
                    <div class="product-detail-image">
                        <img src="${product.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'}" 
                             alt="${product.title}">
                    </div>
                    
                    <div class="product-detail-info">
                        <h1 class="product-detail-title">${product.title}</h1>
                        <div class="product-detail-price">$${product.price}</div>
                        
                        <div class="product-detail-description">
                            ${product.description}
                        </div>
                        
                        <div class="product-detail-quantity">
                            <label for="quantity">Quantity:</label>
                            <div class="quantity-controls">
                                <button id="decrease-quantity">-</button>
                                <input type="number" id="quantity" value="1" min="1" max="10">
                                <button id="increase-quantity">+</button>
                            </div>
                        </div>
                        
                        <div class="product-detail-actions">
                            <button id="add-to-cart" class="btn btn-primary">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button id="buy-now" class="btn btn-secondary">
                                Buy Now
                            </button>
                        </div>
                        
                        <div class="product-detail-meta">
                            <p><i class="fas fa-shield-alt"></i> Secure Checkout</p>
                            <p><i class="fas fa-truck"></i> Free Shipping on orders over $50</p>
                            <p><i class="fas fa-undo"></i> 30-Day Returns</p>
                        </div>
                    </div>
                </div>
                
                <div class="product-additional-info">
                    <h2>Product Details</h2>
                    <p>This premium product offers excellent quality and value. Made with the finest materials and craftsmanship to ensure durability and satisfaction.</p>
                    
                    <h2>Shipping & Returns</h2>
                    <p>Free standard shipping on all orders over $50. Expedited shipping options available at checkout. Returns accepted within 30 days of delivery.</p>
                </div>
                
                <div class="related-products">
                    <h2>You May Also Like</h2>
                    <div id="related-products-container" class="product-grid-loading">
                        <div class="loading-spinner"></div>
                        <p>Loading related products...</p>
                    </div>
                </div>
            </div>
        `;
        
        
        document.getElementById('back-to-products').addEventListener('click', () => {
            navigateTo('products');
        });
        
        // Quantity controls
        const quantityInput = document.getElementById('quantity');
        const decreaseBtn = document.getElementById('decrease-quantity');
        const increaseBtn = document.getElementById('increase-quantity');
        
        decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < 10) {
                quantityInput.value = currentValue + 1;
            }
        });
        
        document.getElementById('add-to-cart').addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            addToCart(product, quantity);
        });
        
        // Buy now button
        document.getElementById('buy-now').addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            addToCart(product, quantity);
            navigateTo('checkout');
        });
        
        try {
            const allProductsResponse = await productsAPI.getAllProducts();
            const allProducts = allProductsResponse.products || [];
            
            const relatedProducts = allProducts
                .filter(p => p._id !== productId)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            
            const relatedContainer = document.getElementById('related-products-container');
            
            if (relatedProducts.length === 0) {
                relatedContainer.innerHTML = '<p>No related products found.</p>';
            } else {
                relatedContainer.innerHTML = '';
                
                const productGrid = document.createElement('div');
                productGrid.className = 'product-grid';
                
                relatedProducts.forEach(relatedProduct => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.dataset.id = relatedProduct._id;
                    
                    const imageUrl = relatedProduct.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
                    
                    productCard.innerHTML = `
                        <img class="product-image" src="${imageUrl}" alt="${relatedProduct.title}">
                        <div class="product-info">
                            <h3 class="product-title">${relatedProduct.title}</h3>
                            <div class="product-price">$${relatedProduct.price}</div>
                            <div class="product-actions">
                                <button class="btn btn-primary add-to-cart">Add to Cart</button>
                                <button class="btn btn-secondary view-details">Details</button>
                            </div>
                        </div>
                    `;
                    
                    productCard.dataset.product = JSON.stringify(relatedProduct);
                    
                    productGrid.appendChild(productCard);
                });
                
                relatedContainer.appendChild(productGrid);
                
                relatedContainer.querySelectorAll('.add-to-cart').forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const card = e.target.closest('.product-card');
                        const relatedProduct = JSON.parse(card.dataset.product);
                        addToCart(relatedProduct);
                    });
                });
                
                relatedContainer.querySelectorAll('.view-details, .product-card').forEach(element => {
                    element.addEventListener('click', (e) => {
                        if (e.target.classList.contains('add-to-cart')) {
                            return;
                        }
                        
                        const card = e.target.closest('.product-card');
                        const relatedProductId = card.dataset.id;
                        navigateTo('product', { id: relatedProductId });
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching related products:', error);
            document.getElementById('related-products-container').innerHTML = '<p>Failed to load related products.</p>';
        }
        
    } catch (error) {
        console.error('Error fetching product details:', error);
        
        pageContainer.innerHTML = `
            <div class="product-detail-page">
                <div class="error-message">
                    <h2>Product Not Found</h2>
                    <p>The product you're looking for could not be found or has been removed.</p>
                    <button id="back-to-products" class="btn btn-primary">Back to Products</button>
                </div>
            </div>
        `;
        
        document.getElementById('back-to-products').addEventListener('click', () => {
            navigateTo('products');
        });
        
        showToast('Product not found or has been removed.', 'error');
    }
}; 