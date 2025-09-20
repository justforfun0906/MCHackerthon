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
                    // Don't intercept Enter in selection pages - let SelectionPage handle it
                    const isInSelectionPage = document.querySelector('.selection-page') !== null;
                    if (!isInSelectionPage) {
                        event.preventDefault();
                        this.handleEnter();
                    }
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
        // Always focus on the first element when activating
        this.focusFirstElement();
    }
    
    focusFirstElement() {
        if (this.focusableElements.length > 0) {
            this.currentFocusIndex = 0;
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
            '.modal-btn',
            '.panel-btn',
            'input:not(.no-focus):not(.no-navigation):not(.soft-key)',
            'select:not(.no-focus):not(.no-navigation):not(.soft-key)',
            'button:not([disabled]):not(.no-focus):not(.no-navigation):not(.soft-key)',
            '[tabindex]:not([tabindex="-1"]):not(.no-focus):not(.no-navigation):not(.soft-key)'
        ].join(',');
        
        let elements = Array.from(document.querySelectorAll(selectors));
        
        // Also check shadow DOM elements (like soft-keys)
        const softKeysElement = document.querySelector('soft-keys');
        if (softKeysElement && softKeysElement.shadowRoot) {
            const shadowElements = Array.from(softKeysElement.shadowRoot.querySelectorAll(selectors));
            // Filter out elements with no-focus, no-navigation, soft-key class or tabindex="-1"
            const filteredShadowElements = shadowElements.filter(el => 
                !el.classList.contains('no-focus') && 
                !el.classList.contains('no-navigation') &&
                !el.classList.contains('soft-key') &&
                el.getAttribute('tabindex') !== '-1'
            );
            elements = elements.concat(filteredShadowElements);
        }
        
        this.focusableElements = elements.filter(el => this.isElementVisible(el));
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
            // Always focus on the first element when updating
            this.focusFirstElement();
        }, 100);
    }
    
    getCurrentFocusElement() {
        if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.focusableElements.length) {
            return this.focusableElements[this.currentFocusIndex];
        }
        return null;
    }
}

// Global navigation instance
window.navigationService = new NavigationService();