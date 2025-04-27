import { productsAPI } from '../api/apiService.js';
import { showToast } from '../utils/toast.js';
import { navigateTo } from '../utils/navigation.js';
import { isLoggedIn, getCurrentUser } from '../utils/auth.js';

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

export const renderProductForm = (product = null) => {
    if (!isLoggedIn()) {
        showToast('You must be logged in to create or edit products', 'error');
        return;
    }
    
    const currentUser = getCurrentUser();
    if (currentUser.role !== 'admin') {
        showToast('Only administrators can create or edit products', 'error');
        return;
    }
    
    const isEdit = !!product;
    const title = isEdit ? 'Edit Product' : 'Create New Product';
    
    const content = `
        <form id="product-form">
            <div class="form-group">
                <label for="title" class="form-label">Product Title</label>
                <input type="text" id="title" class="form-input" value="${isEdit ? product.title : ''}" required>
            </div>
            <div class="form-group">
                <label for="price" class="form-label">Price</label>
                <input type="number" id="price" class="form-input" step="0.01" min="0" value="${isEdit ? product.price : ''}" required>
            </div>
            <div class="form-group">
                <label for="description" class="form-label">Description</label>
                <textarea id="description" class="form-input" rows="4" required>${isEdit ? product.description : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="productImage" class="form-label">Product Image</label>
                <input type="file" id="productImage" class="form-input" accept="image/*">
                ${isEdit && product.imageUrl ? `<div class="current-image"><img src="${product.imageUrl}" alt="${product.title}" style="max-width: 100px; margin-top: 10px;"></div>` : ''}
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${isEdit ? 'Update Product' : 'Create Product'}</button>
                <button type="button" id="cancel-btn" class="btn btn-secondary">Cancel</button>
            </div>
        </form>
    `;
    
    showModal(title, content);
    
    const productForm = document.getElementById('product-form');
    const cancelButton = document.getElementById('cancel-btn');
    
    productForm.addEventListener('submit', (e) => handleProductSubmit(e, product?._id));
    cancelButton.addEventListener('click', closeModal);
};

const handleProductSubmit = async (e, productId = null) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const description = document.getElementById('description').value.trim();
    const productImage = document.getElementById('productImage').files[0];
    
    // Input validation
    if (!title || !price || !description) {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        showToast('Please fill out all required fields', 'error');
        return;
    }
    
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('description', description);
    
    if (productImage) {
        // Validate image size and type
        if (productImage.size > 5 * 1024 * 1024) {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            showToast('Image too large. Please select an image under 5MB.', 'error');
            return;
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(productImage.type)) {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            showToast('Invalid file type. Please select a JPEG, PNG, WebP or GIF image.', 'error');
            return;
        }
        
        formData.append('image', productImage);
    }
    
    try {
        console.log('Submitting product with data:', { 
            title, price, description, 
            hasImage: !!productImage 
        });
        
        let response;
        if (productId) {
            // Update existing product
            formData.append('productId', productId);
            response = await productsAPI.updateProduct(productId, formData);
            showToast('Product updated successfully!', 'success');
        } else {
            // Create new product
            response = await productsAPI.createProduct(formData);
            showToast('Product created successfully!', 'success');
        }
        
        closeModal();
        
        // Refresh the page to show the new product
        navigateTo('products');
        
        // Dispatch event to notify that a product was created or updated
        document.dispatchEvent(new CustomEvent('productUpdated', {
            detail: response.product
        }));
    } catch (error) {
        console.error('Product submission error:', error);
        showToast(error.message || 'Failed to save product. Please try again.', 'error');
    } finally {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}; 