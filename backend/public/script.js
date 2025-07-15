// DOM Elements
const shortenForm = document.getElementById('shorten-form');
const longUrlInput = document.getElementById('long-url');
const expiryDaysSelect = document.getElementById('expiry-days');
const resultContainer = document.getElementById('result-container');
const urlHistory = document.getElementById('url-history');
const alertContainer = document.getElementById('alert-container');

// Templates
const resultTemplate = document.getElementById('result-template');
const historyItemTemplate = document.getElementById('history-item-template');

// API URL - Using relative URL since we're serving from the same origin
const API_URL = '/api';

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
  // Animate container on load
  anime({
    targets: '.container',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeOutExpo',
    duration: 1000,
    delay: 300
  });
  
  // Load URL history
  loadUrlHistory();
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
  
  try {
    // Show loading state
    const submitButton = shortenForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Shortening...';
    submitButton.disabled = true;
    
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
    
    if (response.ok) {
      // Display result
      displayResult(data);
      // Refresh history
      loadUrlHistory();
      // Show success alert
      showAlert('URL shortened successfully!', 'success');
      // Clear input
      longUrlInput.value = '';
    } else {
      showAlert(data.error || 'Failed to shorten URL', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('An error occurred. Please try again.', 'error');
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
  
  // Set QR code
  qrCodeElement.src = data.qrCode;
  
  // Set download QR link
  downloadQrElement.href = data.qrCode;
  downloadQrElement.download = `qrcode-${data.urlCode}.png`;
  
  // Add copy button functionality
  const copyBtn = resultCard.querySelector('.copy-btn');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(data.shortUrl)
      .then(() => {
        showAlert('URL copied to clipboard!', 'success');
        
        // Animate copy button
        anime({
          targets: copyBtn,
          scale: [1, 1.2, 1],
          duration: 300,
          easing: 'easeInOutQuad'
        });
      })
      .catch(() => {
        showAlert('Failed to copy URL', 'error');
      });
  });
  
  // Append to container
  resultContainer.appendChild(resultCard);
  resultContainer.style.display = 'block';
  
  // Animate result card
  anime({
    targets: '.result-card',
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeOutExpo',
    duration: 800
  });
}

// Load URL history
async function loadUrlHistory() {
  try {
    const response = await fetch(`${API_URL}/urls`);
    const data = await response.json();
    
    // Clear previous history
    urlHistory.innerHTML = '';
    
    if (data.length === 0) {
      urlHistory.innerHTML = '<p class="no-history">No URLs shortened yet</p>';
      return;
    }
    
    // Display each URL in history
    data.forEach((url, index) => {
      const historyItem = document.importNode(historyItemTemplate.content, true);
      
      const shortUrlElement = historyItem.querySelector('.history-short-url');
      const longUrlElement = historyItem.querySelector('.history-long-url');
      const clicksElement = historyItem.querySelector('.clicks-count');
      const dateElement = historyItem.querySelector('.history-date');
      
      shortUrlElement.href = url.shortUrl;
      shortUrlElement.textContent = url.shortUrl.split('/').pop();
      longUrlElement.textContent = url.longUrl;
      clicksElement.textContent = url.clicks;
      
      // Format date
      const createdDate = new Date(url.createdAt);
      dateElement.textContent = createdDate.toLocaleDateString();
      
      // Add animation delay based on index
      const delay = index * 100;
      const historyItemElement = historyItem.querySelector('.history-item');
      historyItemElement.style.opacity = '0';
      historyItemElement.style.transform = 'translateY(10px)';
      
      // Append to container
      urlHistory.appendChild(historyItem);
      
      // Animate history item
      setTimeout(() => {
        historyItemElement.style.opacity = '1';
        historyItemElement.style.transform = 'translateY(0)';
        historyItemElement.style.transition = 'all 0.3s ease';
      }, delay);
    });
  } catch (error) {
    console.error('Error loading history:', error);
    urlHistory.innerHTML = '<p class="error">Failed to load URL history</p>';
  }
}

// Show alert
function showAlert(message, type) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span>${message}</span>
    <button class="alert-close">&times;</button>
  `;
  
  // Add close button functionality
  const closeBtn = alert.querySelector('.alert-close');
  closeBtn.addEventListener('click', () => {
    removeAlert(alert);
  });
  
  // Add to container
  alertContainer.appendChild(alert);
  
  // Animate alert
  anime({
    targets: alert,
    opacity: [0, 1],
    translateX: [50, 0],
    easing: 'easeOutExpo',
    duration: 500
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeAlert(alert);
  }, 5000);
}

// Remove alert with animation
function removeAlert(alert) {
  anime({
    targets: alert,
    opacity: [1, 0],
    translateX: [0, 50],
    easing: 'easeInExpo',
    duration: 500,
    complete: () => {
      alert.remove();
    }
  });
}