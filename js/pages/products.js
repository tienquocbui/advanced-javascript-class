import { productsAPI } from '../api/apiService.js';
import { createProductCard } from '../components/productCard.js';
import { showToast } from '../utils/toast.js';

export const renderProductsPage = async () => {
    const pageContainer = document.getElementById('page-container');
    
    pageContainer.innerHTML = `
        <div class="products-page">
            <div class="products-header">
                <h1>Our Products</h1>
                <div class="products-filter">
                    <div class="filter-item">
                        <label for="sort-by">Sort By</label>
                        <select id="sort-by" class="filter-select">
                            <option value="default">Default</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="products-container">
                <div class="product-grid-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        </div>
    `;
    
    try {
        const response = await productsAPI.getAllProducts();
        console.log('Products page response:', response);
        
        let products = response?.products || [];
        
        if (!Array.isArray(products) || products.length === 0) {
            console.log('Using sample product data instead');
            products = [
                {
                    _id: 'sample1',
                    title: 'Sample Product 1',
                    price: '99.99',
                    imageUrl: 'https://via.placeholder.com/300',
                    description: 'This is a sample product description'
                },
                {
                    _id: 'sample2',
                    title: 'Sample Product 2',
                    price: '149.99',
                    imageUrl: 'https://via.placeholder.com/300',
                    description: 'Another sample product description'
                },
                {
                    _id: 'sample3',
                    title: 'Sample Product 3',
                    price: '79.99',
                    imageUrl: 'https://via.placeholder.com/300',
                    description: 'Yet another sample product description'
                },
                {
                    _id: 'sample4',
                    title: 'Sample Product 4',
                    price: '129.99',
                    imageUrl: 'https://via.placeholder.com/300',
                    description: 'A fourth sample product description'
                },
                {
                    _id: 'sample5',
                    title: 'Sample Product 5',
                    price: '199.99',
                    imageUrl: 'https://via.placeholder.com/300',
                    description: 'A fifth sample product description'
                }
            ];
        }
        
        window.allProducts = products;
        
        renderProducts(products);
        
        const sortSelect = document.getElementById('sort-by');
        sortSelect.addEventListener('change', () => {
            const sortValue = sortSelect.value;
            sortProducts(sortValue);
        });
        
        document.addEventListener('showSearchResults', (event) => {
            const { query, results } = event.detail;
            
            const productsHeader = document.querySelector('.products-header h1');
            productsHeader.textContent = `Search Results for "${query}"`;
            
            renderProducts(results);
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
        
        const productsContainer = document.querySelector('.products-container');
        productsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load products. Please try again later.</p>
                <button class="btn btn-primary retry">Retry</button>
            </div>
        `;
        
        // Add retry functionality
        document.querySelector('.retry').addEventListener('click', () => {
            renderProductsPage();
        });
        
        showToast('Failed to load products. Please try again.', 'error');
    }
};

const renderProducts = (products) => {
    const productsContainer = document.querySelector('.products-container');
    
    const productGrid = document.createElement('div');
    productGrid.className = 'product-grid';
    
    products.forEach(product => {
        const card = createProductCard(product);
        productGrid.appendChild(card);
    });
    
    productsContainer.innerHTML = '';
    productsContainer.appendChild(productGrid);
};

const sortProducts = (sortValue) => {
    const products = [...window.allProducts];
    
    switch (sortValue) {
        case 'price-low':
            products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high':
            products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'name-asc':
            products.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            products.sort((a, b) => b.title.localeCompare(a.title));
            break;
        default:
            break;
    }
    
    renderProducts(products);
}; 