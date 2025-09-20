// D-pad navigation service for Cloudfone QVGA
class NavigationService {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = 0;
        this.isActive = false;
        this.onEnterCallback = null;
        this.onEscapeCallback = null;
        this.onBackCallback = null;
        
        this.setupKeyListeners();
    }
    
    setupKeyListeners() {
        document.addEventListener('keydown', (event) => {
            if (!this.isActive) return;
            
            switch(event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.moveFocus(-1);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.moveFocus(1);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.handleHorizontalMove(-1);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.handleHorizontalMove(1);
                    break;
                case 'Enter':
                    event.preventDefault();
                    this.handleEnter();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.handleEscape();
                    break;
                case 'F12':
                    event.preventDefault();
                    this.handleBack();
                    break;
            }
        });
        
        // Handle back event for Right Soft Key
        window.addEventListener('back', (event) => {
            if (this.onBackCallback) {
                event.preventDefault();
                this.onBackCallback();
            }
        });
    }
    
    activate() {
        this.isActive = true;
        this.refreshFocusableElements();
        if (this.focusableElements.length > 0) {
            this.setFocus(0);
        }
    }
    
    deactivate() {
        this.isActive = false;
        this.clearFocus();
    }
    
    refreshFocusableElements() {
        // Get all focusable elements in the main content area
        const selectors = [
            '.job-item',
            '.nav-btn',
            '.modal-btn',
            '.panel-btn',
            'input',
            'select',
            'button:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');
        
        this.focusableElements = Array.from(document.querySelectorAll(selectors))
            .filter(el => this.isElementVisible(el));
    }
    
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               getComputedStyle(element).visibility !== 'hidden' &&
               getComputedStyle(element).display !== 'none';
    }
    
    moveFocus(direction) {
        if (this.focusableElements.length === 0) return;
        
        this.currentFocusIndex += direction;
        
        // Wrap around
        if (this.currentFocusIndex >= this.focusableElements.length) {
            this.currentFocusIndex = 0;
        } else if (this.currentFocusIndex < 0) {
            this.currentFocusIndex = this.focusableElements.length - 1;
        }
        
        this.setFocus(this.currentFocusIndex);
    }
    
    handleHorizontalMove(direction) {
        // For grid navigation, try to move horizontally within a row
        // For now, just treat as vertical movement
        this.moveFocus(direction);
    }
    
    setFocus(index) {
        this.clearFocus();
        
        if (index >= 0 && index < this.focusableElements.length) {
            const element = this.focusableElements[index];
            element.classList.add('dpad-focus');
            // Restore scrollIntoView for scrollable areas
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            this.currentFocusIndex = index;
        }
    }
    
    clearFocus() {
        document.querySelectorAll('.dpad-focus').forEach(el => {
            el.classList.remove('dpad-focus');
        });
    }
    
    handleEnter() {
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
            const element = this.focusableElements[this.currentFocusIndex];
            element.click();
        }
        
        if (this.onEnterCallback) {
            this.onEnterCallback();
        }
    }
    
    handleEscape() {
        if (this.onEscapeCallback) {
            this.onEscapeCallback();
        }
    }
    
    handleBack() {
        if (this.onBackCallback) {
            this.onBackCallback();
        }
    }
    
    setCallbacks(callbacks) {
        this.onEnterCallback = callbacks.onEnter;
        this.onEscapeCallback = callbacks.onEscape;
        this.onBackCallback = callbacks.onBack;
    }
    
    updateFocusableElements() {
        // Call this when the DOM changes
        setTimeout(() => {
            this.refreshFocusableElements();
            // Ensure current focus is still valid
            if (this.currentFocusIndex >= this.focusableElements.length) {
                this.currentFocusIndex = Math.max(0, this.focusableElements.length - 1);
                this.setFocus(this.currentFocusIndex);
            }
        }, 100);
    }
}

// Global navigation instance
window.navigationService = new NavigationService();