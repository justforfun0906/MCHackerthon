// UserProfile Component - stores profile in Firestore under users/{userId}
const UserProfile = {
  template: `
    <div class="post-form profile-form no-scrollbar">
      <div class="section-title">My Profile</div>
      <div class="field-col">
        <label for="name">Name</label>
  <input id="name" type="text" v-model="form.name" placeholder="Your name" tabindex="0" />
      </div>
      <div class="field-col">
        <label for="phone">Phone</label>
  <input id="phone" type="text" v-model="form.phone" placeholder="e.g. +886912345678" tabindex="0" />
      </div>
      <div class="field-col">
        <label for="address">Address</label>
  <input id="address" type="text" v-model="form.address" placeholder="Your address" tabindex="0" />
      </div>
      <div class="field-col">
        <label for="workexp">Work Experience</label>
  <textarea id="workexp" class="note-textarea" v-model="form.workExperience" placeholder="Brief work experience" tabindex="0"></textarea>
      </div>
      <div class="field-col">
        <label for="other">Other Contact</label>
  <input id="other" type="text" v-model="form.contactOther" placeholder="Line/Email/etc." tabindex="0" />
      </div>
      
      <div class="panel-msg" v-if="message">{{ message }}</div>
    </div>
  `,
  props: {
    userId: { type: String, required: true },
    userKey: { type: String, default: '' }
  },
  emits: ['back','saved'],
  setup(props, { emit, expose }) {
    const { ref, onMounted, watch, onUnmounted, nextTick, computed } = Vue;
    const form = ref({ name: '', phone: '', address: '', workExperience: '', contactOther: '' });
    const saving = ref(false);
    const message = ref('');
  const cacheKey = computed(() => `profileCache:${props.userKey || 'anon'}`);
    let cacheTimer = null;

    const loadCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey.value);
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && obj.form) {
            form.value = { ...form.value, ...obj.form };
          }
        }
      } catch {}
    };

    const saveCache = () => {
      try {
        localStorage.setItem(cacheKey.value, JSON.stringify({ form: form.value, ts: Date.now() }));
      } catch {}
    };

    const clearCache = () => { try { localStorage.removeItem(cacheKey.value); } catch {} };

    const loadProfile = async () => {
      message.value = '';
      if (!window.db || !props.userId) {
        return;
      }
      try {
        const docRef = window.db.collection('users').doc(props.userId);
        const snap = await docRef.get();
        if (snap.exists) {
          const data = snap.data() || {};
          form.value = {
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
            workExperience: data.workExperience || '',
            contactOther: data.contactOther || ''
          };
        }
      } catch (e) {
        console.error('[UserProfile] load error', e);
        message.value = 'Failed to load profile.';
      }
    };

    const save = async () => {
      if (!window.db || !props.userId) {
        message.value = 'Firebase not ready.';
        return;
      }
      try {
        saving.value = true;
        const payload = {
          name: form.value.name?.trim() || '',
          phone: form.value.phone?.trim() || '',
          address: form.value.address?.trim() || '',
          workExperience: form.value.workExperience?.trim() || '',
          contactOther: form.value.contactOther?.trim() || '',
          updatedAt: Date.now()
        };
  await window.db.collection('users').doc(props.userId).set(payload, { merge: true });
  message.value = 'Profile saved!';
  clearCache();
        emit('saved', payload);
      } catch (e) {
        console.error('[UserProfile] save error', e);
        message.value = 'Failed to save profile.';
      } finally {
        saving.value = false;
      }
    };

    const handleKeyDown = (e) => {
      // Provide basic keyboard control inside profile
      if (e.key === 'Escape' || e.key === 'SoftRight' || e.key === 'F12') {
        e.preventDefault();
        emit('back');
      } else if (e.key === 'SoftLeft') {
        e.preventDefault();
        save();
      }
    };

    onMounted(() => {
      // Migrate legacy userId-scoped cache to userKey-scoped
      try {
        const legacyKey = `profileCache:${props.userId || 'demo-user'}`;
        const legacy = localStorage.getItem(legacyKey);
        if (legacy && !localStorage.getItem(cacheKey.value)) {
          localStorage.setItem(cacheKey.value, legacy);
          try { localStorage.removeItem(legacyKey); } catch {}
        }
      } catch {}
      // Load local cache first, then server profile
      loadCache();
      loadProfile();
      document.addEventListener('keydown', handleKeyDown);
      // Focus the first input for immediate editing
      setTimeout(() => {
        try {
          const first = document.querySelector('.profile-form input#name');
          if (first) first.focus();
        } catch {}
      }, 100);
    });
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });
  watch(() => [props.userId, props.userKey], () => { loadCache(); loadProfile(); });
    // Debounced auto-save of drafts
    watch(form, () => {
      try { if (cacheTimer) clearTimeout(cacheTimer); } catch {}
      cacheTimer = setTimeout(saveCache, 300);
    }, { deep: true });

    expose({ save });
    return { form, saving, message, save };
  }
};
