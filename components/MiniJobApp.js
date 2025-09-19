// Main App Component
// Main App Component (EN version)
const MiniJobApp = {
    template: `
        <div class="app">
        <!-- Status Bar -->
        <status-bar :current-time="currentTime"></status-bar>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Mock Phone Verification -->
            <template v-if="!mockVerified">
            <phone-mock @verified="onMockVerified"></phone-mock>
            </template>

            <!-- Role Selection (after verification) -->
            <template v-else-if="!role">
            <div class="job-section">
                <div class="section-title">Please choose your role</div>
                <div class="job-list">
                <div class="job-item" @click="chooseRole('seeker')">Find Jobs</div>
                <div class="job-item" @click="chooseRole('employer')">I'm an Employer</div>
                </div>
            </div>
            </template>

            <!-- Search Jobs -->
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
                <div class="panel-title">Job Details</div>
                <div class="panel-line">Region: {{ selectedJob.region }}</div>
                <div class="panel-line">Type: {{ selectedJob.storeType }}</div>
                <div class="panel-line">Roles: {{ selectedJob.roles.join(', ') }}</div>
                <div class="panel-line">Time: {{ selectedJob.time }}</div>
                <div class="panel-line">Remaining: {{ selectedJob.count }}</div>
                <div class="panel-actions">
                    <button class="panel-btn" @click="applySelected" :disabled="applyLoading || applyingDone || (selectedJob.count<=0)">
                    <span v-if="!applyingDone">{{ applyLoading ? 'Processing...' : 'Apply' }}</span>
                    <span v-else>Applied</span>
                    </button>
                    <button class="panel-btn secondary" @click="closePanel">Back to list</button>
                </div>
                <div class="panel-msg" v-if="inlineMessage">{{ inlineMessage }}</div>
                </div>
            </template>
            </template>

            <!-- Post a Job -->
            <template v-else-if="currentTab === 'post' && role === 'employer'">
            <div class="job-section" v-if="!ownerId">
                <div class="section-title">Please set your Employer ID first</div>
                <div class="job-item">
                <input 
                    type="text" 
                    placeholder="Enter Employer ID (any string)" 
                    v-model="ownerInput"
                    style="width:100%;font-size:6px;padding:2px;"
                />
                <div class="actions">
                    <button class="modal-btn" @click="saveOwnerId">Set</button>
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

            <!-- Employer: My Jobs -->
            <template v-else-if="currentTab === 'mine' && role === 'employer'">
            <div class="job-section" v-if="!ownerId">
                <div class="section-title">Please set your Employer ID first</div>
                <div class="job-item">
                <input 
                    type="text" 
                    placeholder="Enter Employer ID (any string)" 
                    v-model="ownerInput"
                    style="width:100%;font-size:6px;padding:2px;"
                />
                <div class="actions">
                    <button class="modal-btn" @click="saveOwnerId">Set</button>
                </div>
                </div>
            </div>
            <job-section :jobs="myJobs" @select-job="viewJob"></job-section>
            </template>
        </div>
        
        <!-- Bottom Navigation -->
        <bottom-nav 
            v-if="role"
            :current-tab="currentTab"
            :tabs="navTabs"
            :show-logout="true"
            @switch-tab="switchTab"
            @logout="logout"
        ></bottom-nav>
        
        <!-- Modal -->
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

        // State
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

        // Dictionaries (EN)
        const regions = ['Taipei', 'New Taipei', 'Taoyuan', 'Taichung', 'Tainan', 'Kaohsiung'];
        const roles = ['Front Desk', 'Server', 'Kitchen', 'Laborer', 'Cleaning'];
        const storeTypes = ['Food & Beverage', 'Retail', 'Service', 'Construction'];
        const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Flexible'];
        const skills = roles; // skills == roles

        // Firestore data
        const jobs = ref([]);
        const inlineMessage = ref('');
        const applyLoading = ref(false);
        const applyingDone = ref(false);

        // Filters
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

        // Employer watch
        const myJobs = computed(() => ownerId.value ? jobs.value.filter(j => j.ownerId === ownerId.value) : []);

        // Bottom nav (EN)
        const navTabs = computed(() => {
        if (role.value === 'seeker') return [ { key: 'search', label: 'Jobs' } ];
        if (role.value === 'employer') return [ { key: 'post', label: 'Post' }, { key: 'mine', label: 'My Jobs' } ];
        return [];
        });

        // Firestore subscribe
        let unsubscribe = null;
        const startSubscribe = () => {
        if (!window.db) {
            modalTitle.value = 'Connection failed';
            modalMessage.value = 'Firebase is not initialized or scripts not loaded. Please check your setup and network.';
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

        // Actions
        const viewJob = (job) => {
        const safeJob = { ...job, roles: normalizeRoles(job.roles) };
        selectedJob.value = safeJob;
        inlineMessage.value = '';
        applyingDone.value = false;
        if (role.value === 'employer') {
            modalTitle.value = `${safeJob.region} | ${safeJob.storeType}`;
            modalMessage.value = `Roles: ${safeJob.roles.join(', ')}` + `\nTime: ${safeJob.time}\nOpenings: ${safeJob.count}`;
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
            if (!window.db) throw new Error('Firebase is not initialized');
            if (!ownerId.value) throw new Error('Please set Employer ID first');
            const docData = { ...payload, createdAt: Date.now(), ownerId: ownerId.value };
            await window.db.collection('jobs').add(docData);
            modalTitle.value = 'Posted';
            modalMessage.value = 'Your job has been published.';
            showModal.value = true;
            currentTab.value = 'mine';
        } catch (e) {
            console.error(e);
            modalTitle.value = 'Post failed';
            modalMessage.value = 'Please check your network or Firebase configuration.';
            showModal.value = true;
        }
        };

        const applyJob = async (job) => {
        try {
            if (!window.firebase || !window.db) throw new Error('Firebase is not initialized');
            if (!job || !job.id) throw new Error('Invalid data: missing job ID');
            if (!Array.isArray(job.roles)) job.roles = normalizeRoles(job.roles);
            const docRef = window.db.collection('jobs').doc(job.id);
            await window.db.runTransaction(async (tx) => {
            const snap = await tx.get(docRef);
            if (!snap.exists) throw new Error('Job does not exist');
            const data = snap.data();
            const dataRoles = normalizeRoles(data.roles);
            if (!Array.isArray(dataRoles)) console.warn('[applyJob data roles malformed]', data.roles);
            const curr = data.count || 0;
            if (curr <= 0) throw new Error('This job is full');
            tx.update(docRef, { count: window.firebase.firestore.FieldValue.increment(-1) });
            });
            if (role.value === 'seeker') {
            inlineMessage.value = 'Applied successfully (demo: employer notified)';
            applyingDone.value = true;
            } else {
            modalTitle.value = 'Applied successfully';
            modalMessage.value = 'Employer has been notified (demo).';
            showModal.value = true;
            }
        } catch (e) {
            const errMsg = (e && e.message) ? e.message : 'Unknown error, please try again later';
            console.error('[applyJob error]', errMsg, e, job);
            if (role.value === 'seeker') {
            inlineMessage.value = 'Failed: ' + errMsg;
            } else {
            modalTitle.value = 'Apply failed';
            modalMessage.value = errMsg;
            showModal.value = true;
            }
        }
        };

        // Time
        let timeInterval = null;
        const updateTime = () => {
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        currentTime.value = timeString;
        };

        // UI Controls
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

        const onLoginSuccess = () => {}; // real login removed
        const onMockVerified = () => { mockVerified.value = true; };

        // Logout: reset session state
        const logout = () => {
        role.value = null;
        currentTab.value = 'search';
        selectedJob.value = null;
        ownerId.value = '';
        ownerInput.value = '';
        filters.region = '';
        filters.skill = '';
        mockVerified.value = false; // back to verification screen
        };

        // Lifecycle
        onMounted(() => {
        updateTime();
        timeInterval = setInterval(updateTime, 1000);
        startSubscribe();
        });
        onUnmounted(() => { if (timeInterval) clearInterval(timeInterval); if (typeof unsubscribe === 'function') unsubscribe(); });

        // Expose
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
        onMockVerified,
        logout,
        closePanel
        };
    }
};
