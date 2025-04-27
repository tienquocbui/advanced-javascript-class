/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a number as currency (USD)
 * @param {number|string} value - The value to format
 * @param {string} [currencySymbol='$'] - The currency symbol to use
 * @param {string} [locale='en-US'] - The locale to use for formatting
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (value, currencySymbol = '$', locale = 'en-US') => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return `${currencySymbol}0.00`;
  }
  
  const formattedValue = numericValue.toFixed(2);
  
  return `${currencySymbol}${formattedValue}`;
};

/**
 * Format a date string or timestamp
 * @param {string|number|Date} date - The date to format
 * @param {Object} [options] - Formatting options
 * @param {string} [options.locale='en-US'] - The locale to use
 * @param {string} [options.format='short'] - Format style ('short', 'medium', 'long', 'full')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
    const { 
        locale = 'en-US',
        format = 'short'
    } = options;
    
    if (!date) {
        return '';
    }
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    
    return new Intl.DateTimeFormat(locale, {
        dateStyle: format
    }).format(dateObj);
};

export default {
    formatCurrency,
    formatDate
}; 