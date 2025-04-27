import { renderHomePage } from '../pages/home.js';
import { renderProductsPage } from '../pages/products.js';
import { renderProductDetailPage } from '../pages/productDetail.js';
import { renderAboutPage } from '../pages/about.js';
import { renderCheckoutPage } from '../pages/checkout.js';
import { renderProfilePage } from '../pages/profile.js';
import { renderOrdersPage } from '../pages/orders.js';
import { renderAdminPage } from '../pages/admin.js';
import { isLoggedIn, getCurrentUser } from './auth.js';
import { initUserMenu } from './userMenu.js';

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
    if (!validRoutes.includes(page)) {
        renderNotFoundPage();
        return;
    }
    
    let path;
    if (page === 'product' && params.id) {
        path = `/product?id=${params.id}`;
    } else if (Object.keys(params).length > 0) {
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        path = `/${page}?${queryString}`;
    } else {
        path = `/${page}`;
    }
    
    console.log(`Navigating to ${page} with path: ${path}`);
    
    history.pushState({ page, params }, '', path);
    
    const pageModules = {
        'home': () => renderHomePage(),
        'products': () => renderProductsPage(),
        'product': () => renderProductDetailPage(params.id),
        'about': () => renderAboutPage(),
        'checkout': () => renderCheckoutPage(),
        'profile': () => renderProfilePage(),
        'orders': () => renderOrdersPage(),
        'admin': () => renderAdminPage()
    };
    
    currentPage = page;
    
    try {
        pageModules[page]();
        updateActiveLink(page);
        
        // Always initialize user menu after navigation
        setTimeout(reinitializeUI, 100);
        
        window.scrollTo(0, 0);
    } catch (error) {
        console.error(`Error rendering page ${page}:`, error);
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

const reinitializeUI = () => {
    // Re-initialize user menu
    initUserMenu();
};