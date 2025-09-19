// PhoneMock Component - Simulated phone verification (code always 1234) [EN version]
const PhoneMock = {
  template: `
    <div class="job-section" style="margin-top:4px;">
      <div class="section-title">Phone Verification (Mock)</div>
      <div class="job-item" v-if="stage==='input'">
        <input v-model="phone" placeholder="Enter phone (no SMS sent)" style="width:100%;font-size:6px;padding:2px;" />
        <div class="actions" style="margin-top:4px;">
          <button class="modal-btn" @click="sendCode" :disabled="!phone">Send Code</button>
        </div>
      </div>
      <div class="job-item" v-else>
        <div style="font-size:6px;">Code was 'pretend' sent. Please enter 1234</div>
        <input v-model="code" placeholder="Enter 1234" style="width:100%;font-size:6px;padding:2px;margin-top:4px;" />
        <div class="actions" style="margin-top:4px;">
          <button class="modal-btn" @click="verify" :disabled="!code">Verify</button>
          <button class="modal-btn" style="background:#555;" @click="reset">Reset</button>
        </div>
        <div v-if="error" style="color:#ff8080;font-size:6px;margin-top:2px;">{{ error }}</div>
        <div v-if="verified" style="color:#00ff99;font-size:6px;margin-top:2px;">Verification successful!</div>
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
        this.error = 'Incorrect code (correct is 1234)';
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
