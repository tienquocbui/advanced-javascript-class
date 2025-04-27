import { isLoggedIn, getCurrentUser } from './auth.js';
import { renderProductForm } from '../components/productForm.js';
import { showToast } from './toast.js';
import { navigateTo } from './navigation.js';

export const createUserDropdown = () => {
    console.log("Creating user dropdown");
    const userToggle = document.getElementById('user-toggle');
    if (!userToggle) {
        console.error('User toggle button not found');
        return;
    }
    
    const existingDropdown = document.querySelector('.user-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    const userDropdown = document.createElement('div');
    userDropdown.className = 'user-dropdown hidden';
    document.querySelector('.user-actions').appendChild(userDropdown);
    
    updateUserDropdown();
    
    userToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close any open modals
        const modalContainer = document.getElementById('modal-container');
        const modalBackdrop = document.getElementById('modal-backdrop');
        if (modalContainer && !modalContainer.classList.contains('hidden')) {
            modalContainer.classList.add('hidden');
            modalBackdrop.classList.add('hidden');
        }
        
        // Toggle dropdown
        userDropdown.classList.toggle('hidden');
    });
    
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && e.target !== userToggle) {
            userDropdown.classList.add('hidden');
        }
    });
    
    // Hide dropdown when login/signup modal is shown
    document.addEventListener('modalOpened', () => {
        userDropdown.classList.add('hidden');
    });
};

const updateUserDropdown = () => {
    const userDropdown = document.querySelector('.user-dropdown');
    if (!userDropdown) {
        console.error('User dropdown element not found');
        return;
    }
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        const isAdmin = user?.role === 'admin';
        
        userDropdown.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">
                    ${user.imageUrl 
                        ? `<img src="${user.imageUrl}" alt="${user.firstName}">` 
                        : `<span>${user.firstName.charAt(0)}</span>`
                    }
                </div>
                <div>
                    <div class="user-name">${user.firstName} ${user.lastName}</div>
                    <div class="user-email">${user.email}</div>
                </div>
            </div>
            <div class="user-menu">
                <a href="#" id="profile-link">My Profile</a>
                <a href="#" id="orders-link">My Orders</a>
                ${isAdmin ? '<a href="#" id="add-product-link">Add New Product</a>' : ''}
                ${isAdmin ? '<a href="#" id="admin-panel-link">Admin Panel</a>' : ''}
                <a href="#" id="logout-link">Logout</a>
            </div>
        `;
        
        userDropdown.querySelector('#profile-link').addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.add('hidden');
            navigateTo('profile');
        });
        
        userDropdown.querySelector('#orders-link').addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.add('hidden');
            navigateTo('orders');
        });
        
        if (isAdmin) {
            userDropdown.querySelector('#add-product-link').addEventListener('click', (e) => {
                e.preventDefault();
                userDropdown.classList.add('hidden');
                renderProductForm();
            });
            
            userDropdown.querySelector('#admin-panel-link').addEventListener('click', (e) => {
                e.preventDefault();
                userDropdown.classList.add('hidden');
                navigateTo('admin');
            });
        }
        
        userDropdown.querySelector('#logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.add('hidden');
            document.dispatchEvent(new CustomEvent('logout'));
        });
    } else {
        userDropdown.innerHTML = `
            <div class="user-menu">
                <a href="#" id="login-link">Login</a>
                <a href="#" id="signup-link">Sign Up</a>
            </div>
        `;
        
        userDropdown.querySelector('#login-link').addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.add('hidden');
            document.dispatchEvent(new CustomEvent('showLogin'));
        });
        
        userDropdown.querySelector('#signup-link').addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.add('hidden');
            document.dispatchEvent(new CustomEvent('showSignup'));
        });
    }
};

export const initUserMenu = () => {
    createUserDropdown();
    
    // Register event listeners for auth events to update the menu
    document.addEventListener('userLoggedIn', updateUserDropdown);
    document.addEventListener('userLoggedOut', updateUserDropdown);
    document.addEventListener('userUpdated', updateUserDropdown);
}; 