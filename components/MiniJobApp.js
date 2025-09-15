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

                <!-- 搜尋職缺 -->
                <template v-if="currentTab === 'search'">
                    <filter-bar 
                        :region="filters.region"
                        :skill="filters.skill"
                        :regions="regions"
                        :skills="skills"
                        @update:region="filters.region = $event"
                        @update:skill="filters.skill = $event"
                    ></filter-bar>
                    <job-section 
                        :jobs="filteredJobs" 
                        @select-job="viewJob"
                    ></job-section>
                </template>

                <!-- 發佈職缺 -->
                <template v-else-if="currentTab === 'post'">
                    <post-form 
                        :regions="regions"
                        :roles="roles"
                        :store-types="storeTypes"
                        :time-slots="timeSlots"
                        @submit="addJob"
                    ></post-form>
                </template>

                <!-- 個人 -->
                <template v-else>
                    <div class="job-section">
                        <div class="section-title">👤 個人資訊</div>
                        <div class="job-item">已發佈職缺：{{ jobs.length }} 則</div>
                    </div>
                </template>
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
        Modal,
        FilterBar,
        PostForm
    },
    setup() {
        const { ref, reactive, computed, onMounted, onUnmounted, watch } = Vue;
        
        // 響應式狀態
        const currentTab = ref('search');
        const selectedJob = ref(null);
        const showModal = ref(false);
        const modalTitle = ref('');
        const modalMessage = ref('');
        const currentTime = ref('00:00');

        // 字典
        const regions = ['台北', '新北', '桃園', '台中', '台南', '高雄'];
        const roles = ['櫃台', '外場', '內場', '粗工', '清潔'];
        const storeTypes = ['餐飲', '零售', '服務', '工地'];
        const timeSlots = ['早班', '中班', '晚班', '彈性'];
        const skills = roles; // 簡化：技能=職務

        const user = reactive({
            name: '新手小雞',
            level: 1,
            coins: 50,
            exp: 25
        });
        
    // 職缺資料（Firestore）
    const jobs = ref([]);

        const filters = reactive({ region: '', skill: '' });

        const filteredJobs = computed(() => {
            return jobs.value.filter(j => {
                const regionOk = !filters.region || j.region === filters.region;
                const skillOk = !filters.skill || j.roles.includes(filters.skill);
                return regionOk && skillOk;
            });
        });

        // Firestore 訂閱
        let unsubscribe = null;
        const startSubscribe = () => {
            if (!window.db) {
                modalTitle.value = '連線失敗';
                modalMessage.value = 'Firebase 尚未初始化或腳本未載入，請檢查設定與網路。';
                showModal.value = true;
                return;
            }
            const col = window.db.collection('jobs');
            unsubscribe = col.orderBy('createdAt', 'desc').onSnapshot((snap) => {
                const arr = [];
                snap.forEach(doc => {
                    const d = doc.data();
                    arr.push({ id: doc.id, ...d });
                });
                jobs.value = arr;
            }, (err) => {
                console.error('[Firestore] onSnapshot error', err);
            });
        };

        // 動作
        const viewJob = (job) => {
            selectedJob.value = job;
            modalTitle.value = `${job.region}｜${job.storeType}`;
            modalMessage.value = `需求：${job.roles.join('、')}\n時段：${job.time}\n人數：${job.count}`;
            showModal.value = true;
        };

        const addJob = async (payload) => {
            try {
                if (!window.db) throw new Error('Firebase 尚未初始化');
                const docData = { ...payload, createdAt: Date.now() };
                await window.db.collection('jobs').add(docData);
                modalTitle.value = '發佈成功';
                modalMessage.value = '您的職缺已上架';
                showModal.value = true;
                currentTab.value = 'search';
            } catch (e) {
                console.error(e);
                modalTitle.value = '發佈失敗';
                modalMessage.value = '請檢查網路或 Firebase 設定';
                showModal.value = true;
            }
        };

        // 時間更新
        let timeInterval = null;
        const updateTime = () => {
            const now = new Date();
            const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');
            currentTime.value = timeString;
        };

        // 切換標籤
        const switchTab = (tab) => {
            currentTab.value = tab;
        };

        // 生命週期
        onMounted(() => {
            updateTime();
            timeInterval = setInterval(updateTime, 1000);
            startSubscribe();
        });
        onUnmounted(() => {
            if (timeInterval) clearInterval(timeInterval);
            if (typeof unsubscribe === 'function') unsubscribe();
        });

        // 導出
        return {
            currentTab,
            selectedJob,
            showModal,
            modalTitle,
            modalMessage,
            currentTime,
            user,
            jobs: jobs,
            regions,
            roles,
            storeTypes,
            timeSlots,
            skills,
            filters,
            filteredJobs,
            viewJob,
            addJob,
            closeModal: () => { showModal.value = false; },
            confirmAction: () => { showModal.value = false; },
            switchTab
        };
    }
};