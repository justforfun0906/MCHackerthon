// PostForm Component (EN version)
const PostForm = {
    template: `
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
                <input type="text" v-model="form.address" placeholder="Enter address" class="address-input" />
            </div>
            <div class="field-row">
                <label>Roles</label>
                <div class="checkbox-row">
                    <label v-for="r in roles" :key="r" class="checkbox-item">
                        <input type="checkbox" :value="r" v-model="form.roles" class="role-checkbox" /> {{ r }}
                    </label>
                </div>
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
                <input type="number" v-model.number="form.count" min="1" max="20" required class="count-input" />
            </div>
            <div class="field-row">
                <label>Notes</label>
                <textarea v-model="form.note" placeholder="Enter job notes..." rows="3" class="note-textarea"></textarea>
            </div>
            <div class="field-row">
                <button type="submit" class="modal-btn post-btn">Post Job</button>
            </div>
        </form>
    `,
    props: {
        regions: { type: Array, default: () => [] },
        roles: { type: Array, default: () => [] },
        storeTypes: { type: Array, default: () => [] },
        timeSlots: { type: Array, default: () => [] },
        userKey: { type: String, default: '' },
        userId: { type: String, default: '' },
        loadDraft: { type: Boolean, default: true }
    },
    emits: ['submit'],
    data() {
        return {
            form: {
                region: '',
                storeType: '',
                address: '',
                roles: [],
                time: '',
                count: 1,
                note: ''
            },
            cacheTimer: null,
            cacheTs: 0
        };
    },
    methods: {
        cacheKey() {
            return `postDraft:${this.userKey || 'anon'}`;
        },
        legacyCacheKey() {
            return `postDraft:${this.userId || 'demo-user'}`;
        },
        loadCache() {
            try {
                const raw = localStorage.getItem(this.cacheKey());
                if (raw) {
                    const obj = JSON.parse(raw);
                    if (obj && obj.form) {
                        this.form = { ...this.form, ...obj.form };
                        this.cacheTs = obj.ts || 0;
                    }
                }
            } catch {}
        },
        migrateLegacyCache() {
            try {
                const legacy = localStorage.getItem(this.legacyCacheKey());
                if (legacy && !localStorage.getItem(this.cacheKey())) {
                    localStorage.setItem(this.cacheKey(), legacy);
                    try { localStorage.removeItem(this.legacyCacheKey()); } catch {}
                }
            } catch {}
        },
        saveCache() {
            try { localStorage.setItem(this.cacheKey(), JSON.stringify({ form: this.form, ts: Date.now() })); } catch {}
        },
        clearDraft() {
            try { localStorage.removeItem(this.cacheKey()); } catch {}
        },
        clearDraftAndReset() {
            this.clearDraft();
            this.resetForm();
        },
        resetForm() {
            this.form.region = '';
            this.form.storeType = '';
            this.form.address = '';
            this.form.roles = [];
            this.form.time = '';
            this.form.count = 1;
            this.form.note = '';
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
        onSubmit() {
            if (!this.form.region || !this.form.storeType || !this.form.time || this.form.roles.length === 0) return;
            const payload = {
                region: this.form.region,
                storeType: this.form.storeType,
                address: this.form.address,
                roles: [...this.form.roles],
                time: this.form.time,
                count: this.form.count,
                note: this.form.note
            };
            this.$emit('submit', payload);
            // clear draft and reset form
            this.clearDraft();
            this.resetForm();
        }
    },
    mounted() {
        // Migrate draft to hashed key and load when allowed
        this.migrateLegacyCache();
        if (this.loadDraft) {
            this.loadCache();
        }
        // Debounced draft autosave while editing
        this.$watch(
            () => ({...this.form}),
            () => {
                try { if (this.cacheTimer) clearTimeout(this.cacheTimer); } catch {}
                this.cacheTimer = setTimeout(() => this.saveCache(), 300);
            },
            { deep: true }
        );
    },
    watch: {
        userKey() {
            // Persist current form to new key and clear old
            this.saveCache();
        },
        loadDraft(newVal) {
            if (newVal) {
                this.loadCache();
            }
        }
    }
};
