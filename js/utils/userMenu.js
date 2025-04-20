import { isLoggedIn, getCurrentUser } from './auth.js';
import { navigateTo } from './navigation.js';

let userDropdownVisible = false;

export const initUserMenu = () => {
    document.addEventListener('userLoggedIn', updateUserMenu);
    document.addEventListener('userLoggedOut', updateUserMenu);
    
    document.addEventListener('click', (event) => {
        if (
            userDropdownVisible && 
            !event.target.closest('#user-toggle') && 
            !event.target.closest('.user-dropdown')
        ) {
            hideUserDropdown();
        }
    });
    
    const userToggle = document.getElementById('user-toggle');
    userToggle.addEventListener('click', toggleUserDropdown);
};

const toggleUserDropdown = () => {
    if (userDropdownVisible) {
        hideUserDropdown();
    } else {
        showUserDropdown();
    }
};

const showUserDropdown = () => {
    let dropdown = document.querySelector('.user-dropdown');
    
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        document.body.appendChild(dropdown);
    }
    
    renderUserDropdown();
    
    dropdown.style.display = 'block';
    userDropdownVisible = true;
};

const hideUserDropdown = () => {
    const dropdown = document.querySelector('.user-dropdown');
    
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    userDropdownVisible = false;
};

const updateUserMenu = () => {
    if (userDropdownVisible) {
        renderUserDropdown();
    }
};

const renderUserDropdown = () => {
    const dropdown = document.querySelector('.user-dropdown');
    
    if (!dropdown) return;
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        
        if (!user) {
            hideUserDropdown();
            return;
        }
        
        dropdown.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">
                    ${user.imageUrl 
                        ? `<img src="${user.imageUrl}" alt="${user.firstName}">` 
                        : `<span>${user.firstName.charAt(0)}</span>`
                    }
                </div>
                <div class="user-details">
                    <div class="user-name">${user.firstName} ${user.lastName}</div>
                    <div class="user-email">${user.email}</div>
                </div>
            </div>
            <div class="user-menu">
                <a href="#" data-action="profile">My Profile</a>
                <a href="#" data-action="orders">My Orders</a>
                ${user.role === 'admin' ? '<a href="#" data-action="admin">Admin Panel</a>' : ''}
                <a href="#" data-action="logout">Logout</a>
            </div>
        `;
        
        addUserMenuEventListeners(dropdown);
    } else {
        dropdown.innerHTML = `
            <div class="user-menu">
                <a href="#" data-action="login">Login</a>
                <a href="#" data-action="signup">Sign Up</a>
            </div>
        `;
        
        addUserMenuEventListeners(dropdown);
    }
};

const addUserMenuEventListeners = (dropdown) => {
    const menuItems = dropdown.querySelectorAll('.user-menu a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const action = item.getAttribute('data-action');
            
            switch (action) {
                case 'profile':
                    hideUserDropdown();
                    navigateTo('profile');
                    break;
                case 'orders':
                    hideUserDropdown();
                    navigateTo('orders');
                    break;
                case 'admin':
                    hideUserDropdown();
                    navigateTo('admin');
                    break;
                case 'logout':
                    hideUserDropdown();
                    document.dispatchEvent(new CustomEvent('logout'));
                    break;
                case 'login':
                    hideUserDropdown();
                    document.dispatchEvent(new CustomEvent('showLogin'));
                    break;
                case 'signup':
                    hideUserDropdown();
                    document.dispatchEvent(new CustomEvent('showSignup'));
                    break;
            }
        });
    });
}; 