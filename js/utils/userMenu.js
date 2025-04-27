import { isLoggedIn, getCurrentUser } from './auth.js';
import { renderProductForm } from '../components/productForm.js';
import { showToast } from './toast.js';
import { navigateTo } from './navigation.js';

export const createUserDropdown = () => {
    const userToggle = document.getElementById('user-toggle');
    
    let userDropdown = document.querySelector('.user-dropdown');
    if (!userDropdown) {
        userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown hidden';
        document.querySelector('.user-actions').appendChild(userDropdown);
    }
    
    updateUserDropdown();
    
    userToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && e.target !== userToggle) {
            userDropdown.classList.add('hidden');
        }
    });
    
    // Listen for user status changes
    document.addEventListener('userLoggedIn', updateUserDropdown);
    document.addEventListener('userLoggedOut', updateUserDropdown);
    document.addEventListener('userUpdated', updateUserDropdown);
};

const updateUserDropdown = () => {
    const userDropdown = document.querySelector('.user-dropdown');
    if (!userDropdown) return;
    
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
        
        // Add event listeners
        userDropdown.querySelector('#profile-link').addEventListener('click', (e) => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('showProfile'));
            userDropdown.classList.add('hidden');
        });
        
        userDropdown.querySelector('#orders-link').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('orders');
            userDropdown.classList.add('hidden');
        });
        
        if (isAdmin) {
            userDropdown.querySelector('#add-product-link').addEventListener('click', (e) => {
                e.preventDefault();
                renderProductForm();
                userDropdown.classList.add('hidden');
            });
            
            userDropdown.querySelector('#admin-panel-link').addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('admin');
                userDropdown.classList.add('hidden');
            });
        }
        
        userDropdown.querySelector('#logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('logout'));
            userDropdown.classList.add('hidden');
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
            document.dispatchEvent(new CustomEvent('showLogin'));
            userDropdown.classList.add('hidden');
        });
        
        userDropdown.querySelector('#signup-link').addEventListener('click', (e) => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('showSignup'));
            userDropdown.classList.add('hidden');
        });
    }
};

export const initUserMenu = () => {
    createUserDropdown();
}; 