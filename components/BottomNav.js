// BottomNav Component
const BottomNav = {
    template: `
        <div class="bottom-nav">
            <button 
                class="nav-btn" 
                :class="{ active: currentTab === 'jobs' }"
                @click="switchTab('jobs')"
            >
                工作
            </button>
            <button 
                class="nav-btn" 
                :class="{ active: currentTab === 'shop' }"
                @click="switchTab('shop')"
            >
                商店
            </button>
            <button 
                class="nav-btn" 
                :class="{ active: currentTab === 'profile' }"
                @click="switchTab('profile')"
            >
                個人
            </button>
        </div>
    `,
    props: ['currentTab'],
    emits: ['switch-tab'],
    methods: {
        switchTab(tab) {
            this.$emit('switch-tab', tab);
        }
    }
}