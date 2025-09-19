// PhoneLogin Component - Firebase Phone Auth (compat) [EN version]
const PhoneLogin = {
  template: `
    <div class="job-section">
      <div class="section-title">Phone Sign-in</div>
      <div class="job-item">
        <div v-if="step === 'phone'">
          <input
            type="tel"
            v-model="phone"
            placeholder="Enter phone number with country code (e.g., +886912345678)"
            style="width:100%;font-size:6px;padding:2px;"
          />
          <div id="recaptcha-container" style="margin:6px 0;"></div>
          <div class="actions">
            <button class="modal-btn" :disabled="busy || !phone" @click="sendCode">Send verification code</button>
          </div>
        </div>
        <div v-else>
          <div style="font-size:6px;margin-bottom:4px;">We sent an SMS to: {{ phone }}</div>
          <input
            type="text"
            v-model="code"
            placeholder="Enter 6-digit code"
            style="width:100%;font-size:6px;padding:2px;letter-spacing:2px;"
          />
          <div class="actions">
            <button class="modal-btn" :disabled="busy || code.length < 6" @click="verifyCode">Verify & Sign in</button>
            <button class="modal-btn" :disabled="busy" @click="reset">Back to phone</button>
          </div>
        </div>
        <div v-if="error" style="color:#c00;font-size:6px;margin-top:4px;">{{ error }}</div>
      </div>
    </div>
  `,
  emits: ['success'],
  setup(_, { emit }) {
    const { ref, onMounted, onUnmounted } = Vue;
    const phone = ref('');
    const code = ref('');
    const step = ref('phone'); // 'phone' | 'code'
    const busy = ref(false);
    const error = ref('');
    let recaptcha = null;
    let confirmationResult = null;

    const initRecaptcha = () => {
      if (!window.firebase || !window.auth) {
        error.value = 'Firebase is not initialized.';
        return;
      }
      // Invisible reCAPTCHA to prevent abuse
      recaptcha = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
      });
      recaptcha.render().catch(() => {});
    };

    const sendCode = async () => {
      error.value = '';
      if (!/^\+\d{6,15}$/.test(phone.value.trim())) {
        error.value = 'Please enter a valid phone number with country code, e.g., +886912345678';
        return;
      }
      try {
        busy.value = true;
        confirmationResult = await window.auth.signInWithPhoneNumber(phone.value.trim(), recaptcha);
        step.value = 'code';
      } catch (e) {
        console.error(e);
        error.value = e && e.message ? e.message : 'Failed to send verification code.';
        // reset verifier on error
        try { recaptcha.clear(); } catch {}
        initRecaptcha();
      } finally {
        busy.value = false;
      }
    };

    const verifyCode = async () => {
      error.value = '';
      if (!confirmationResult) {
        error.value = 'Please request a verification code first.';
        return;
      }
      try {
        busy.value = true;
        const result = await confirmationResult.confirm(code.value.trim());
        emit('success', result.user);
      } catch (e) {
        console.error(e);
        error.value = e && e.message ? e.message : 'Verification failed. Please try again.';
      } finally {
        busy.value = false;
      }
    };

    const reset = () => {
      step.value = 'phone';
      code.value = '';
      error.value = '';
    };

    onMounted(() => {
      // try immediately
      initRecaptcha();
      // if not ready yet, retry a few times
      let tries = 0;
      const timer = setInterval(() => {
        if (window.firebaseReady && !recaptcha) initRecaptcha();
        tries++;
        if (recaptcha || tries > 10) clearInterval(timer);
      }, 300);
    });
    onUnmounted(() => { try { recaptcha && recaptcha.clear(); } catch {} });

    return { phone, code, step, busy, error, sendCode, verifyCode, reset };
  }
};
