// PhoneMock Component - Simulated phone verification (code always 1234)
const PhoneMock = {
  template: `
    <div class="job-section" style="margin-top:4px;">
      <div class="section-title">手機驗證 (模擬)</div>
      <div class="job-item" v-if="stage==='input'">
        <input v-model="phone" placeholder="輸入手機 (不發送)" style="width:100%;font-size:6px;padding:2px;" />
        <div class="actions" style="margin-top:4px;">
          <button class="modal-btn" @click="sendCode" :disabled="!phone">發送驗證碼</button>
        </div>
      </div>
      <div class="job-item" v-else>
        <div style="font-size:6px;">驗證碼已『假裝』送出，請輸入 1234</div>
        <input v-model="code" placeholder="輸入 1234" style="width:100%;font-size:6px;padding:2px;margin-top:4px;" />
        <div class="actions" style="margin-top:4px;">
          <button class="modal-btn" @click="verify" :disabled="!code">驗證</button>
          <button class="modal-btn" style="background:#555;" @click="reset">重來</button>
        </div>
        <div v-if="error" style="color:#ff8080;font-size:6px;margin-top:2px;">{{ error }}</div>
        <div v-if="verified" style="color:#00ff99;font-size:6px;margin-top:2px;">驗證成功！</div>
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
    sendCode() {
      // Do nothing real; just move to code stage
      this.stage = 'code';
      this.error = '';
      this.code = '';
      this.verified = false;
    },
    verify() {
      if (this.code.trim() === '1234') {
        this.verified = true;
        this.error = '';
        this.$emit('verified', { phone: this.phone });
      } else {
        this.error = '驗證碼錯誤（正確為 1234）';
        this.verified = false;
      }
    },
    reset() {
      this.stage = 'input';
      this.code = '';
      this.error = '';
      this.verified = false;
    }
  }
};