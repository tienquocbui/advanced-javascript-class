import { productsAPI } from '../api/apiService.js';
import { navigateTo } from './navigation.js';

let searchBarVisible = false;

export const initSearchBar = () => {
    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('search-close');
    
    searchToggle.addEventListener('click', () => {
        if (searchBarVisible) {
            hideSearchBar();
        } else {
            showSearchBar();
        }
    });
    
    searchClose.addEventListener('click', hideSearchBar);
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            performSearch(searchInput.value.trim());
        } else if (e.key === 'Escape') {
            hideSearchBar();
        }
    });
    
    document.addEventListener('click', (e) => {
        if (
            searchBarVisible && 
            !e.target.closest('#search-bar') && 
            !e.target.closest('#search-toggle')
        ) {
            hideSearchBar();
        }
    });
};

const showSearchBar = () => {
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    
    searchBar.classList.remove('hidden');
    searchBarVisible = true;
    
    setTimeout(() => {
        searchInput.focus();
    }, 100);
};

const hideSearchBar = () => {
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    
    searchBar.classList.add('hidden');
    searchBarVisible = false;
    
    searchInput.value = '';
};

// Perform search
const performSearch = async (query) => {
    hideSearchBar();
    
    try {
        const response = await productsAPI.getAllProducts();
        const allProducts = response.products;
        
        const filteredProducts = allProducts.filter(product => {
            const title = product.title.toLowerCase();
            const description = product.description.toLowerCase();
            const q = query.toLowerCase();
            
            return title.includes(q) || description.includes(q);
        });
        
        document.dispatchEvent(new CustomEvent('showSearchResults', {
            detail: {
                query,
                results: filteredProducts
            }
        }));
        
        navigateTo('products', { search: query });
    } catch (error) {
        console.error('Error searching products:', error);
        import('./toast.js').then(({ showToast }) => {
            showToast('Error searching products. Please try again.', 'error');
        });
    }
}; 