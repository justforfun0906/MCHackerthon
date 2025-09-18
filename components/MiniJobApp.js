// Main App Component
const MiniJobApp = {
    template: `
        <div class="app">
            <!-- 狀態欄 -->
            <status-bar :current-time="currentTime"></status-bar>
            
            <!-- 主要內容 -->
            <div class="main-content">
                <!-- 手機驗證階段 -->
                <template v-if="!mockVerified">
                    <phone-mock @verified="onMockVerified"></phone-mock>
                </template>

                <!-- 主畫面：選擇身分（驗證後顯示） -->
                <template v-else-if="!role">
                    <div class="job-section">
                        <div class="section-title">請選擇您的身份</div>
                        <div class="job-list">
                            <div class="job-item" @click="chooseRole('seeker')">找工作</div>
                            <div class="job-item" @click="chooseRole('employer')">我是雇主</div>
                        </div>
                    </div>
                </template>

                <!-- 搜尋職缺 -->
                <template v-else-if="currentTab === 'search' && role === 'seeker'">
                    <filter-bar v-if="!selectedJob"
                        :region="filters.region"
                        :skill="filters.skill"
                        :regions="regions"
                        :skills="skills"
                        @update:region="filters.region = $event"
                        @update:skill="filters.skill = $event"
                    ></filter-bar>
                    <template v-if="!selectedJob">
                        <job-section 
                            :jobs="filteredJobs" 
                            @select-job="viewJob"
                        ></job-section>
                    </template>
                    <template v-else>
                        <div class="inline-job-panel full">
                            <div class="panel-title">職缺詳情</div>
                            <div class="panel-line">地區：{{ selectedJob.region }}</div>
                            <div class="panel-line">類型：{{ selectedJob.storeType }}</div>
                            <div class="panel-line">職務：{{ selectedJob.roles.join('、') }}</div>
                            <div class="panel-line">時段：{{ selectedJob.time }}</div>
                            <div class="panel-line">剩餘：{{ selectedJob.count }}</div>
                            <div class="panel-actions">
                                <button class="panel-btn" @click="applySelected" :disabled="applyLoading || applyingDone || (selectedJob.count<=0)">
                                    <span v-if="!applyingDone">{{ applyLoading ? '處理中...' : '應徵' }}</span>
                                    <span v-else>已應徵</span>
                                </button>
                                <button class="panel-btn secondary" @click="closePanel">返回列表</button>
                            </div>
                            <div class="panel-msg" v-if="inlineMessage">{{ inlineMessage }}</div>
                        </div>
                    </template>
                </template>

                <!-- 發佈職缺 -->
                <template v-else-if="currentTab === 'post' && role === 'employer'">
                    <div class="job-section" v-if="!ownerId">
                        <div class="section-title">請先設定您的雇主代碼</div>
                        <div class="job-item">
                            <input 
                                type="text" 
                                placeholder="輸入雇主代碼(任意字)" 
                                v-model="ownerInput"
                                style="width:100%;font-size:6px;padding:2px;"
                            />
                            <div class="actions">
                                <button class="modal-btn" @click="saveOwnerId">設定</button>
                            </div>
                        </div>
                    </div>
                    <post-form v-if="ownerId"
                        :regions="regions"
                        :roles="roles"
                        :store-types="storeTypes"
                        :time-slots="timeSlots"
                        @submit="addJob"
                    ></post-form>
                </template>

                <!-- 雇主：我的職缺監看 -->
                <template v-else-if="currentTab === 'mine' && role === 'employer'">
                    <div class="job-section" v-if="!ownerId">
                        <div class="section-title">請先設定您的雇主代碼</div>
                        <div class="job-item">
                            <input 
                                type="text" 
                                placeholder="輸入雇主代碼(任意字)" 
                                v-model="ownerInput"
                                style="width:100%;font-size:6px;padding:2px;"
                            />
                            <div class="actions">
                                <button class="modal-btn" @click="saveOwnerId">設定</button>
                            </div>
                        </div>
                    </div>
                    <job-section :jobs="myJobs" @select-job="viewJob"></job-section>
                </template>
            </div>
            
            <!-- 底部導航 -->
            <bottom-nav 
                v-if="role"
                :current-tab="currentTab"
                :tabs="navTabs"
                :show-logout="true"
                @switch-tab="switchTab"
                @logout="logout"
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
        JobSection,
        BottomNav,
        Modal,
        FilterBar,
        PhoneMock,
        PostForm
    },
    setup() {
        const { ref, reactive, computed, onMounted, onUnmounted } = Vue;

        // 狀態
    const mockVerified = ref(false);
        const role = ref(null); // 'seeker' | 'employer'
        const currentTab = ref('search');
        const selectedJob = ref(null);
        const showModal = ref(false);
        const modalTitle = ref('');
        const modalMessage = ref('');
        const currentTime = ref('00:00');
        const ownerId = ref('');
        const ownerInput = ref('');

        // 字典
        const regions = ['台北', '新北', '桃園', '台中', '台南', '高雄'];
        const roles = ['櫃台', '外場', '內場', '粗工', '清潔'];
        const storeTypes = ['餐飲', '零售', '服務', '工地'];
        const timeSlots = ['早班', '中班', '晚班', '彈性'];
        const skills = roles; // 技能=職務

        // Firestore 資料
        const jobs = ref([]);
        const inlineMessage = ref('');
        const applyLoading = ref(false);
        const applyingDone = ref(false);

        // 篩選
        const filters = reactive({ region: '', skill: '' });
        const normalizeRoles = (val) => {
            if (Array.isArray(val)) return val.filter(r => typeof r === 'string');
            if (typeof val === 'string') return [val];
            return [];
        };
        const filteredJobs = computed(() => jobs.value.filter(j => {
            try {
                if (!j._normalizedRoles) {
                    j.roles = normalizeRoles(j.roles);
                    Object.defineProperty(j, '_normalizedRoles', { value: true, enumerable: false });
                }
                const regionOk = !filters.region || j.region === filters.region;
                const skillOk = !filters.skill || (Array.isArray(j.roles) && j.roles.indexOf(filters.skill) !== -1);
                const countOk = (j.count ?? 0) > 0;
                return regionOk && skillOk && countOk;
            } catch (e) {
                console.warn('[filteredJobs guard]', e, j);
                return false;
            }
        }));

        // 雇主監看
        const myJobs = computed(() => ownerId.value ? jobs.value.filter(j => j.ownerId === ownerId.value) : []);

        // 動態底導
        const navTabs = computed(() => {
            if (role.value === 'seeker') return [ { key: 'search', label: '找工作' } ];
            if (role.value === 'employer') return [ { key: 'post', label: '發佈' }, { key: 'mine', label: '我的職缺' } ];
            return [];
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
            unsubscribe = col.orderBy('createdAt', 'desc').onSnapshot(snap => {
                const arr = [];
                snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
                    // Normalize roles to always be an array of strings
                    jobs.value = arr.map(j => {
                        let rolesNorm = [];
                        if (Array.isArray(j.roles)) rolesNorm = j.roles.filter(r => typeof r === 'string');
                        else if (typeof j.roles === 'string') rolesNorm = [j.roles];
                        return { ...j, roles: rolesNorm };
                    });
            }, err => console.error('[Firestore] onSnapshot error', err));
        };

        // 動作
        const viewJob = (job) => {
            const safeJob = { ...job, roles: normalizeRoles(job.roles) };
            selectedJob.value = safeJob;
            inlineMessage.value = '';
            applyingDone.value = false;
            if (role.value === 'employer') {
                modalTitle.value = `${safeJob.region}｜${safeJob.storeType}`;
                modalMessage.value = `需求：${safeJob.roles.join('、')}` + `\n時段：${safeJob.time}\n人數：${safeJob.count}`;
                showModal.value = true;
            }
        };
        const applySelected = async () => {
            if (!selectedJob.value || applyingDone.value) return;
            applyLoading.value = true;
            await applyJob(selectedJob.value);
            applyLoading.value = false;
        };
        const closePanel = () => {
            selectedJob.value = null;
            inlineMessage.value = '';
            applyingDone.value = false;
        };

        const addJob = async (payload) => {
            try {
                if (!window.db) throw new Error('Firebase 尚未初始化');
                if (!ownerId.value) throw new Error('請先設定雇主代碼');
                const docData = { ...payload, createdAt: Date.now(), ownerId: ownerId.value };
                await window.db.collection('jobs').add(docData);
                modalTitle.value = '發佈成功';
                modalMessage.value = '您的職缺已上架';
                showModal.value = true;
                currentTab.value = 'mine';
            } catch (e) {
                console.error(e);
                modalTitle.value = '發佈失敗';
                modalMessage.value = '請檢查網路或 Firebase 設定';
                showModal.value = true;
            }
        };

        const applyJob = async (job) => {
            try {
                if (!window.firebase || !window.db) throw new Error('Firebase 尚未初始化');
                if (!job || !job.id) throw new Error('資料異常：缺少職缺 ID');
                if (!Array.isArray(job.roles)) job.roles = normalizeRoles(job.roles);
                const docRef = window.db.collection('jobs').doc(job.id);
                await window.db.runTransaction(async (tx) => {
                    const snap = await tx.get(docRef);
                    if (!snap.exists) throw new Error('職缺不存在');
                    const data = snap.data();
                    const dataRoles = normalizeRoles(data.roles);
                    if (!Array.isArray(dataRoles)) console.warn('[applyJob data roles malformed]', data.roles);
                    const curr = data.count || 0;
                    if (curr <= 0) throw new Error('此職缺已滿');
                    tx.update(docRef, { count: window.firebase.firestore.FieldValue.increment(-1) });
                });
                    if (role.value === 'seeker') {
                        inlineMessage.value = '應徵成功（示意：已通知雇主）';
                        applyingDone.value = true;
                    } else {
                        modalTitle.value = '應徵成功';
                        modalMessage.value = '已通知雇主（示意）';
                        showModal.value = true;
                    }
            } catch (e) {
                const errMsg = (e && e.message) ? e.message : '未知錯誤，請稍後再試';
                console.error('[applyJob error]', errMsg, e, job);
                if (role.value === 'seeker') {
                    inlineMessage.value = '失敗：' + errMsg;
                } else {
                    modalTitle.value = '應徵失敗';
                    modalMessage.value = errMsg;
                    showModal.value = true;
                }
            }
        };

        // 時間更新
        let timeInterval = null;
        const updateTime = () => {
            const now = new Date();
            const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            currentTime.value = timeString;
        };

        // UI 控制
        const switchTab = (tab) => { currentTab.value = tab; };
        const chooseRole = (r) => { role.value = r; currentTab.value = r === 'seeker' ? 'search' : 'post'; };
        const saveOwnerId = () => { if (ownerInput.value) ownerId.value = ownerInput.value.trim(); };
        const closeModal = () => { showModal.value = false; };
        const confirmAction = () => {
            if (role.value === 'seeker' && selectedJob.value) {
                applyJob(selectedJob.value);
            }
            showModal.value = false;
        };

        const onLoginSuccess = () => {}; // 已不使用真實登入
        const onMockVerified = () => { mockVerified.value = true; };
        // 登出：重置所有與會話相關狀態
        const logout = () => {
            role.value = null;
            currentTab.value = 'search';
            selectedJob.value = null;
            ownerId.value = '';
            ownerInput.value = '';
            filters.region = '';
            filters.skill = '';
            mockVerified.value = false; // 回到驗證畫面
        };

        // 生命週期
        onMounted(() => {
            updateTime();
            timeInterval = setInterval(updateTime, 1000);
            startSubscribe();
            // 監聽登入狀態
            // 已移除真實 auth 監聽
        });
        onUnmounted(() => { if (timeInterval) clearInterval(timeInterval); if (typeof unsubscribe === 'function') unsubscribe(); });

        // 導出
        return {
            role,
            mockVerified,
            currentTab,
            selectedJob,
            inlineMessage,
            applyLoading,
            applyingDone,
            showModal,
            modalTitle,
            modalMessage,
            currentTime,
            jobs,
            regions,
            roles,
            storeTypes,
            timeSlots,
            skills,
            filters,
            filteredJobs,
            myJobs,
            navTabs,
            ownerId,
            ownerInput,
            viewJob,
            addJob,
            applyJob,
            applySelected,
            closeModal,
            confirmAction,
            switchTab,
            chooseRole,
            saveOwnerId,
            onLoginSuccess,
            // mockVerified 已在前面導出一次，避免重複
            onMockVerified,
            logout,
            closePanel
        };
    }
};