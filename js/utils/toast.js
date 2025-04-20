// Initialize toast container
export const initToast = () => {
    const toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        console.error('Toast container not found in the DOM');
    }
};

/**
 * Show a toast notification
 * @param {string} message
 * @param {string} type 
 * @param {number} duration 
 */
export const showToast = (message, type = 'info', duration = 3000) => {
    // Also log to console for debugging
    console.log(`TOAST [${type}]: ${message}`);
    
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}; 