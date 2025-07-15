// Main JavaScript file for Community File Sharing

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert-dismissible');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
});

// File upload enhancements
class FileUploadManager {
    constructor() {
        this.initializeFileInputs();
        this.setupDropZone();
    }

    initializeFileInputs() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleFileSelection(e);
            });
        });
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('File size exceeds 100MB limit. Please choose a smaller file.');
            event.target.value = '';
            return;
        }

        // Show file info
        this.displayFileInfo(file, event.target);
    }

    displayFileInfo(file, input) {
        const container = input.closest('.mb-3') || input.closest('.form-group');
        if (!container) return;

        // Remove existing file info
        const existingInfo = container.querySelector('.file-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        // Create file info element
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info mt-2 p-2 bg-light rounded';
        fileInfo.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <i class="fas fa-file me-2"></i>
                    <strong>${file.name}</strong>
                    <span class="text-muted ms-2">(${this.formatFileSize(file.size)})</span>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger remove-file">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add remove functionality
        fileInfo.querySelector('.remove-file').addEventListener('click', () => {
            input.value = '';
            fileInfo.remove();
        });

        container.appendChild(fileInfo);
    }

    setupDropZone() {
        const dropZones = document.querySelectorAll('.upload-dropzone');
        dropZones.forEach(zone => {
            const fileInput = zone.querySelector('input[type="file"]') || 
                            zone.closest('form').querySelector('input[type="file"]');
            
            if (!fileInput) return;

            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, this.preventDefaults, false);
                document.body.addEventListener(eventName, this.preventDefaults, false);
            });

            // Highlight drop zone when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => {
                zone.addEventListener(eventName, () => zone.classList.add('drag-over'), false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, () => zone.classList.remove('drag-over'), false);
            });

            // Handle dropped files
            zone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files.length > 0) {
                    fileInput.files = files;
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, false);

            // Click to select files
            zone.addEventListener('click', () => fileInput.click());
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        // Create and show error alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        }
    }
}

// Search functionality
class SearchManager {
    constructor() {
        this.initializeSearch();
    }

    initializeSearch() {
        const searchInputs = document.querySelectorAll('input[name="search"]');
        searchInputs.forEach(input => {
            // Add search icon click functionality
            const searchIcon = input.parentElement.querySelector('.fa-search');
            if (searchIcon) {
                searchIcon.addEventListener('click', () => {
                    input.closest('form').submit();
                });
            }

            // Submit on Enter key
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    input.closest('form').submit();
                }
            });
        });
    }
}

// Rating system
class RatingManager {
    constructor() {
        this.initializeRatings();
    }

    initializeRatings() {
        const ratingContainers = document.querySelectorAll('.rating-stars');
        ratingContainers.forEach(container => {
            this.setupRatingInteraction(container);
        });
    }

    setupRatingInteraction(container) {
        const stars = container.querySelectorAll('label');
        const inputs = container.querySelectorAll('input[type="radio"]');

        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                this.highlightStars(stars, index + 1);
            });

            star.addEventListener('click', () => {
                inputs[index].checked = true;
                this.setRating(stars, index + 1);
            });
        });

        container.addEventListener('mouseleave', () => {
            const checkedInput = container.querySelector('input[type="radio"]:checked');
            if (checkedInput) {
                this.setRating(stars, parseInt(checkedInput.value));
            } else {
                this.clearRating(stars);
            }
        });

        // Initialize with current rating
        const checkedInput = container.querySelector('input[type="radio"]:checked');
        if (checkedInput) {
            this.setRating(stars, parseInt(checkedInput.value));
        }
    }

    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = '#dee2e6';
            }
        });
    }

    setRating(stars, rating) {
        this.highlightStars(stars, rating);
    }

    clearRating(stars) {
        stars.forEach(star => {
            star.style.color = '#dee2e6';
        });
    }
}

// Like functionality
class LikeManager {
    constructor() {
        this.initializeLikeButtons();
    }

    initializeLikeButtons() {
        const likeButtons = document.querySelectorAll('[data-file-id]');
        likeButtons.forEach(button => {
            if (button.id === 'like-btn') {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleLike(button);
                });
            }
        });
    }

    async toggleLike(button) {
        const fileId = button.dataset.fileId;
        const isLiked = button.dataset.liked === 'true';

        try {
            const response = await fetch(`/like/${fileId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update button state
                button.dataset.liked = data.liked.toString();
                button.innerHTML = `<i class="fas fa-heart me-2"></i>${data.liked ? 'Unlike' : 'Like'}`;
                
                // Update like count display
                const likeCountElement = document.getElementById('like-count');
                if (likeCountElement) {
                    likeCountElement.textContent = data.like_count;
                }

                // Add visual feedback
                button.classList.add('btn-like');
                if (data.liked) {
                    button.classList.add('liked');
                } else {
                    button.classList.remove('liked');
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showError('Failed to update like status. Please try again.');
        }
    }

    showError(message) {
        // Create and show error alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        }
    }
}

// Form validation
class FormValidator {
    constructor() {
        this.initializeForms();
    }

    initializeForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Email validation
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            }
        });

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = message;
        
        field.classList.add('is-invalid');
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Loading states
class LoadingManager {
    static showButtonLoading(button, loadingText = 'Loading...') {
        if (button.dataset.originalText) return; // Already loading
        
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${loadingText}`;
        button.disabled = true;
    }

    static hideButtonLoading(button) {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
            button.disabled = false;
        }
    }
}

// Initialize all managers
document.addEventListener('DOMContentLoaded', function() {
    new FileUploadManager();
    new SearchManager();
    new RatingManager();
    new LikeManager();
    new FormValidator();
});

// Global utility functions
window.CommunityFiles = {
    showAlert: function(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    const bsAlert = new bootstrap.Alert(alertDiv);
                    bsAlert.close();
                }
            }, 5000);
        }
    },

    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    timeAgo: function(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }
};
