import { authAPI } from '../api/apiService.js';
import { showToast } from '../utils/toast.js';
import { getCurrentUser } from '../utils/auth.js';

const showAuthModal = (content) => {
    const modalContainer = document.getElementById('modal-container');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    modalContainer.innerHTML = content;
    
    modalContainer.classList.remove('hidden');
    modalBackdrop.classList.remove('hidden');
    
    const closeButton = modalContainer.querySelector('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
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
        <div class="auth-modal apple-style">
            <button class="modal-close">&times;</button>
            <div class="auth-container">
                <h2>Login</h2>
                <form id="login-form">
                    <div class="form-group">
                        <input type="email" id="email" class="form-input apple-input" placeholder="Email" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="password" class="form-input apple-input" placeholder="Password" required>
                    </div>
                    <div class="remember-me">
                        <input type="checkbox" id="remember-me">
                        <label for="remember-me">Keep me signed in</label>
                    </div>
                    <button type="submit" class="btn btn-primary apple-button">Login</button>
                    <div class="auth-links">
                        <a href="#" class="forgot-password" id="forgot-password">Forgot password?</a>
                    </div>
                    <div class="auth-divider">
                        <span>or</span>
                    </div>
                    <p class="auth-alt">
                        Don't have an account? <a href="#" id="show-signup">Sign up</a>
                    </p>
                </form>
            </div>
        </div>
    `;
    
    showAuthModal(content);
    
    const loginForm = document.getElementById('login-form');
    const showSignupLink = document.getElementById('show-signup');
    const forgotPasswordLink = document.getElementById('forgot-password');
    
    loginForm.addEventListener('submit', handleLoginSubmit);
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderSignupModal();
    });
    
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast("Well you need to create a new account, I don't remember your password too ^^. I will learn more how to implement that!", 'info', 8000);
    });
};

export const renderSignupModal = () => {
    const content = `
        <div class="auth-modal apple-style">
            <button class="modal-close">&times;</button>
            <div class="auth-container">
                <h2>Create Account</h2>
                <form id="signup-form">
                    <div class="name-group">
                        <div class="form-group half">
                            <input type="text" id="firstName" class="form-input apple-input" placeholder="First Name" required>
                        </div>
                        <div class="form-group half">
                            <input type="text" id="lastName" class="form-input apple-input" placeholder="Last Name" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="email" id="email" class="form-input apple-input" placeholder="Email" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="password" class="form-input apple-input" placeholder="Password" required>
                    </div>
                    <div class="form-group role-selector">
                        <label class="role-label">Account Type</label>
                        <div class="role-options">
                            <div class="role-option">
                                <input type="radio" id="role-customer" name="role" value="customer" checked>
                                <label for="role-customer">
                                    <span class="role-icon">👤</span>
                                    <span class="role-title">Customer</span>
                                    <span class="role-desc">Shop products</span>
                                </label>
                            </div>
                            <div class="role-option">
                                <input type="radio" id="role-admin" name="role" value="admin">
                                <label for="role-admin">
                                    <span class="role-icon">👑</span>
                                    <span class="role-title">Admin</span>
                                    <span class="role-desc">Manage products</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary apple-button">Create Account</button>
                    <div class="auth-divider">
                        <span>or</span>
                    </div>
                    <p class="auth-alt">
                        Already have an account? <a href="#" id="show-login">Login</a>
                    </p>
                </form>
            </div>
        </div>
    `;
    
    showAuthModal(content);
    
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
        <div class="auth-modal apple-style">
            <button class="modal-close">&times;</button>
            <div class="auth-container">
                <h2>My Account</h2>
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
                        <input type="text" id="updateFirstName" class="form-input apple-input" value="${user.firstName}" required>
                    </div>
                    <div class="form-group">
                        <label for="updateLastName" class="form-label">Last Name</label>
                        <input type="text" id="updateLastName" class="form-input apple-input" value="${user.lastName}" required>
                    </div>
                    <div class="form-group">
                        <label for="profileImage" class="form-label">Profile Image</label>
                        <input type="file" id="profileImage" class="form-input apple-input" accept="image/*">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary apple-button">Update Profile</button>
                        <button type="button" id="logout-btn" class="btn btn-secondary">Logout</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    showAuthModal(content);
    
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
    const role = document.querySelector('input[name="role"]:checked').value;
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Creating Account...';
    submitButton.disabled = true;
    
    try {
        console.log('Signup attempt with data:', { firstName, lastName, email, password: '***', role });
        
        const result = await authAPI.signup({ firstName, lastName, email, password, role });
        console.log('Signup API response:', result);
        
        showToast('Account created successfully! You can now log in.', 'success');
        
        // Switch to login modal
        renderLoginModal();
    } catch (error) {
        console.error('Signup error:', error);
        showToast(error.message || 'Signup failed. Please try again.', 'error');
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
};

const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const updateButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = updateButton.textContent;
    updateButton.textContent = 'Updating...';
    updateButton.disabled = true;
    
    const firstName = document.getElementById('updateFirstName').value;
    const lastName = document.getElementById('updateLastName').value;
    const profileImage = document.getElementById('profileImage').files[0];
    
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    
    if (profileImage) {
        if (profileImage.size > 5 * 1024 * 1024) {
            updateButton.textContent = originalButtonText;
            updateButton.disabled = false;
            showToast('Image too large. Please select an image under 5MB.', 'error');
            return;
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(profileImage.type)) {
            updateButton.textContent = originalButtonText;
            updateButton.disabled = false;
            showToast('Invalid file type. Please select a JPEG, PNG, WebP or GIF image.', 'error');
            return;
        }
        
        formData.append('image', profileImage);
        console.log('Adding image to form data:', profileImage.name, profileImage.type, profileImage.size);
    }
    
    try {
        console.log('Submitting profile update with data:', 
            { firstName, lastName, hasImage: !!profileImage });
        
        const response = await authAPI.updateUserProfile(formData);
        
        const updatedUserData = response.user;
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        closeModal();
        
        showToast('Profile updated successfully!', 'success');
        
        document.dispatchEvent(new CustomEvent('userUpdated', {
            detail: updatedUserData
        }));
    } catch (error) {
        console.error('Profile update error:', error);
        showToast(error.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
        updateButton.textContent = originalButtonText;
        updateButton.disabled = false;
    }
}; 