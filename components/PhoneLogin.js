// PhoneLogin Component - Firebase Phone Auth (compat)
const PhoneLogin = {
  template: `
    <div class="job-section">
      <div class="section-title">手機登入</div>
      <div class="job-item">
        <div v-if="step === 'phone'">
          <input
            type="tel"
            v-model="phone"
            placeholder="輸入手機號碼 (含國碼，如 +886912345678)"
            style="width:100%;font-size:6px;padding:2px;"
          />
          <div id="recaptcha-container" style="margin:6px 0;"></div>
          <div class="actions">
            <button class="modal-btn" :disabled="busy || !phone" @click="sendCode">發送驗證碼</button>
          </div>
        </div>
        <div v-else>
          <div style="font-size:6px;margin-bottom:4px;">我們已傳送簡訊至：{{ phone }}</div>
          <input
            type="text"
            v-model="code"
            placeholder="輸入 6 位數驗證碼"
            style="width:100%;font-size:6px;padding:2px;letter-spacing:2px;"
          />
          <div class="actions">
            <button class="modal-btn" :disabled="busy || code.length < 6" @click="verifyCode">驗證並登入</button>
            <button class="modal-btn" :disabled="busy" @click="reset">返回修改手機</button>
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
        error.value = 'Firebase 尚未初始化';
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
        error.value = '請輸入含國碼的手機號碼，例如 +886912345678';
        return;
      }
      try {
        busy.value = true;
        confirmationResult = await window.auth.signInWithPhoneNumber(phone.value.trim(), recaptcha);
        step.value = 'code';
      } catch (e) {
        console.error(e);
        error.value = e && e.message ? e.message : '發送驗證碼失敗';
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
        error.value = '請先發送驗證碼';
        return;
      }
      try {
        busy.value = true;
        const result = await confirmationResult.confirm(code.value.trim());
        emit('success', result.user);
      } catch (e) {
        console.error(e);
        error.value = e && e.message ? e.message : '驗證失敗，請重試';
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
