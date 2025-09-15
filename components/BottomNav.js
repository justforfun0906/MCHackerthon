// BottomNav Component
const BottomNav = {
    template: `
        <div class="bottom-nav">
            <button 
                class="nav-btn" 
                :class="{ active: currentTab === 'search' }"
                @click="switchTab('search')"
            >
                找工作
            </button>
            <button 
                class="nav-btn" 
                :class="{ active: currentTab === 'post' }"
                @click="switchTab('post')"
            >
                發佈
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
