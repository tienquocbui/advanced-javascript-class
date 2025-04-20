import { authAPI } from '../api/apiService.js';
import { showToast } from '../utils/toast.js';
import { getCurrentUser } from '../utils/auth.js';

const showModal = (title, content) => {
    const modalContainer = document.getElementById('modal-container');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    modalContainer.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${title}</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-content">
            ${content}
        </div>
    `;
    
    modalContainer.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
    
    const closeButton = modalContainer.querySelector('.modal-close');
    closeButton.addEventListener('click', closeModal);
    
    modalBackdrop.addEventListener('click', closeModal);
};

const closeModal = () => {
    const modalContainer = document.getElementById('modal-container');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    modalContainer.classList.add('hidden');
    modalBackdrop.classList.add('hidden');
};

export const renderLoginModal = () => {
    const content = `
        <form id="login-form">
            <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input type="email" id="email" class="form-input" required>
            </div>
            <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <input type="password" id="password" class="form-input" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
            <p class="form-footer">
                Don't have an account? <a href="#" id="show-signup">Sign up</a>
            </p>
        </form>
    `;
    
    showModal('Login', content);
    
    const loginForm = document.getElementById('login-form');
    const showSignupLink = document.getElementById('show-signup');
    
    loginForm.addEventListener('submit', handleLoginSubmit);
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderSignupModal();
    });
};

export const renderSignupModal = () => {
    const content = `
        <form id="signup-form">
            <div class="form-group">
                <label for="firstName" class="form-label">First Name</label>
                <input type="text" id="firstName" class="form-input" required>
            </div>
            <div class="form-group">
                <label for="lastName" class="form-label">Last Name</label>
                <input type="text" id="lastName" class="form-input" required>
            </div>
            <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input type="email" id="email" class="form-input" required>
            </div>
            <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <input type="password" id="password" class="form-input" required>
            </div>
            <button type="submit" class="btn btn-primary">Sign Up</button>
            <p class="form-footer">
                Already have an account? <a href="#" id="show-login">Login</a>
            </p>
        </form>
    `;
    
    showModal('Create Account', content);
    
    const signupForm = document.getElementById('signup-form');
    const showLoginLink = document.getElementById('show-login');
    
    signupForm.addEventListener('submit', handleSignupSubmit);
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderLoginModal();
    });
};

export const renderAccountModal = () => {
    const user = getCurrentUser();
    
    if (!user) {
        renderLoginModal();
        return;
    }
    
    const content = `
        <form id="profile-form">
            <div class="user-profile-header">
                <div class="user-avatar large">
                    ${user.imageUrl 
                        ? `<img src="${user.imageUrl}" alt="${user.firstName}">` 
                        : `<span>${user.firstName.charAt(0)}</span>`
                    }
                </div>
                <div>
                    <h3>${user.firstName} ${user.lastName}</h3>
                    <p>${user.email}</p>
                    <p><small>Role: ${user.role || 'Customer'}</small></p>
                </div>
            </div>
            
            <div class="form-group">
                <label for="updateFirstName" class="form-label">First Name</label>
                <input type="text" id="updateFirstName" class="form-input" value="${user.firstName}" required>
            </div>
            <div class="form-group">
                <label for="updateLastName" class="form-label">Last Name</label>
                <input type="text" id="updateLastName" class="form-input" value="${user.lastName}" required>
            </div>
            <div class="form-group">
                <label for="profileImage" class="form-label">Profile Image</label>
                <input type="file" id="profileImage" class="form-input" accept="image/*">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Update Profile</button>
                <button type="button" id="logout-btn" class="btn btn-secondary">Logout</button>
            </div>
        </form>
    `;
    
    showModal('My Account', content);
    
    const profileForm = document.getElementById('profile-form');
    const logoutButton = document.getElementById('logout-btn');
    
    profileForm.addEventListener('submit', handleProfileUpdate);
    logoutButton.addEventListener('click', () => {
        closeModal();
        document.dispatchEvent(new CustomEvent('logout'));
    });
};

const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    document.dispatchEvent(new CustomEvent('login', {
        detail: { email, password }
    }));
};

const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    document.dispatchEvent(new CustomEvent('signup', {
        detail: { firstName, lastName, email, password }
    }));
};

const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('updateFirstName').value;
    const lastName = document.getElementById('updateLastName').value;
    const profileImage = document.getElementById('profileImage').files[0];
    
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    
    if (profileImage) {
        formData.append('image', profileImage);
    }
    
    try {
        const response = await authAPI.updateUserProfile(formData);
        
        const updatedUserData = response.user;
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        closeModal();
        
        showToast('Profile updated successfully!', 'success');
        
        document.dispatchEvent(new CustomEvent('userUpdated', {
            detail: updatedUserData
        }));
    } catch (error) {
        showToast(error.message || 'Failed to update profile. Please try again.', 'error');
    }
}; 