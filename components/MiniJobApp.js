// Main App Component
const MiniJobApp = {
    template: `
        <div class="app">
            <!-- 狀態欄 -->
            <status-bar :current-time="currentTime"></status-bar>
            
            <!-- 主要內容 -->
            <div class="main-content">
                <!-- 用戶資訊卡 -->
                <user-card :user="user"></user-card>
                
                <!-- 工作區域 -->
                <job-section 
                    :jobs="jobs" 
                    @select-job="selectJob"
                ></job-section>
            </div>
            
            <!-- 底部導航 -->
            <bottom-nav 
                :current-tab="currentTab"
                @switch-tab="switchTab"
            ></bottom-nav>
            
            <!-- 彈窗 -->
            <modal
                :show="showModal"
                :title="modalTitle"
                :message="modalMessage"
                @close="closeModal"
                @confirm="confirmAction"
            ></modal>
        </div>
    `,
    components: {
        StatusBar,
        UserCard,
        JobSection,
        BottomNav,
        Modal
    },
    setup() {
        const { ref, reactive, onMounted, onUnmounted } = Vue;
        
        // 響應式狀態
        const currentTab = ref('jobs');
        const selectedJob = ref(null);
        const showModal = ref(false);
        const modalTitle = ref('');
        const modalMessage = ref('');
        const currentTime = ref('00:00');
        
        const user = reactive({
            name: '新手小雞',
            level: 1,
            coins: 50,
            exp: 25
        });
        
        const jobs = reactive([
            { id: 1, name: '看廣告', reward: 5, time: 30, completed: false, inProgress: false, progress: 0 },
            { id: 2, name: '簽到', reward: 10, time: 5, completed: false, inProgress: false, progress: 0 },
            { id: 3, name: '分享', reward: 15, time: 10, completed: false, inProgress: false, progress: 0 },
            { id: 4, name: '評分', reward: 20, time: 15, completed: false, inProgress: false, progress: 0 },
            { id: 5, name: '邀請', reward: 50, time: 60, completed: false, inProgress: false, progress: 0 }
        ]);
        
        // 定時器引用
        let timeInterval = null;
        let progressInterval = null;
        
        // 時間更新
        const updateTime = () => {
            const now = new Date();
            const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');
            currentTime.value = timeString;
        };
        
        // 選擇工作
        const selectJob = (job) => {
            if (job.completed) return;
            
            selectedJob.value = job;
            modalTitle.value = job.name;
            modalMessage.value = `獲得 ${job.reward} 金幣\n預估 ${job.time} 秒`;
            showModal.value = true;
        };
        
        // 關閉彈窗
        const closeModal = () => {
            showModal.value = false;
        };
        
        // 確認操作
        const confirmAction = () => {
            if (selectedJob.value && !selectedJob.value.inProgress) {
                selectedJob.value.inProgress = true;
                selectedJob.value.progress = 0;
            }
            closeModal();
        };
        
        // 切換標籤
        const switchTab = (tab) => {
            currentTab.value = tab;
        };
        
        // 工作進度更新
        const updateJobProgress = () => {
            jobs.forEach(job => {
                if (job.inProgress && !job.completed) {
                    job.progress += Math.random() * 10;
                    if (job.progress >= 100) {
                        job.progress = 100;
                        job.completed = true;
                        job.inProgress = false;
                        user.coins += job.reward;
                        user.exp += 5;
                        if (user.exp >= 100) {
                            user.level++;
                            user.exp = 0;
                        }
                    }
                }
            });
        };
        
        // 組件掛載時初始化
        onMounted(() => {
            updateTime();
            timeInterval = setInterval(updateTime, 1000);
            progressInterval = setInterval(updateJobProgress, 1000);
        });
        
        // 組件卸載時清理定時器
        onUnmounted(() => {
            if (timeInterval) clearInterval(timeInterval);
            if (progressInterval) clearInterval(progressInterval);
        });
        
        return {
            currentTab,
            selectedJob,
            showModal,
            modalTitle,
            modalMessage,
            currentTime,
            user,
            jobs,
            selectJob,
            closeModal,
            confirmAction,
            switchTab
        };
    }
};