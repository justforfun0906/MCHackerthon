// PostForm Component (EN version)
const PostForm = {
    template: `
        <div>
            <form class="post-form" @submit.prevent="onSubmit">
                <div class="field-row">
                    <label>Region</label>
                    <select v-model="form.region" required class="region-select" @keydown="handleSelectKeydown" ref="regionSelect">
                        <option value="" disabled>Select</option>
                        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                    </select>
                </div>
                <div class="field-row">
                    <label>Store Type</label>
                    <select v-model="form.storeType" required class="store-type-select" @keydown="handleSelectKeydown" ref="storeTypeSelect">
                        <option value="" disabled>Select</option>
                        <option v-for="t in storeTypes" :key="t" :value="t">{{ t }}</option>
                    </select>
                </div>
                <div class="field-row">
                    <label>Address</label>
                    <input 
                        type="text" 
                        v-model="form.address" 
                        placeholder="Enter address" 
                        class="address-input"
                        @input="handleAddressInput"
                    />
                </div>
                <div class="field-row">
                    <label>Role</label>
                    <select v-model="form.role" required class="role-select" @keydown="handleSelectKeydown" ref="roleSelect">
                        <option value="" disabled>Select Role</option>
                        <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                    </select>
                </div>
                <div class="field-row">
                    <label>Time Slot</label>
                    <select v-model="form.time" required class="time-select" @keydown="handleSelectKeydown" ref="timeSelect">
                        <option value="" disabled>Select</option>
                        <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
                    </select>
                </div>
                <div class="field-row">
                    <label>Openings</label>
                    <input 
                        type="number" 
                        v-model.number="form.count" 
                        min="1" 
                        max="20" 
                        required 
                        class="count-input"
                        @input="handleCountInput"
                    />
                </div>
                <div class="field-row">
                    <label>Notes</label>
                    <textarea 
                        v-model="form.note" 
                        placeholder="Enter job notes..." 
                        rows="3" 
                        class="note-textarea"
                        @input="handleTextareaInput"
                        @keydown="handleTextareaKeydown"
                    ></textarea>
                </div>
            </form>
            
            <!-- Success Modal -->
            <div v-if="showSuccessModal" class="success-modal-overlay">
                <div class="success-modal">
                    <div class="success-icon">✓</div>
                    <div class="success-message">Job Posted Successfully!</div>
                </div>
            </div>
        </div>
    `,
    props: {
        userId: { type: String, default: '' },
        userKey: { type: String, default: '' },
        regions: { type: Array, default: () => [] },
        roles: { type: Array, default: () => [] },
        storeTypes: { type: Array, default: () => [] },
        timeSlots: { type: Array, default: () => [] }
    },
    emits: ['submit'],
    data() {
        return {
            form: {
                region: '',
                storeType: '',
                address: '',
                role: '',
                time: '',
                count: 1,
                note: ''
            },
            cacheKey: 'postDraft',
            cacheTimer: null,
            showSuccessModal: false
        };
    },
    methods: {
        discard() {
            try { localStorage.removeItem(this.cacheKey); } catch {}
            this.form = {
                region: '',
                storeType: '',
                address: '',
                role: '',
                time: '',
                count: 1,
                note: ''
            };
        },
        handleSelectKeydown(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                // Open the dropdown by focusing and triggering click
                const select = event.target;
                select.focus();
                // Trigger the dropdown to open
                select.click();
            }
        },
        handleConfirm() {
            // Called when confirm action is triggered
            this.onSubmit();
        },
        handleTextareaInput(event) {
            // Ensure the textarea value is properly updated
            this.form.note = event.target.value;
        },
        handleAddressInput(event) {
            // Ensure the address input value is properly updated
            this.form.address = event.target.value;
        },
        handleCountInput(event) {
            // Ensure the count input value is properly updated
            this.form.count = parseInt(event.target.value) || 1;
        },
        handleTextareaKeydown(event) {
            // Allow normal typing and navigation within textarea
            // Don't prevent default for most keys to allow normal text input
            if (event.key === 'Enter' && event.ctrlKey) {
                // Allow Ctrl+Enter to submit if needed
                event.preventDefault();
                this.handleConfirm();
            }
            // Let other keys work normally for text input
        },
        onSubmit() {
            if (!this.form.region || !this.form.storeType || !this.form.time || !this.form.role) return;
            const payload = {
                region: this.form.region,
                storeType: this.form.storeType,
                address: this.form.address,
                role: this.form.role,
                time: this.form.time,
                count: this.form.count,
                note: this.form.note
            };
            this.$emit('submit', payload);
            // Clear cache on successful submit
            try { localStorage.removeItem(this.cacheKey); } catch {}
            
            // Show success modal
            this.showSuccessModal = true;
            
            // Reset form and navigate back after modal delay
            setTimeout(() => {
                // Reset form
                this.form.region = '';
                this.form.storeType = '';
                this.form.address = '';
                this.form.role = '';
                this.form.time = '';
                this.form.count = 1;
                this.form.note = '';
                
                // Hide modal
                this.showSuccessModal = false;
                
                // Navigate back to previous page
                setTimeout(() => {
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        // Fallback: emit a navigation event for parent to handle
                        this.$emit('navigate-back');
                    }
                }, 100);
            }, 1500); // Show modal for 1.5 seconds
        }
    },
    mounted() {
        // Scope cache key by userKey (hashed)
        try { this.cacheKey = `postDraft:${this.userKey || 'anon'}`; } catch {}
        // Migrate legacy userId-scoped draft to userKey-scoped
        try {
            const legacyKey = `postDraft:${this.userId || 'anon'}`;
            const legacy = localStorage.getItem(legacyKey);
            if (legacy && !localStorage.getItem(this.cacheKey)) {
                localStorage.setItem(this.cacheKey, legacy);
                try { localStorage.removeItem(legacyKey); } catch {}
            }
        } catch {}
        // Load cached draft if any
        try {
            const raw = localStorage.getItem(this.cacheKey);
            if (raw) {
                const obj = JSON.parse(raw);
                if (obj && obj.form) {
                    this.form = { ...this.form, ...obj.form };
                }
            }
        } catch {}
        // Watch form changes and cache with debounce
        this.$watch(() => this.form, () => {
            try { if (this.cacheTimer) clearTimeout(this.cacheTimer); } catch {}
            this.cacheTimer = setTimeout(() => {
                try { localStorage.setItem(this.cacheKey, JSON.stringify({ form: this.form, ts: Date.now() })); } catch {}
            }, 300);
        }, { deep: true });
        
        // Store the original callbacks before overriding them
        if (window.navigationService) {
            this.originalCallbacks = {
                onEscape: window.navigationService.onEscapeCallback,
                onBack: window.navigationService.onBackCallback,
                onEnter: window.navigationService.onEnterCallback
            };
            
            window.navigationService.setCallbacks({
                onEscape: () => this.handleConfirm(), // LSK (Escape) triggers submit
                onBack: () => {
                    // RSK (Back) - you might want to emit a cancel event
                    this.$emit('cancel');
                },
                onEnter: () => {
                    // Center key - handled automatically by navigation service
                }
            });
            
            // Activate navigation for this form
            window.navigationService.activate();
        }
    },
    
    beforeUnmount() {
        // Restore the original navigation callbacks when component is destroyed
        if (window.navigationService && this.originalCallbacks) {
            window.navigationService.setCallbacks(this.originalCallbacks);
        } else if (window.navigationService) {
            // Fallback: clear callbacks if no original callbacks were stored
            window.navigationService.setCallbacks({
                onEscape: null,
                onBack: null,
                onEnter: null
            });
        }
    }
};
