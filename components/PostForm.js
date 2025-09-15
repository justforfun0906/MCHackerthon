// PostForm Component
const PostForm = {
    template: `
        <form class="post-form" @submit.prevent="onSubmit">
            <div class="field-row">
                <label>地區</label>
                <select v-model="form.region" required>
                    <option value="" disabled>請選擇</option>
                    <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                </select>
            </div>
            <div class="field-row">
                <label>店鋪類型</label>
                <select v-model="form.storeType" required>
                    <option value="" disabled>請選擇</option>
                    <option v-for="t in storeTypes" :key="t" :value="t">{{ t }}</option>
                </select>
            </div>
            <div class="field-row">
                <label>職務</label>
                <div class="checkbox-row">
                    <label v-for="r in roles" :key="r" class="checkbox-item">
                        <input type="checkbox" :value="r" v-model="form.roles" /> {{ r }}
                    </label>
                </div>
            </div>
            <div class="field-row">
                <label>時段</label>
                <select v-model="form.time" required>
                    <option value="" disabled>請選擇</option>
                    <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
                </select>
            </div>
            <div class="field-row">
                <label>人數</label>
                <input type="number" v-model.number="form.count" min="1" max="20" required />
            </div>
            <div class="actions">
                <button type="submit" class="modal-btn">發佈</button>
            </div>
        </form>
    `,
    props: {
        regions: { type: Array, default: () => [] },
        roles: { type: Array, default: () => [] },
        storeTypes: { type: Array, default: () => [] },
        timeSlots: { type: Array, default: () => [] }
    },
    emits: ['submit'],
    data() {
        return {
            form: {
                region: '',
                storeType: '',
                roles: [],
                time: '',
                count: 1
            }
        };
    },
    methods: {
        onSubmit() {
            if (!this.form.region || !this.form.storeType || !this.form.time || this.form.roles.length === 0) return;
            const payload = {
                id: Date.now(),
                region: this.form.region,
                storeType: this.form.storeType,
                roles: [...this.form.roles],
                time: this.form.time,
                count: this.form.count
            };
            this.$emit('submit', payload);
            // reset form
            this.form.region = '';
            this.form.storeType = '';
            this.form.roles = [];
            this.form.time = '';
            this.form.count = 1;
        }
    }
};