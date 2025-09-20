// UserProfile Component - stores profile in Firestore under users/{userId}
const UserProfile = {
  template: `
    <div class="post-form profile-form no-scrollbar">
      <div class="section-title">My Profile</div>
      <div class="field-col">
        <label for="name">Name</label>
        <input id="name" type="text" v-model="form.name" placeholder="Your name" />
      </div>
      <div class="field-col">
        <label for="phone">Phone</label>
        <input id="phone" type="text" v-model="form.phone" placeholder="e.g. +886912345678" />
      </div>
      <div class="field-col">
        <label for="address">Address</label>
        <input id="address" type="text" v-model="form.address" placeholder="Your address" />
      </div>
      <div class="field-col">
        <label for="workexp">Work Experience</label>
        <textarea id="workexp" class="note-textarea" v-model="form.workExperience" placeholder="Brief work experience"></textarea>
      </div>
      <div class="field-col">
        <label for="other">Other Contact</label>
        <input id="other" type="text" v-model="form.contactOther" placeholder="Line/Email/etc." />
      </div>

      <div class="actions">
        <button class="modal-btn" :disabled="saving" @click="save">{{ saving ? 'Saving...' : 'Save' }}</button>
        <button class="modal-btn" @click="$emit('back')">Back</button>
      </div>

      <div class="panel-msg" v-if="message">{{ message }}</div>
    </div>
  `,
  props: {
    userId: { type: String, required: true }
  },
  emits: ['back','saved'],
  setup(props, { emit }) {
    const { ref, onMounted, watch } = Vue;
  const form = ref({ name: '', phone: '', address: '', workExperience: '', contactOther: '' });
    const saving = ref(false);
    const message = ref('');

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
        emit('saved', payload);
      } catch (e) {
        console.error('[UserProfile] save error', e);
        message.value = 'Failed to save profile.';
      } finally {
        saving.value = false;
      }
    };

    onMounted(loadProfile);
    watch(() => props.userId, () => loadProfile());

    return { form, saving, message, save };
  }
};
