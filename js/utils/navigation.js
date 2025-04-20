import { renderHomePage } from '../pages/home.js';
import { renderProductsPage } from '../pages/products.js';
import { renderProductDetailPage } from '../pages/productDetail.js';
import { renderAboutPage } from '../pages/about.js';
import { renderCheckoutPage } from '../pages/checkout.js';
import { renderProfilePage } from '../pages/profile.js';
import { renderOrdersPage } from '../pages/orders.js';
import { renderAdminPage } from '../pages/admin.js';
import { isLoggedIn, getCurrentUser } from './auth.js';

let currentPage = 'home';

// Define all valid routes for the application
const validRoutes = ['home', 'products', 'product', 'about', 'checkout', 'profile', 'orders', 'admin'];

const routes = {
  '/': { page: 'home' },
  '/home': { page: 'home' },
  '/products': { page: 'products' },
  '/product': { page: 'product', hasParam: true },
  '/about': { page: 'about' },
  '/checkout': { page: 'checkout' },
  '/profile': { page: 'profile' },
  '/orders': { page: 'orders' },
  '/admin': { page: 'admin' }
};

export const initNavigation = () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    document.addEventListener('navigate', (event) => {
        navigateTo(event.detail.page, event.detail.params);
    });

    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();
};

/**
 * Handle route changes
 */
const handleRouteChange = () => {
    let path = window.location.pathname;
    
    // Extract route and parameters
    const params = {};
    let routeKey = '';
    
    for (const [key, config] of Object.entries(routes)) {
        if (config.hasParam && path.startsWith(key + '/')) {
            const pathParts = path.split('/');
            if (pathParts.length >= 3) {
                params.id = pathParts[2];
                routeKey = key;
                break;
            }
        }
        else if (path === key) {
            routeKey = key;
            break;
        }
    }
    
    if (path === '/' || path === '') {
        navigateTo('home');
        return;
    }
    
    if (!routeKey) {
        const possibleRoute = path.substring(1); // Remove leading slash
        if (validRoutes.includes(possibleRoute)) {
            navigateTo(possibleRoute);
            return;
        }
        
        renderNotFoundPage();
        return;
    }
    
    navigateTo(routes[routeKey].page, params);
};

/**
 * Navigate to a specific page
 * @param {string} page 
 * @param {object} params
 */
export const navigateTo = (page, params = {}) => {
    const cartDropdown = document.querySelector('.cart-dropdown');
    if (cartDropdown) {
        cartDropdown.style.display = 'none';
    }
    
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
        userDropdown.style.display = 'none';
    }
    
    if (
        (page === 'profile' || page === 'orders' || page === 'admin') && 
        !isLoggedIn()
    ) {
        document.dispatchEvent(new CustomEvent('showLogin'));
        return;
    }
    
    if (page === 'admin') {
        const user = getCurrentUser();
        if (!user || user.role !== 'admin') {
            import('./toast.js').then(({ showToast }) => {
                showToast('Access denied. Admin privileges required.', 'error');
            });
            navigateTo('home');
            return;
        }
    }
    
    let newPath;
    if (page === 'home') {
        newPath = '/';
    } else if (page === 'product' && params.id) {
        newPath = `/product/${params.id}`;
    } else {
        newPath = `/${page}`;
    }
    
    if (window.location.pathname !== newPath) {
        window.history.pushState({ page, params }, '', newPath);
    }
    
    updateActiveLink(page);
    currentPage = page;
    
    const pageContainer = document.getElementById('page-container');
    pageContainer.innerHTML = '';
    
    switch (page) {
        case 'home':
            renderHomePage();
            break;
        case 'products':
            renderProductsPage();
            break;
        case 'product':
            renderProductDetailPage(params.id);
            break;
        case 'about':
            renderAboutPage();
            break;
        case 'checkout':
            renderCheckoutPage();
            break;
        case 'profile':
            renderProfilePage();
            break;
        case 'orders':
            renderOrdersPage();
            break;
        case 'admin':
            renderAdminPage();
            break;
        default:
            renderNotFoundPage();
    }
};

/**
 * Render the 404 not found page
 */
const renderNotFoundPage = () => {
    const pageContainer = document.getElementById('page-container');
    pageContainer.innerHTML = `
        <div class="not-found">
            <h1>404</h1>
            <p>Page not found</p>
            <button class="btn btn-primary" id="go-home">Go Home</button>
        </div>
    `;
    
    const goHomeButton = document.getElementById('go-home');
    if (goHomeButton) {
        goHomeButton.addEventListener('click', () => {
            navigateTo('home');
        });
    }
    
    document.title = '404 Not Found | YourStoreName';
    
    if (window.location.pathname !== '/404') {
        window.history.replaceState(null, '', '/404');
    }
};

const updateActiveLink = (page) => {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const pageToHighlight = page === 'product' ? 'products' : page;
    
    const activeLink = document.querySelector(`.nav-links a[data-page="${pageToHighlight}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}; 