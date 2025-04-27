import { productsAPI } from '../api/apiService.js';
import { createProductCard } from '../components/productCard.js';
import { navigateTo } from '../utils/navigation.js';
import { showToast } from '../utils/toast.js';
import { addToCart } from '../utils/cart.js';
import { formatCurrency } from '../utils/formatter.js';

export const renderHomePage = async () => {
    const pageContainer = document.getElementById('page-container');
    
    pageContainer.innerHTML = `
        <div class="hero-section">
            <h1>Modern E-commerce</h1>
            <p>Discover our premium products hehehe</p>
            <button id="shop-now" class="btn btn-primary">Shop Now</button>
        </div>
        <div class="featured-products-section">
            <h2 class="section-title">Featured Products</h2>
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        </div>
    `;
    
    document.getElementById('shop-now').addEventListener('click', () => {
        console.log('Shop Now button clicked');
        navigateTo('products');
    });
    
    try {
        const response = await productsAPI.getAllProducts();
        console.log('Home page response:', response);
        
        let products = response?.products || [];
        
        if (!Array.isArray(products) || products.length === 0) {
            console.log('Using sample product data instead');
            products = [
                {
                    _id: 'sample1',
                    title: 'Sample Product 1',
                    price: '99.99',
                    imageUrl: './assets/product.png',
                    description: 'This is a sample product description'
                },
                {
                    _id: 'sample2',
                    title: 'Sample Product 2',
                    price: '149.99',
                    imageUrl: './assets/product.png',
                    description: 'Another sample product description'
                },
                {
                    _id: 'sample3',
                    title: 'Sample Product 3',
                    price: '79.99',
                    imageUrl: './assets/product.png',
                    description: 'Yet another sample product description'
                }
            ];
        }
        
        const featuredProducts = products.slice(0, 3);
        
        const featuredSection = document.querySelector('.featured-products-section');
        featuredSection.querySelector('.loading-container').remove();
        
        const productsContainer = document.createElement('div');
        productsContainer.className = 'featured-products-container';
        
        if (featuredProducts.length === 0) {
            productsContainer.innerHTML = `
                <div class="no-products">
                    <p>No products available at this time.</p>
                </div>
            `;
        } else {
            const DEFAULT_PRODUCT_IMAGE = '/assets/product.png';
            
            featuredProducts.forEach(product => {
                const card = document.createElement('div');
                card.className = 'featured-product-card';
                card.dataset.id = product._id;
                
                const imageUrl = product.imageUrl || DEFAULT_PRODUCT_IMAGE;
                
                card.innerHTML = `
                    <div class="product-image-container">
                        <img src="${imageUrl}" alt="${product.title}" class="product-image" 
                             onerror="this.onerror=null; this.src='${DEFAULT_PRODUCT_IMAGE}';">
                    </div>
                    <div class="featured-product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price">${formatCurrency(product.price)}</div>
                        <p class="product-description">${product.description}</p>
                        <div class="product-actions">
                            <button class="btn btn-primary add-to-cart-btn" data-product-id="${product._id}">Add to Cart</button>
                            <button class="btn btn-secondary view-details-btn" data-product-id="${product._id}">View Details</button>
                        </div>
                    </div>
                `;
                
                productsContainer.appendChild(card);
            });
        }
        
        featuredSection.appendChild(productsContainer);
        
        const viewAllButton = document.createElement('div');
        viewAllButton.className = 'view-all-container';
        viewAllButton.innerHTML = '<button class="btn btn-accent view-all">View All Products</button>';
        featuredSection.appendChild(viewAllButton);
        
        const productCards = document.querySelectorAll('.featured-product-card');
        
        productCards.forEach(card => {
            const productId = card.dataset.id;
            const product = featuredProducts.find(p => p._id === productId);
            
            if (!product) return;
            
            const addToCartBtn = card.querySelector('.add-to-cart-btn');
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(product);
                showToast(`${product.title} added to cart!`, 'success');
            });
            
            const viewDetailsBtn = card.querySelector('.view-details-btn');
            viewDetailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateTo('product', { id: product._id });
            });
            
            card.addEventListener('click', () => {
                navigateTo('product', { id: product._id });
            });
        });
        
        viewAllButton.querySelector('.view-all').addEventListener('click', () => {
            console.log('View All Products button clicked');
            navigateTo('products');
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
        
        const featuredSection = document.querySelector('.featured-products-section');
        featuredSection.querySelector('.loading-container').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load products. Please try again later.</p>
                <button class="btn btn-primary retry">Retry</button>
            </div>
        `;
        
        featuredSection.querySelector('.retry').addEventListener('click', () => {
            renderHomePage();
        });
        
        showToast('Failed to load products. Please try again.', 'error');
    }
    
    pageContainer.innerHTML += `
        <div class="promo-section">
            <div class="promo-item">
                <i class="fas fa-shipping-fast"></i>
                <h3>Fast Shipping</h3>
                <p>Free shipping on all orders over $50</p>
            </div>
            <div class="promo-item">
                <i class="fas fa-undo"></i>
                <h3>Easy Returns</h3>
                <p>30 day money back guarantee</p>
            </div>
            <div class="promo-item">
                <i class="fas fa-lock"></i>
                <h3>Secure Checkout</h3>
                <p>Safe & secure payment processing</p>
            </div>
        </div>
        
        <div class="newsletter-section">
            <h2>Join Our Newsletter</h2>
            <p>Subscribe to get special offers, news and updates</p>
            <form id="newsletter-form">
                <input type="email" placeholder="Your email address" required>
                <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
        </div>
    `;
    
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            console.log('Newsletter subscription:', email);
            
            showToast('Thank you for subscribing!', 'success');
            
            newsletterForm.reset();
        });
    }
}; 