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
    userId: { type: String, required: true }
  },
  emits: ['back','saved'],
  setup(props, { emit, expose }) {
    const { ref, onMounted, watch, onUnmounted, nextTick } = Vue;
  const form = ref({ name: '', phone: '', address: '', workExperience: '', contactOther: '' });
    const saving = ref(false);
    const message = ref('');
    const DRAFT_KEY = ref('');
    let draftTimer = null;

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
        // After loading from Firestore, overlay any local draft
        try {
          const raw = localStorage.getItem(DRAFT_KEY.value);
          if (raw) {
            const obj = JSON.parse(raw);
            if (obj && obj.form) {
              form.value = { ...form.value, ...obj.form };
            }
          }
        } catch {}
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
        // Clear local draft on successful save
        try { localStorage.removeItem(DRAFT_KEY.value); } catch {}
      } catch (e) {
        console.error('[UserProfile] save error', e);
        message.value = 'Failed to save profile.';
      } finally {
        saving.value = false;
      }
    };

    const discard = async () => {
      try { localStorage.removeItem(DRAFT_KEY.value); } catch {}
      try { await loadProfile(); } catch {}
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
      try { DRAFT_KEY.value = `profileDraft:${props.userId || 'anon'}`; } catch {}
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
      try { if (draftTimer) clearTimeout(draftTimer); } catch {}
    });
    watch(() => props.userId, () => loadProfile());

    // Debounced autosave of profile draft
    watch(form, () => {
      try { if (draftTimer) clearTimeout(draftTimer); } catch {}
      draftTimer = setTimeout(() => {
        try { localStorage.setItem(DRAFT_KEY.value, JSON.stringify({ form: form.value, ts: Date.now() })); } catch {}
      }, 300);
    }, { deep: true });

    expose({ save, discard });
    return { form, saving, message, save, discard };
  }
};
