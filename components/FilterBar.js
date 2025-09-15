// FilterBar Component
const FilterBar = {
    template: `
        <div class="filter-bar">
            <div class="field-row">
                <label>地區</label>
                <select v-model="localRegion" @change="emitRegion">
                    <option value="">不限</option>
                    <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                </select>
            </div>
            <div class="field-row">
                <label>技能</label>
                <select v-model="localSkill" @change="emitSkill">
                    <option value="">不限</option>
                    <option v-for="s in skills" :key="s" :value="s">{{ s }}</option>
                </select>
            </div>
        </div>
    `,
    props: {
        region: { type: String, default: '' },
        skill: { type: String, default: '' },
        regions: { type: Array, default: () => [] },
        skills: { type: Array, default: () => [] }
    },
    emits: ['update:region', 'update:skill'],
    data() {
        return {
            localRegion: this.region,
            localSkill: this.skill
        };
    },
    methods: {
        emitRegion() {
            this.$emit('update:region', this.localRegion);
        },
        emitSkill() {
            this.$emit('update:skill', this.localSkill);
        }
    },
    watch: {
        region(val) { this.localRegion = val; },
        skill(val) { this.localSkill = val; }
    }
};