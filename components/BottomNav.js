// BottomNav Component
const BottomNav = {
    template: `
        <div class="bottom-nav">
            <button v-for="t in renderTabs" :key="t.key"
                class="nav-btn"
                :class="{ active: currentTab === t.key }"
                @click="switchTab(t.key)"
            >{{ t.label }}</button>
                <button v-if="showLogout" class="nav-btn" @click="$emit('logout')"logout</button>
        </div>
    `,
    props: {
        currentTab: String,
        tabs: { type: Array, default: null },
        showLogout: { type: Boolean, default: false },
    },
    emits: ['switch-tab', 'logout'],
    computed: {
        renderTabs() {
            return this.tabs && this.tabs.length ? this.tabs : [
                { key: 'search', label: 'Jobs' },
                { key: 'post', label: 'Post' },
                { key: 'profile', label: 'Profile' },
            ];
        }
    },
    methods: {
        switchTab(tab) {
            this.$emit('switch-tab', tab);
        }
    }
}
