// BottomNav Component
const BottomNav = {
    template: `
        <div class="bottom-nav">
            <button v-for="t in renderTabs" :key="t.key"
                class="nav-btn"
                :class="{ active: currentTab === t.key }"
                @click="switchTab(t.key)"
            >{{ t.label }}</button>
        </div>
    `,
    props: {
        currentTab: String,
        tabs: { type: Array, default: null }
    },
    emits: ['switch-tab'],
    computed: {
        renderTabs() {
            return this.tabs && this.tabs.length ? this.tabs : [
                { key: 'search', label: '找工作' },
                { key: 'post', label: '發佈' },
                { key: 'profile', label: '個人' },
            ];
        }
    },
    methods: {
        switchTab(tab) {
            this.$emit('switch-tab', tab);
        }
    }
}
