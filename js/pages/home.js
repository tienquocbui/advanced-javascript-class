import { productsAPI } from '../api/apiService.js';
import { createProductCard } from '../components/productCard.js';
import { navigateTo } from '../utils/navigation.js';
import { showToast } from '../utils/toast.js';

export const renderHomePage = async () => {
    const pageContainer = document.getElementById('page-container');
    
    pageContainer.innerHTML = `
        <div class="hero-section">
            <h1>Modern E-commerce</h1>
            <p>Discover our premium products hehehe</p>
            <button id="shop-now" class="btn btn-primary">Shop Now</button>
        </div>
        <div class="featured-products">
            <h2>Featured Products</h2>
            <div class="product-grid-loading">
                <div class="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        </div>
    `;
    
    document.getElementById('shop-now').addEventListener('click', () => {
        navigateTo('products');
    });
    
    try {
        const response = await productsAPI.getAllProducts();
        const products = response.products;
        
        const featuredProducts = products.slice(0, 3);
        
        const productGrid = document.createElement('div');
        productGrid.className = 'product-grid';
        
        if (featuredProducts.length === 0) {
            productGrid.innerHTML = `
                <div class="no-products">
                    <p>No products available</p>
                </div>
            `;
        } else {
            featuredProducts.forEach(product => {
                const card = createProductCard(product);
                productGrid.appendChild(card);
            });
        }
        
        const featuredProductsSection = document.querySelector('.featured-products');
        featuredProductsSection.querySelector('.product-grid-loading').remove();
        featuredProductsSection.appendChild(productGrid);
        
        const viewAllButton = document.createElement('div');
        viewAllButton.className = 'view-all-container';
        viewAllButton.innerHTML = '<button class="btn btn-secondary view-all">View All Products</button>';
        featuredProductsSection.appendChild(viewAllButton);
        
        viewAllButton.querySelector('.view-all').addEventListener('click', () => {
            navigateTo('products');
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
        
        const featuredProductsSection = document.querySelector('.featured-products');
        featuredProductsSection.querySelector('.product-grid-loading').innerHTML = `
            <div class="error-message">
                <p>Failed to load products. Please try again later.</p>
                <button class="btn btn-primary retry">Retry</button>
            </div>
        `;
        
        featuredProductsSection.querySelector('.retry').addEventListener('click', () => {
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