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
    userKey: { type: String, default: '' },
    loadDraft: { type: Boolean, default: true }
  },
  emits: ['back','saved'],
  setup(props, { emit, expose }) {
    const { ref, onMounted, watch, onUnmounted, nextTick, computed } = Vue;
  const form = ref({ name: '', phone: '', address: '', workExperience: '', contactOther: '' });
    const saving = ref(false);
    const message = ref('');
    const cacheKey = computed(() => `profileCache:${props.userKey || 'anon'}`);
    let cacheTimer = null;
    const cacheTs = ref(0);
    const hasLocalDraft = ref(false);

    const loadCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey.value);
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && obj.form) {
            form.value = { ...form.value, ...obj.form };
            cacheTs.value = obj.ts || 0;
            hasLocalDraft.value = true;
          }
        }
      } catch {}
    };
    const saveCache = () => {
      try { localStorage.setItem(cacheKey.value, JSON.stringify({ form: form.value, ts: Date.now() })); } catch {}
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
          const server = {
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
            workExperience: data.workExperience || '',
            contactOther: data.contactOther || '',
            updatedAt: data.updatedAt || 0
          };
          // Prefer newer local draft; otherwise use server
          if (hasLocalDraft.value && (cacheTs.value >= (server.updatedAt || 0))) {
            // Merge server (fills missing) but keep local values
            form.value = { ...server, ...form.value };
          } else {
            form.value = {
              name: server.name,
              phone: server.phone,
              address: server.address,
              workExperience: server.workExperience,
              contactOther: server.contactOther
            };
          }
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
      // Migrate legacy userId-based cache to userKey key
      try {
        const legacyKey = `profileCache:${props.userId || 'demo-user'}`;
        const legacy = localStorage.getItem(legacyKey);
        if (legacy && !localStorage.getItem(cacheKey.value)) {
          localStorage.setItem(cacheKey.value, legacy);
          try { localStorage.removeItem(legacyKey); } catch {}
        }
      } catch {}
      if (props.loadDraft) {
        loadCache();
      } else {
        hasLocalDraft.value = false;
        cacheTs.value = 0;
      }
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
    watch(() => [props.userId, props.userKey, props.loadDraft], () => {
      if (props.loadDraft) {
        loadCache();
      } else {
        hasLocalDraft.value = false;
        cacheTs.value = 0;
      }
      loadProfile();
    });
    // Debounced draft caching while editing
    watch(form, () => {
      try { if (cacheTimer) clearTimeout(cacheTimer); } catch {}
      cacheTimer = setTimeout(saveCache, 300);
    }, { deep: true });

    const clearDraft = () => { clearCache(); };
    const clearDraftAndReload = () => { clearCache(); loadProfile(); };

    expose({ save, clearDraft, clearDraftAndReload });
    return { form, saving, message, save };
  }
};
