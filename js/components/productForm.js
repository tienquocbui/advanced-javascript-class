import { productsAPI } from '../api/apiService.js';
import { showToast } from '../utils/toast.js';
import { navigateTo } from '../utils/navigation.js';
import { isLoggedIn, getCurrentUser } from '../utils/auth.js';

const showModal = (title, content) => {
    const modalContainer = document.getElementById('modal-container');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    modalContainer.classList.add('apple-style');
    
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
    
    modalContainer.classList.remove('apple-style');
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
    
    let displayImageUrl = product?.imageUrl || '';
    if (displayImageUrl.includes('postimg.cc')) {
        displayImageUrl = 'https://i.postimg.cc/BjSDrq9k/temp-Image-ki7-Rwh.jpg';
    }
    
    const isEdit = !!product;
    const title = isEdit ? 'Edit Product' : 'Create New Product';
    
    const content = `
        <div class="auth-container">
            <form id="product-form">
                <div class="form-group">
                    <label for="title" class="form-label">Product Title</label>
                    <input type="text" id="title" class="apple-input" value="${isEdit ? product.title : ''}" required placeholder="Enter product title">
                </div>
                
                <div class="form-group">
                    <label for="price" class="form-label">Price ($)</label>
                    <input type="number" id="price" class="apple-input" step="0.01" min="0" value="${isEdit ? product.price : ''}" required placeholder="0.00">
                </div>
                
                <div class="form-group">
                    <label for="description" class="form-label">Description</label>
                    <textarea id="description" class="apple-input" rows="4" required placeholder="Enter product description">${isEdit ? product.description : ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="productImage" class="form-label">Product Image (Optional)</label>
                    <p class="form-help" style="margin-bottom: 8px;">If no image is selected, a default image will be used</p>
                    <input type="file" id="productImage" class="apple-input" accept="image/*" style="padding-top: 10px;">
                    ${displayImageUrl ? `
                    <div class="current-image">
                        <img src="${displayImageUrl}" alt="${product?.title || 'Product'}" style="max-width: 100px; margin-top: 10px; border-radius: 8px;">
                        ${isEdit ? `<button type="button" id="remove-image" class="btn btn-secondary" style="margin-top: 5px; display: block; padding: 5px 10px; font-size: 0.8rem;">Remove Image</button>` : ''}
                    </div>` : ''}
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="apple-button">${isEdit ? 'Update Product' : 'Create Product'}</button>
                    ${isEdit ? `<button type="button" id="delete-product" class="btn btn-secondary" style="margin-top: 10px; width: 100%; background: rgba(255, 0, 0, 0.7); color: white;">Delete Product</button>` : ''}
                    <button type="button" id="cancel-btn" class="btn btn-secondary" style="margin-top: 10px; width: 100%; background: rgba(60, 60, 67, 0.2);">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(title, content);
    
    const productForm = document.getElementById('product-form');
    const cancelButton = document.getElementById('cancel-btn');
    const removeImageBtn = document.getElementById('remove-image');
    const deleteProductBtn = document.getElementById('delete-product');
    
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentImageDiv = document.querySelector('.current-image');
            if (currentImageDiv) {
                currentImageDiv.remove();
            }
            
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.id = 'removeImage';
            hiddenField.value = 'true';
            productForm.appendChild(hiddenField);
        });
    }
    
    if (deleteProductBtn) {
        deleteProductBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
                try {
                    deleteProductBtn.textContent = 'Deleting...';
                    deleteProductBtn.disabled = true;
                    
                    await fetch(`https://kelvins-assignment.onrender.com/api/products/${product._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    closeModal();
                    showToast('Product deleted successfully!', 'success');
                    navigateTo('products');
                } catch (error) {
                    console.error('Failed to delete product:', error);
                    showToast('Failed to delete product. Please try again.', 'error');
                    deleteProductBtn.textContent = 'Delete Product';
                    deleteProductBtn.disabled = false;
                }
            }
        });
    }
    
    productForm.addEventListener('submit', (e) => handleProductSubmit(e, product?._id));
    cancelButton.addEventListener('click', closeModal);
};

const handleProductSubmit = async (e, productId = null) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    try {
        const title = document.getElementById('title').value.trim();
        const price = document.getElementById('price').value.trim();
        const description = document.getElementById('description').value.trim();
        const productImage = document.getElementById('productImage').files[0];
        const shouldRemoveImage = document.getElementById('removeImage')?.value === 'true';
        
        if (!title || !price || !description) {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            showToast('Please fill out all required fields', 'error');
            return;
        }
        
        const numericPrice = parseFloat(price).toFixed(2);
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('price', numericPrice);
        formData.append('description', description);
        formData.append('category', 'general');
        
        if (shouldRemoveImage) {
            formData.append('removeImage', 'true');
        } else if (productImage) {
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
        } else if (!productId) {
            formData.append('imageUrl', '/assets/product.png');
        }
        
        console.log('Submitting product with data:', { 
            title, 
            price: numericPrice, 
            description, 
            category: 'general',
            hasImage: !!productImage,
            removeImage: shouldRemoveImage
        });
        
        let response;
        if (productId) {
            formData.append('productId', productId);
            response = await productsAPI.updateProduct(productId, formData);
            showToast('Product updated successfully!', 'success');
        } else {
            response = await productsAPI.createProduct(formData);
            showToast('Product created successfully!', 'success');
        }
        
        closeModal();
        navigateTo('products');
        
        document.dispatchEvent(new CustomEvent('productUpdated', {
            detail: response.product
        }));
    } catch (error) {
        console.error('Product submission error:', error);
        showToast(error.message || 'Failed to save product. Please try again.', 'error');
        
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}; 