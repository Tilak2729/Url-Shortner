// DOM Elements
const shortenForm = document.getElementById('shorten-form');
const longUrlInput = document.getElementById('long-url');
const expiryDaysSelect = document.getElementById('expiry-days');
const resultContainer = document.getElementById('result-container');
const urlHistory = document.getElementById('url-history');
const alertContainer = document.getElementById('alert-container');
const themeToggle = document.getElementById('theme-toggle');

// Templates
const resultTemplate = document.getElementById('result-template');
const historyItemTemplate = document.getElementById('history-item-template');

// API URL
// Dynamic API URL that works in both development and production
let API_URL;

// For production deployment
if (window.location.hostname !== 'localhost' && 
    !window.location.hostname.startsWith('192.168.')) {
  // When deployed, use the Render backend URL
  API_URL = 'https://url-shortner-r3s5.onrender.com';
} else {
  // For local development
  API_URL = 'http://192.168.29.52:5001/api';
}

// Local storage keys
const STORAGE_KEY = 'urlShortenerHistory';
const THEME_KEY = 'urlShortenerTheme';

// Theme Toggle Functionality
function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (!prefersDark) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  // Update toggle button state
  updateThemeToggleState();
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Apply theme with animation
  document.documentElement.style.transition = 'all 0.3s ease';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Save theme preference
  localStorage.setItem(THEME_KEY, newTheme);
  
  // Update toggle button state
  updateThemeToggleState();
  
  // Animate theme toggle button
  anime({
    targets: themeToggle,
    rotate: [0, 360],
    scale: [1, 1.1, 1],
    duration: 500,
    easing: 'easeOutBack'
  });
  
  // Show theme change notification
  showAlert(`Switched to ${newTheme} theme`, 'success');
  
  // Remove transition after animation
  setTimeout(() => {
    document.documentElement.style.transition = '';
  }, 300);
}

function updateThemeToggleState() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const moonIcon = themeToggle.querySelector('.fa-moon');
  const sunIcon = themeToggle.querySelector('.fa-sun');
  
  if (currentTheme === 'light') {
    moonIcon.style.opacity = '0';
    moonIcon.style.transform = 'rotate(-180deg)';
    sunIcon.style.opacity = '1';
    sunIcon.style.transform = 'rotate(0deg)';
  } else {
    moonIcon.style.opacity = '1';
    moonIcon.style.transform = 'rotate(0deg)';
    sunIcon.style.opacity = '0';
    sunIcon.style.transform = 'rotate(180deg)';
  }
}

// Initialize theme and animations
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initializeTheme();
  
  // Add theme toggle event listener
  themeToggle.addEventListener('click', toggleTheme);
  
  // Animate container on load
  anime({
    targets: '.container',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeOutExpo',
    duration: 1000,
    delay: 300
  });
  
  // Animate theme toggle button
  anime({
    targets: themeToggle,
    scale: [0, 1],
    rotate: [180, 0],
    duration: 800,
    easing: 'easeOutBack',
    delay: 500
  });
  
  // Load URL history from backend
  loadUrlHistory();
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem(THEME_KEY)) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    updateThemeToggleState();
  }
});

// Form submission
shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const longUrl = longUrlInput.value.trim();
  const expiryDays = expiryDaysSelect.value;
  
  if (!longUrl) {
    showAlert('Please enter a valid URL', 'error');
    return;
  }
  
  // Validate URL format
  if (!isValidUrl(longUrl)) {
    showAlert('Please enter a valid URL (include http:// or https://)', 'error');
    return;
  }
  
  try {
    // Show loading state
    const submitButton = shortenForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Shortening...';
    submitButton.disabled = true;
    
    // Animate submit button
    anime({
      targets: submitButton,
      scale: [1, 0.95],
      duration: 100,
      easing: 'easeInOutQuad'
    });
    
    // Call API to shorten URL
    const response = await fetch(`${API_URL}/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ longUrl, expiryDays })
    });
    
    const data = await response.json();
    
    // Reset form state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    
    // Reset button animation
    anime({
      targets: submitButton,
      scale: [0.95, 1],
      duration: 200,
      easing: 'easeOutQuad'
    });
    
    if (response.ok) {
      // Display result
      displayResult(data);
      // Save to local storage as backup
      saveToLocalStorage(data);
      // Refresh history from backend
      loadUrlHistory();
      // Show success alert
      showAlert('URL shortened successfully!', 'success');
      // Clear input with animation
      anime({
        targets: longUrlInput,
        scale: [1, 1.02, 1],
        duration: 300,
        easing: 'easeOutQuad',
        complete: () => {
          longUrlInput.value = '';
        }
      });
    } else {
      showAlert(data.error || 'Failed to shorten URL', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    // Reset form state on error
    const submitButton = shortenForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Shorten';
    submitButton.disabled = false;
    
    anime({
      targets: submitButton,
      scale: [0.95, 1],
      duration: 200,
      easing: 'easeOutQuad'
    });
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showAlert('Cannot connect to server. Please check your connection.', 'error');
    } else {
      showAlert('An error occurred. Please try again.', 'error');
    }
  }
});

// Display shortened URL result
function displayResult(data) {
  // Clear previous results
  resultContainer.innerHTML = '';
  
  // Clone template
  const resultCard = document.importNode(resultTemplate.content, true);
  
  // Set data
  const shortUrlElement = resultCard.querySelector('.short-url');
  const originalUrlElement = resultCard.querySelector('.original-url');
  const expiryDaysElement = resultCard.querySelector('.expiry-days');
  const qrCodeElement = resultCard.querySelector('.qr-code');
  const qrLoadingElement = resultCard.querySelector('.qr-loading');
  const downloadQrElement = resultCard.querySelector('.download-qr');
  
  shortUrlElement.href = data.shortUrl;
  shortUrlElement.textContent = data.shortUrl;
  originalUrlElement.textContent = data.longUrl;
  
  // Calculate days until expiry
  const expiryDate = new Date(data.expiresAt);
  const currentDate = new Date();
  const diffTime = Math.abs(expiryDate - currentDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  expiryDaysElement.textContent = `${diffDays} days`;
  
  // Set QR code with loading animation (if elements exist)
  if (qrLoadingElement && qrCodeElement) {
    qrCodeElement.onload = () => {
      // Hide loading spinner
      anime({
        targets: qrLoadingElement,
        opacity: [1, 0],
        scale: [1, 0.8],
        duration: 500,
        easing: 'easeInExpo',
        complete: () => {
          qrLoadingElement.style.display = 'none';
        }
      });
      
      // Show QR code with animation
      qrCodeElement.classList.add('loaded');
      anime({
        targets: qrCodeElement,
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 800,
        easing: 'easeOutBack',
        delay: 200
      });
    };
  }
  
  // Set QR code
  if (qrCodeElement) {
    qrCodeElement.src = data.qrCode;
  }
  
  // Set download QR link
  if (downloadQrElement) {
    downloadQrElement.href = data.qrCode;
    downloadQrElement.download = `qrcode-${data.urlCode}.png`;
  }
  
  // Add copy button functionality
  const copyBtn = resultCard.querySelector('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      copyToClipboard(data.shortUrl, copyBtn);
    });
  }
  
  // Append to container
  resultContainer.appendChild(resultCard);
  
  // Show result container
  resultContainer.style.display = 'block';
  
  // Animate result card
  anime({
    targets: resultContainer.querySelector('.result-card'),
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 600,
    easing: 'easeOutExpo'
  });
}

// Copy to clipboard function
function copyToClipboard(text, button) {
  // Create a temporary input element
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  
  try {
    // Try the modern clipboard API first
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          showAlert('URL copied to clipboard!', 'success');
          document.body.removeChild(tempInput);
          
          // Animate copy button
          anime({
            targets: button,
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0],
            duration: 300,
            easing: 'easeInOutQuad'
          });
        })
        .catch(() => {
          // Fallback to document.execCommand
          fallbackCopy(tempInput, button);
        });
    } else {
      // Fallback for older browsers
      fallbackCopy(tempInput, button);
    }
  } catch (err) {
    console.error('Copy failed:', err);
    showAlert('Failed to copy URL', 'error');
    document.body.removeChild(tempInput);
  }
}

// Fallback copy function
function fallbackCopy(tempInput, button) {
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    if (successful) {
      showAlert('URL copied to clipboard!', 'success');
      
      // Animate copy button
      anime({
        targets: button,
        scale: [1, 1.2, 1],
        rotate: [0, 360, 0],
        duration: 300,
        easing: 'easeInOutQuad'
      });
    } else {
      showAlert('Failed to copy URL', 'error');
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    showAlert('Failed to copy URL', 'error');
    document.body.removeChild(tempInput);
  }
}

// Load URL history from backend (primary source)
async function loadUrlHistory() {
  try {
    const response = await fetch(`${API_URL}/urls`);
    const data = await response.json();
    
    // Clear previous history
    urlHistory.innerHTML = '';
    
    if (data.length === 0) {
      urlHistory.innerHTML = '<div class="no-history">No URLs shortened yet</div>';
      return;
    }
    
    // Display each URL in history
    data.forEach((url, index) => {
      const historyItem = createHistoryItem(url, index, true); // true indicates backend data
      urlHistory.appendChild(historyItem);
    });
    
    // Animate history items
    anime({
      targets: '.history-item',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 400,
      delay: anime.stagger(100),
      easing: 'easeOutExpo'
    });
    
  } catch (error) {
    console.error('Error loading history from backend:', error);
    // Fallback to localStorage if backend fails
    loadFromLocalStorage();
  }
}

// Create history item element
function createHistoryItem(data, index, isBackendData = false) {
  const historyItem = document.importNode(historyItemTemplate.content, true);
  
  const shortUrlElement = historyItem.querySelector('.history-short-url');
  const longUrlElement = historyItem.querySelector('.history-long-url');
  const clicksElement = historyItem.querySelector('.clicks-count');
  const dateElement = historyItem.querySelector('.history-date');
  const deleteBtn = historyItem.querySelector('.delete-btn');
  
  shortUrlElement.href = data.shortUrl;
  shortUrlElement.textContent = isBackendData ? data.shortUrl.split('/').pop() : data.shortUrl;
  longUrlElement.textContent = data.longUrl;
  clicksElement.textContent = data.clicks || 0;
  
  // Format date
  const createdDate = new Date(data.createdAt);
  dateElement.textContent = isBackendData ? createdDate.toLocaleDateString() : formatDate(data.createdAt);
  
  // Add delete functionality
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (isBackendData) {
        // Delete from backend
        try {
          if (!confirm('Are you sure you want to delete this URL?')) {
            return;
          }
          
          // Animate delete button
          anime({
            targets: deleteBtn,
            scale: [1, 0.8],
            rotate: [0, 180],
            duration: 200,
            easing: 'easeInQuad'
          });
          
          const response = await fetch(`${API_URL}/url/${data._id}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            // Remove item with animation
            const historyItemElement = historyItem.querySelector('.history-item') || 
                                     deleteBtn.closest('.history-item');
            
            anime({
              targets: historyItemElement,
              opacity: [1, 0],
              height: [historyItemElement.offsetHeight, 0],
              marginTop: [null, 0],
              marginBottom: [null, 0],
              paddingTop: [null, 0],
              paddingBottom: [null, 0],
              easing: 'easeOutExpo',
              duration: 500,
              complete: () => {
                historyItemElement.remove();
                
                // Show empty message if no items left
                if (urlHistory.children.length === 0) {
                  urlHistory.innerHTML = '<div class="no-history">No URLs shortened yet</div>';
                }
              }
            });
            
            showAlert('URL deleted successfully', 'success');
          } else {
            const errorData = await response.json();
            showAlert(errorData.error || 'Failed to delete URL', 'error');
            
            // Reset delete button animation
            anime({
              targets: deleteBtn,
              scale: [0.8, 1],
              rotate: [180, 0],
              duration: 200,
              easing: 'easeOutQuad'
            });
          }
        } catch (error) {
          console.error('Error deleting URL:', error);
          showAlert('An error occurred while deleting the URL', 'error');
          
          // Reset delete button animation
          anime({
            targets: deleteBtn,
            scale: [0.8, 1],
            rotate: [180, 0],
            duration: 200,
            easing: 'easeOutQuad'
          });
        }
      } else {
        // Delete from localStorage
        deleteFromLocalStorage(index);
      }
    });
  }
  
  // Add copy functionality to short URL
  shortUrlElement.addEventListener('click', (e) => {
    e.preventDefault();
    copyToClipboard(data.shortUrl, shortUrlElement);
  });
  
  return historyItem;
}

// Save URL to localStorage (as backup)
function saveToLocalStorage(data) {
  try {
    const history = getLocalStorageHistory();
    const newItem = {
      shortUrl: data.shortUrl,
      longUrl: data.longUrl,
      urlCode: data.urlCode,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt || new Date().toISOString(),
      clicks: 0
    };
    
    // Add to beginning of array
    history.unshift(newItem);
    
    // Keep only last 10 items
    if (history.length > 10) {
      history.splice(10);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Get history from localStorage
function getLocalStorageHistory() {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
}

// Load from localStorage (fallback)
function loadFromLocalStorage() {
  const history = getLocalStorageHistory();
  urlHistory.innerHTML = '';
  
  if (history.length === 0) {
    urlHistory.innerHTML = '<div class="no-history">No URLs shortened yet (offline mode)</div>';
    return;
  }
  
  history.forEach((item, index) => {
    const historyItem = createHistoryItem(item, index, false);
    urlHistory.appendChild(historyItem);
  });
  
  // Animate history items
  anime({
    targets: '.history-item',
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 400,
    delay: anime.stagger(100),
    easing: 'easeOutExpo'
  });
}

// Delete item from localStorage
function deleteFromLocalStorage(index) {
  try {
    const history = getLocalStorageHistory();
    history.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    loadFromLocalStorage();
    showAlert('URL deleted from history', 'success');
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    showAlert('Failed to delete URL', 'error');
  }
}

// Show alert function
function showAlert(message, type) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span>${message}</span>
    <button class="alert-close">&times;</button>
  `;
  
  // Add close functionality
  const closeBtn = alert.querySelector('.alert-close');
  closeBtn.addEventListener('click', () => {
    hideAlert(alert);
  });
  
  // Add to container
  alertContainer.appendChild(alert);
  
  // Animate in
  anime({
    targets: alert,
    opacity: [0, 1],
    translateX: [50, 0],
    scale: [0.8, 1],
    duration: 400,
    easing: 'easeOutExpo'
  });
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    hideAlert(alert);
  }, 5000);
}

// Hide alert function
function hideAlert(alert) {
  anime({
    targets: alert,
    opacity: [1, 0],
    translateX: [0, 50],
    scale: [1, 0.8],
    duration: 300,
    easing: 'easeInExpo',
    complete: () => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }
  });
}

// URL validation function
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Format date function
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

// Fetch URL analytics (if API supports it)
async function fetchUrlAnalytics(urlCode) {
  try {
    const response = await fetch(`${API_URL}/analytics/${urlCode}`);
    if (response.ok) {
      const data = await response.json();
      return data.clicks || 0;
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
  return 0;
}

// Update clicks count in history
async function updateClicksCount() {
  try {
    // This will refresh the entire history from backend which includes updated click counts
    loadUrlHistory();
  } catch (error) {
    console.error('Error updating clicks count:', error);
  }
}

// Periodically update clicks count (every 30 seconds)
setInterval(updateClicksCount, 30000);

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to submit form
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    shortenForm.dispatchEvent(new Event('submit'));
  }
  
  // Escape to close alerts
  if (e.key === 'Escape') {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => hideAlert(alert));
  }
  
  // Ctrl/Cmd + D to toggle theme
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    toggleTheme();
  }
});

// Handle focus and blur events for better UX
longUrlInput.addEventListener('focus', () => {
  anime({
    targets: longUrlInput,
    scale: [1, 1.02],
    duration: 200,
    easing: 'easeOutQuad'
  });
});

longUrlInput.addEventListener('blur', () => {
  anime({
    targets: longUrlInput,
    scale: [1.02, 1],
    duration: 200,
    easing: 'easeOutQuad'
  });
});

// Handle paste events
longUrlInput.addEventListener('paste', (e) => {
  // Small delay to allow paste to complete
  setTimeout(() => {
    const pastedText = longUrlInput.value.trim();
    if (pastedText && !isValidUrl(pastedText)) {
      // Try to add protocol if missing
      if (!pastedText.startsWith('http://') && !pastedText.startsWith('https://')) {
        longUrlInput.value = 'https://' + pastedText;
        
        // Animate input to show the change
        anime({
          targets: longUrlInput,
          scale: [1, 1.05, 1],
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    }
  }, 100);
});

// Enhanced hover effects for theme toggle
themeToggle.addEventListener('mouseenter', () => {
  anime({
    targets: themeToggle,
    scale: [1, 1.1],
    duration: 200,
    easing: 'easeOutQuad'
  });
});

themeToggle.addEventListener('mouseleave', () => {
  anime({
    targets: themeToggle,
    scale: [1.1, 1],
    duration: 200,
    easing: 'easeOutQuad'
  });
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Handle online/offline status
window.addEventListener('online', () => {
  showAlert('Connection restored', 'success');
  loadUrlHistory(); // Refresh from backend when back online
});

window.addEventListener('offline', () => {
  showAlert('Working offline', 'error');
});

// Initialize scroll animations for better UX
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 600,
          easing: 'easeOutExpo'
        });
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe elements that should animate on scroll
  document.querySelectorAll('.history-item, .result-card').forEach(el => {
    observer.observe(el);
  });
}

// Call scroll animations after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeScrollAnimations, 1000);
});
