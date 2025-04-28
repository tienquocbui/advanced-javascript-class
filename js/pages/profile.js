import { authAPI } from '../api/apiService.js';
import { isLoggedIn, getCurrentUser } from '../utils/auth.js';
import { navigateTo } from '../utils/navigation.js';
import { showToast } from '../utils/toast.js';
import { formatCurrency } from '../utils/formatter.js';

export const renderProfilePage = async () => {
    const pageContainer = document.getElementById('page-container');
    
    if (!isLoggedIn()) {
        showToast('Please login to view your profile', 'error');
        document.dispatchEvent(new CustomEvent('showLogin'));
        return;
    }
    
    const user = getCurrentUser();
    
    pageContainer.innerHTML = `
        <div class="profile-page">
            <h1>My Profile</h1>
            
            <div class="profile-content">
                <div class="profile-sidebar">
                    <div class="profile-avatar">
                        ${user.imageUrl 
                            ? `<img src="${user.imageUrl}" alt="${user.firstName}" class="delete-profile-image">` 
                            : `<div class="profile-initial">${user.firstName.charAt(0).toUpperCase()}</div>`
                        }
                        <button id="change-avatar" class="change-avatar">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    
                    <div class="profile-info">
                        <h2 class="profile-user-name">${user.firstName} ${user.lastName}</h2>
                        <p class="profile-user-email">${user.email}</p>
                        <div class="profile-role">${user.role || 'Customer'}</div>
                    </div>
                    
                    <div class="profile-nav">
                        <button class="profile-nav-item active" data-section="account">
                            <i class="fas fa-user"></i> Account Details
                        </button>
                        <button class="profile-nav-item" data-section="orders">
                            <i class="fas fa-shopping-bag"></i> My Orders
                        </button>
                        <button id="logout-btn" class="profile-nav-item">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
                
                <div class="profile-main">
                    <div id="account-section" class="profile-section active">
                        <h2>Account Details</h2>
                        
                        <form id="profile-form">
                            <div class="form-group">
                                <label for="firstName" class="form-label">First Name</label>
                                <input type="text" id="firstName" class="apple-input" value="${user.firstName}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="lastName" class="form-label">Last Name</label>
                                <input type="text" id="lastName" class="apple-input" value="${user.lastName}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" id="email" class="apple-input" value="${user.email}" disabled>
                                <p class="form-help">Email cannot be changed</p>
                            </div>
                            
                            <div class="form-group">
                                <label for="role" class="form-label">Role</label>
                                <input type="text" id="role" class="apple-input" value="${user.role || 'Customer'}" disabled>
                            </div>
                            
                            <input type="file" id="avatar-input" accept="image/*" style="display: none;">
                            
                            <div class="form-actions">
                                <button type="submit" class="apple-button">Save Changes</button>
                            </div>
                        </form>
                    </div>
                    
                    <div id="orders-section" class="profile-section">
                        <h2>My Orders</h2>
                        <div class="orders-loading">
                            <div class="loading-spinner"></div>
                            <p>Loading your orders...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.profile-nav-item').forEach(item => {
        if (item.id === 'logout-btn') {
            item.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('logout'));
                navigateTo('home');
            });
        } else {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                
                if (section === 'orders') {
                    loadOrders();
                }
                
                document.querySelectorAll('.profile-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                document.querySelectorAll('.profile-nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                
                document.getElementById(`${section}-section`).classList.add('active');
                item.classList.add('active');
            });
        }
    });
    
    const changeAvatarBtn = document.getElementById('change-avatar');
    const avatarInput = document.getElementById('avatar-input');
    
    changeAvatarBtn.addEventListener('click', () => {
        avatarInput.click();
    });
    
    const profileImageEl = document.querySelector('.delete-profile-image');
    if (profileImageEl) {
        profileImageEl.addEventListener('click', () => {
            if (confirm('Do you want to remove your profile picture?')) {
                deleteProfileImage();
            }
        });
        
        profileImageEl.style.cursor = 'pointer';
    }
    
    const deleteProfileImage = async () => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('firstName', user.firstName);
            formData.append('lastName', user.lastName);
            formData.append('removeImage', 'true');
            
            const response = await fetch('https://kelvins-assignment.onrender.com/api/users/userUpdate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showToast('Profile picture removed successfully!', 'success');
            
            renderProfilePage();
            
            document.dispatchEvent(new CustomEvent('userUpdated', {
                detail: data.user
            }));
        } catch (error) {
            showToast(error.message || 'Failed to remove profile picture. Please try again.', 'error');
        }
    };
    
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file size and type
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image too large. Please select an image under 5MB.', 'error');
            return;
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showToast('Invalid file type. Please select a JPEG, PNG, WebP or GIF image.', 'error');
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('firstName', user.firstName);
            formData.append('lastName', user.lastName);
            formData.append('image', file);
            
            changeAvatarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            changeAvatarBtn.disabled = true;
            
            const token = localStorage.getItem('token');
            const response = await fetch('https://kelvins-assignment.onrender.com/api/users/userUpdate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showToast('Profile picture updated successfully!', 'success');
            
            renderProfilePage();
            
            document.dispatchEvent(new CustomEvent('userUpdated', {
                detail: data.user
            }));
        } catch (error) {
            changeAvatarBtn.innerHTML = '<i class="fas fa-camera"></i>';
            changeAvatarBtn.disabled = false;
            
            showToast(error.message || 'Failed to update profile picture. Please try again.', 'error');
        }
    });
    
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        
        if (firstName === user.firstName && lastName === user.lastName) {
            showToast('No changes to save.', 'info');
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            const token = localStorage.getItem('token');
            const response = await fetch('https://kelvins-assignment.onrender.com/api/users/userUpdate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showToast('Profile updated successfully!', 'success');
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
            
            document.dispatchEvent(new CustomEvent('userUpdated', {
                detail: data.user
            }));
        } catch (error) {
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
            
            showToast(error.message || 'Failed to update profile. Please try again.', 'error');
        }
    });
    
    async function loadOrders() {
        const ordersSection = document.getElementById('orders-section');
        
        try {
            const response = await fetch('https://kelvins-assignment.onrender.com/api/invoices', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to load orders');
            }
            
            if (data.invoices && data.invoices.length > 0) {
                let ordersHtml = '<div class="orders-list">';
                
                data.invoices.forEach(order => {
                    ordersHtml += `
                        <div class="order-item">
                            <div class="order-header">
                                <div class="order-info">
                                    <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
                                    <div class="order-id">Order #${order._id.slice(-8)}</div>
                                    <div class="order-status status-${order.status || 'pending'}">${order.status || 'Pending'}</div>
                                </div>
                                <div class="order-summary">
                                    <div class="order-total">${formatCurrency(order.totalAmount)}</div>
                                    <div class="order-items-count">${order.items.length} item${order.items.length !== 1 ? 's' : ''}</div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                ordersHtml += '</div>';
                ordersSection.innerHTML = `<h2>My Orders</h2>${ordersHtml}`;
            } else {
                ordersSection.innerHTML = `
                    <h2>My Orders</h2>
                    <div class="no-orders">
                        <p>You haven't placed any orders yet.</p>
                        <button class="btn btn-primary" id="start-shopping">Start Shopping</button>
                    </div>
                `;
                
                document.getElementById('start-shopping')?.addEventListener('click', () => {
                    navigateTo('products');
                });
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            ordersSection.innerHTML = `
                <h2>My Orders</h2>
                <div class="error-message">
                    <p>Failed to load orders. Please try again later.</p>
                    <button class="btn btn-primary" id="retry-orders">Retry</button>
                </div>
            `;
            
            document.getElementById('retry-orders')?.addEventListener('click', () => {
                loadOrders();
            });
        }
    }
}; 