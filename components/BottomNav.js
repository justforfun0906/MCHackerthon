// Bottom Navigation Component with action buttons
const BottomNav = {
    template: `
        <div class="bottom-nav">
            <!-- Left Action Button (Dynamic for employers) -->
            <button class="action-btn my-jobs" @click="handleMyJobs" v-if="showMyJobs">
                {{ myJobsButtonText }}
            </button>
            
            <!-- Navigation Tabs -->
            <div class="nav-tabs">
                <button 
                    v-for="t in renderTabs" 
                    :key="t.key"
                    class="nav-btn"
                    :class="{ active: currentTab === t.key }"
                    @click="switchTab(t.key)"
                >
                    {{ t.label }}
                </button>
            </div>
            
        </div>
    `,
    props: {
        currentTab: String,
        tabs: { type: Array, default: null },
        showMyJobs: { type: Boolean, default: false },
        myJobsButtonText: { type: String, default: 'My Jobs' }
    },
    emits: ['switch-tab', 'my-jobs-action'],
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
        },
        handleMyJobs() {
            this.$emit('my-jobs-action');
        }
    }
}
