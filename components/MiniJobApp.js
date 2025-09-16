// Main App Component
const MiniJobApp = {
    template: `
        <div class="app">
            <!-- 狀態欄 -->
            <status-bar :current-time="currentTime"></status-bar>
            
            <!-- 主要內容 -->
            <div class="main-content">
                <!-- 登入 -->
                <template v-if="!user">
                    <phone-login @success="onLoginSuccess"></phone-login>
                </template>

                <!-- 主畫面：選擇身分 -->
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
        PhoneLogin,
        PostForm
    },
    setup() {
        const { ref, reactive, computed, onMounted, onUnmounted } = Vue;

        // 狀態
        const user = ref(null);
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

        // 篩選
        const filters = reactive({ region: '', skill: '' });
        const filteredJobs = computed(() => jobs.value.filter(j => {
            const regionOk = !filters.region || j.region === filters.region;
            const skillOk = !filters.skill || j.roles.includes(filters.skill);
            const countOk = (j.count ?? 0) > 0;
            return regionOk && skillOk && countOk;
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
                jobs.value = arr;
            }, err => console.error('[Firestore] onSnapshot error', err));
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
                const docRef = window.db.collection('jobs').doc(job.id);
                await window.db.runTransaction(async (tx) => {
                    const snap = await tx.get(docRef);
                    if (!snap.exists) throw new Error('職缺不存在');
                    const data = snap.data();
                    const curr = data.count || 0;
                    if (curr <= 0) throw new Error('此職缺已滿');
                    tx.update(docRef, { count: window.firebase.firestore.FieldValue.increment(-1) });
                });
                modalTitle.value = '應徵成功';
                modalMessage.value = '已通知雇主（示意）';
                showModal.value = true;
            } catch (e) {
                console.error(e);
                modalTitle.value = '應徵失敗';
                modalMessage.value = e.message || '請稍後再試';
                showModal.value = true;
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

        const onLoginSuccess = async (u) => {
            user.value = u;
            // 建立/更新使用者資料
            try {
                if (window.db && u && u.uid) {
                    const ref = window.db.collection('users').doc(u.uid);
                    await ref.set({
                        uid: u.uid,
                        phoneNumber: u.phoneNumber || '',
                        createdAt: window.firebase ? window.firebase.firestore.FieldValue.serverTimestamp() : Date.now(),
                        lastLoginAt: window.firebase ? window.firebase.firestore.FieldValue.serverTimestamp() : Date.now(),
                    }, { merge: true });
                }
            } catch (e) { console.warn('Persist user profile failed', e); }

            modalTitle.value = '歡迎登入';
            modalMessage.value = u.phoneNumber ? `已登入：${u.phoneNumber}` : '登入成功';
            showModal.value = true;
        };

        const logout = async () => {
            try {
                if (window.auth) await window.auth.signOut();
                user.value = null;
                role.value = null;
                modalTitle.value = '已登出';
                modalMessage.value = '您已成功登出。';
                showModal.value = true;
            } catch (e) {
                console.error(e);
                modalTitle.value = '登出失敗';
                modalMessage.value = '請稍後再試';
                showModal.value = true;
            }
        };

        // 生命週期
        onMounted(() => {
            updateTime();
            timeInterval = setInterval(updateTime, 1000);
            startSubscribe();
            // 監聽登入狀態
            if (window.auth) {
                window.auth.onAuthStateChanged(u => { user.value = u || null; });
            }
        });
        onUnmounted(() => { if (timeInterval) clearInterval(timeInterval); if (typeof unsubscribe === 'function') unsubscribe(); });

        // 導出
        return {
            user,
            role,
            currentTab,
            selectedJob,
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
            closeModal,
            confirmAction,
            switchTab,
            chooseRole,
            saveOwnerId,
            onLoginSuccess
        };
    }
};