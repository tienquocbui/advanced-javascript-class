import { initAuth } from './utils/auth.js';
import { initCart } from './utils/cart.js';
import { initToast } from './utils/toast.js';
import { initNavigation } from './utils/navigation.js';
import { initSearchBar } from './utils/search.js';
import { initUserMenu } from './utils/userMenu.js';

const init = async () => {
    initAuth();
    initCart();
    initToast();
    initNavigation();
    initSearchBar();
    initUserMenu();
    
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            console.log('User logged in:', userData.firstName);
            updateUserInterface(true, userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    } else {
        updateUserInterface(false);
    }
};

const updateUserInterface = (isLoggedIn, userData = null) => {
    const userToggle = document.getElementById('user-toggle');
    
    userToggle.innerHTML = '<i class="fas fa-user"></i>';
};

document.addEventListener('DOMContentLoaded', init);

export { updateUserInterface }; 