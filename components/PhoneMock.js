// PhoneMock Component - Cloudfone Design Guidelines Implementation
const PhoneMock = {
  template: `
    <div class="cloudfone-login">
      <!-- Phone Input Stage -->
      <div v-if="stage === 'input'" class="login-stage">
        <div class="login-title">Phone Number</div>
        <div class="input-container">
          <input 
            ref="phoneInput"
            v-model="phone" 
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="Enter phone number"
            maxlength="15"
            @input="onPhoneInput"
            @keydown="onPhoneKeydown"
            class="cloudfone-input"
          />
        </div>
        <div class="soft-keys">
          <button class="soft-key left" @click="handleEnter" :disabled="!phone.trim()">
            Enter
          </button>
          <button class="soft-key right" @click="handlePhoneClear">
            {{ phone.trim() ? 'Clear' : 'Quit' }}
          </button>
        </div>
      </div>

      <!-- Verification Code Stage -->
      <div v-if="stage === 'code'" class="login-stage">
        <div class="login-title">Verification Code</div>
        <div class="login-subtitle">Enter 1234 (mock)</div>
        <div class="input-container">
          <input 
            ref="codeInput"
            v-model="code" 
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="Enter 6-digit code"
            maxlength="6"
            @input="onCodeInput"
            @keydown="onCodeKeydown"
            class="cloudfone-input code-input"
          />
        </div>
        <div class="soft-keys">
          <button class="soft-key left" @click="handleVerify" :disabled="code.length < 4">
            Enter
          </button>
          <button class="soft-key right" @click="handleCodeClear">
            {{ code.trim() ? 'Clear' : 'Back' }}
          </button>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="verified" class="success-message">Verification successful!</div>
      </div>
    </div>
  `,
  emits: ['verified'],
  data() {
    return {
      phone: '',
      code: '',
      stage: 'input', // input | code
      error: '',
      verified: false
    };
  },
  methods: {
    // Phone input handling
    onPhoneInput(event) {
      // Only allow numbers
      const value = event.target.value.replace(/[^0-9]/g, '');
      this.phone = value;
      event.target.value = value;
    },
    
    onPhoneKeydown(event) {
      // Only allow numbers, backspace, delete, arrow keys
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
      if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
        event.preventDefault();
      }
      
      // Handle Enter key
      if (event.key === 'Enter' && this.phone.trim()) {
        this.handleEnter();
      }
    },

    // Code input handling  
    onCodeInput(event) {
      // Only allow numbers
      const value = event.target.value.replace(/[^0-9]/g, '');
      this.code = value;
      event.target.value = value;
    },

    onCodeKeydown(event) {
      // Only allow numbers, backspace, delete, arrow keys
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
      if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
        event.preventDefault();
      }
      
      // Handle Enter key
      if (event.key === 'Enter' && this.code.length >= 4) {
        this.handleVerify();
      }
    },

    // Soft key actions
    handleEnter() {
      if (this.stage === 'input' && this.phone.trim()) {
        this.sendCode();
      } else if (this.stage === 'code' && this.code.length >= 4) {
        this.handleVerify();
      }
    },

    handlePhoneClear() {
      if (this.phone.trim()) {
        // Clear the input
        this.phone = '';
        this.$nextTick(() => {
          this.$refs.phoneInput.focus();
        });
      } else {
        // Quit - emit an event or handle app exit
        this.handleQuit();
      }
    },

    handleCodeClear() {
      if (this.code.trim()) {
        // Clear the input
        this.code = '';
        this.error = '';
        this.$nextTick(() => {
          this.$refs.codeInput.focus();
        });
      } else {
        // Back to phone input
        this.reset();
      }
    },

    handleQuit() {
      // For now, just reset to initial state
      // In a real app, this might close the app or go to main menu
      this.reset();
    },

    // Core functionality
    sendCode() {
      if (!this.phone.trim()) return;
      
      this.stage = 'code';
      this.error = '';
      this.code = '';
      this.verified = false;
      
      // Focus the code input
      this.$nextTick(() => {
        this.$refs.codeInput.focus();
      });
    },

    handleVerify() {
      if (this.code.trim() === '1234') {
        this.verified = true;
        this.error = '';
        // Emit verification success after a short delay
        setTimeout(() => {
          this.$emit('verified', { phone: this.phone });
        }, 1000);
      } else {
        this.error = 'Incorrect code (correct is 1234)';
        this.verified = false;
      }
    },

    reset() {
      this.stage = 'input';
      this.code = '';
      this.phone = '';
      this.error = '';
      this.verified = false;
      
      // Focus the phone input
      this.$nextTick(() => {
        this.$refs.phoneInput.focus();
      });
    }
  },

  mounted() {
    // Auto-focus the phone input when component is mounted
    this.$nextTick(() => {
      if (this.$refs.phoneInput) {
        this.$refs.phoneInput.focus();
      }
    });

    // Integrate with navigation service for soft keys
    if (window.navigationService) {
      window.navigationService.setCallbacks({
        onEscape: () => {
          // Left soft key - Enter action
          this.handleEnter();
        },
        onBack: () => {
          // Right soft key - Clear/Quit/Back action
          if (this.stage === 'input') {
            this.handlePhoneClear();
          } else {
            this.handleCodeClear();
          }
        }
      });
    }
  },

  beforeUnmount() {
    // Clean up navigation callbacks
    if (window.navigationService) {
      window.navigationService.setCallbacks({
        onEscape: null,
        onBack: null
      });
    }
  }
};

