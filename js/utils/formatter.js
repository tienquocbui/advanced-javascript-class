/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a number as currency
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
  
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
  
  return formatted.replace(/\$|USD/, currencySymbol);
};

/**
 * Format a date string or timestamp
 * @param {string|number|Date} date 
 * @param {Object} [options] 
 * @param {string} [options.locale='en-US'] 
 * @param {string} [options.format='short']
 * @returns {string} 
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