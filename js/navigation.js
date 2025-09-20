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
                    if (!this.handleScrollIfNeeded(-1)) {
                        this.moveFocus(-1);
                    }
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    if (!this.handleScrollIfNeeded(1)) {
                        this.moveFocus(1);
                    }
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
                case 'SoftLeft':
                    event.preventDefault();
                    this.handleEscape();
                    break;
                case 'SoftRight':
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

    // Attempt to scroll the currently focused element if it's a scrollable container.
    // direction: -1 for up, 1 for down. Returns true if a scroll was performed.
    handleScrollIfNeeded(direction) {
        const el = this.getCurrentFocusElement();
        if (!el) return false;
        
        // Determine if element is vertically scrollable
        const style = window.getComputedStyle(el);
        const canScrollY = (style.overflowY === 'auto' || style.overflowY === 'scroll')
            && el.scrollHeight > el.clientHeight;
        if (!canScrollY) return false;
        
        const step = 32; // QVGA-friendly scroll step
        const maxScroll = el.scrollHeight - el.clientHeight;
        const prev = el.scrollTop;
        let next = prev + (direction > 0 ? step : -step);
        if (next < 0) next = 0;
        if (next > maxScroll) next = maxScroll;
        
        // If there's no change, allow focus to move out
        if (next === prev) return false;
        
        el.scrollTop = next;
        return true;
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
            'input:not(.no-focus)',
            'select:not(.no-focus)',
            'button:not([disabled]):not(.no-focus)',
            '[tabindex]:not([tabindex="-1"]):not(.no-focus)'
        ].join(',');
        
        let elements = Array.from(document.querySelectorAll(selectors));
        
        // Also check shadow DOM elements (like soft-keys)
        const softKeysElement = document.querySelector('soft-keys');
        if (softKeysElement && softKeysElement.shadowRoot) {
            const shadowElements = Array.from(softKeysElement.shadowRoot.querySelectorAll(selectors));
            // Filter out elements with no-focus class or tabindex="-1"
            const filteredShadowElements = shadowElements.filter(el => 
                !el.classList.contains('no-focus') && 
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