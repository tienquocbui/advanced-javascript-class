import { authAPI } from '../api/apiService.js';
import { isLoggedIn, getCurrentUser } from '../utils/auth.js';
import { navigateTo } from '../utils/navigation.js';
import { showToast } from '../utils/toast.js';

export const renderProfilePage = async () => {
    const pageContainer = document.getElementById('page-container');
    
    if (!isLoggedIn()) {
        document.dispatchEvent(new CustomEvent('showLogin'));
        return;
    }
    
    const user = getCurrentUser();
    
    // Render profile page
    pageContainer.innerHTML = `
        <div class="profile-page">
            <h1>My Profile</h1>
            
            <div class="profile-content">
                <div class="profile-sidebar">
                    <div class="profile-avatar">
                        ${user.imageUrl 
                            ? `<img src="${user.imageUrl}" alt="${user.firstName}">` 
                            : `<div class="profile-initial">${user.firstName.charAt(0)}</div>`
                        }
                        <button id="change-avatar" class="change-avatar">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    
                    <div class="profile-info">
                        <h2>${user.firstName} ${user.lastName}</h2>
                        <p>${user.email}</p>
                        <p class="profile-role">${user.role || 'Customer'}</p>
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
                                <input type="text" id="firstName" class="form-input" value="${user.firstName}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="lastName" class="form-label">Last Name</label>
                                <input type="text" id="lastName" class="form-input" value="${user.lastName}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" id="email" class="form-input" value="${user.email}" disabled>
                                <p class="form-help">Email cannot be changed</p>
                            </div>
                            
                            <div class="form-group">
                                <label for="role" class="form-label">Role</label>
                                <input type="text" id="role" class="form-input" value="${user.role || 'Customer'}" disabled>
                            </div>
                            
                            <input type="file" id="avatar-input" accept="image/*" style="display: none;">
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                    
                    <div id="orders-section" class="profile-section">
                        <h2>My Orders</h2>
                        <p>Loading your orders...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    
    document.querySelectorAll('.profile-nav-item').forEach(item => {
        if (item.id === 'logout-btn') {
            item.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('logout'));
            });
        } else {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                
                if (section === 'orders') {
                    navigateTo('orders');
                    return;
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
    
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const formData = new FormData();
            formData.append('firstName', user.firstName);
            formData.append('lastName', user.lastName);
            formData.append('image', file);
            
            changeAvatarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            changeAvatarBtn.disabled = true;
            
            const response = await authAPI.updateUserProfile(formData);
            
            // Update user data in localStorage
            localStorage.setItem('user', JSON.stringify(response.user));
            
            showToast('Profile picture updated successfully!', 'success');
            
            // Reload page to show updated avatar
            renderProfilePage();
            
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
            
            const response = await authAPI.updateUserProfile(formData);
            
            localStorage.setItem('user', JSON.stringify(response.user));
            
            showToast('Profile updated successfully!', 'success');
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
            
            document.dispatchEvent(new CustomEvent('userUpdated', {
                detail: response.user
            }));
            
        } catch (error) {
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
            
            showToast(error.message || 'Failed to update profile. Please try again.', 'error');
        }
    });
}; 