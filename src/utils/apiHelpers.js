/**
 * API helper utilities for consistent URL handling
 */

import { API_BASE_URL } from './api';

/**
 * Ensures all API URLs use the correct base URL
 * @param {string} urlOrPath - A URL or path to transform
 * @returns {string} - A proper URL using the correct API base
 */
export const ensureCorrectApiUrl = (urlOrPath) => {
  // If it's already a complete URL with our API base, return it
  if (urlOrPath.startsWith(API_BASE_URL)) {
    return urlOrPath;
  }
  
  // If it's a local path starting with slash, add it to the base URL
  if (urlOrPath.startsWith('/')) {
    return `${API_BASE_URL}${urlOrPath}`;
  }
  
  // If it contains localhost:8000, replace it with the API base URL
  if (urlOrPath.includes('localhost:8000')) {
    return urlOrPath.replace(/https?:\/\/localhost:8000/g, API_BASE_URL);
  }
  
  // If it's just a path without slash, add slash and append to base URL
  if (!urlOrPath.startsWith('http')) {
    return `${API_BASE_URL}/${urlOrPath}`;
  }
  
  // Return the original URL if none of the above match (external URL)
  return urlOrPath;
};

/**
 * Enhanced fetch that ensures consistent URL handling
 * @param {string} url - The URL or path to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
export const enhancedFetch = async (url, options = {}) => {
  const correctedUrl = ensureCorrectApiUrl(url);
  console.log(`Making API call to: ${correctedUrl}`);
  
  const fetchOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };
  
  return fetch(correctedUrl, fetchOptions);
};