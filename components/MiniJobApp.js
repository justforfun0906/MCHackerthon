// Main App Component
// Main App Component (EN version)
const MiniJobApp = {
    template: `
        <div class="app">
        <!-- App Header -->
        <app-header 
            :title="headerTitle"
        ></app-header>
        
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
            <!-- Step 1: Region and Skill Selection -->
            <template v-if="!filtersSelected">
                <div class="filter-selection-page">
                <div class="section-title">Select your preferences</div>
                <div class="filter-form">
                    <div class="field-row">
                    <label>Region</label>
                    <select v-model="filters.region" required>
                        <option value="" disabled>Select Region</option>
                        <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
                    </select>
                    </div>
                    <div class="field-row">
                    <label>Skill</label>
                    <select v-model="filters.skill" required>
                        <option value="" disabled>Select Skill</option>
                        <option v-for="s in skills" :key="s" :value="s">{{ s }}</option>
                    </select>
                    </div>
                    <div class="field-row">
                    <button class="modal-btn search-btn" @click="proceedToJobList" :disabled="!filters.region || !filters.skill">
                        Search Jobs
                    </button>
                    </div>
                </div>
                </div>
            </template>
            
            <!-- Step 2: Job Listing (after filters selected) -->
            <template v-else>
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
                    <button class="panel-btn" @click="applySelected" :disabled="applyLoading || applyingDone || (selectedJob.count<=0)" v-if="role === 'seeker'">
                        <span v-if="!applyingDone">{{ applyLoading ? 'Processing...' : 'Apply' }}</span>
                        <span v-else>Applied</span>
                    </button>
                    <button class="panel-btn secondary" @click="closePanel">Back to list</button>
                    </div>
                    <div class="panel-msg" v-if="inlineMessage">{{ inlineMessage }}</div>
                </div>
                </template>
            </template>
            </template>

            <!-- Post a Job (default view for employers) -->
            <template v-else-if="role === 'employer' && currentTab === 'post'">
            <post-form
                :regions="regions"
                :roles="roles"
                :store-types="storeTypes"
                :time-slots="timeSlots"
                @submit="addJob"
            ></post-form>
            </template>

            <!-- Employer: My Jobs -->
            <template v-else-if="currentTab === 'mine' && role === 'employer'">
            <template v-if="!selectedJob">
                <job-section :jobs="myJobs" @select-job="viewJob"></job-section>
            </template>
            <template v-else>
                <div class="inline-job-panel full">
                <div class="panel-title">Job Details</div>
                <div class="panel-line">Region: {{ selectedJob.region }}</div>
                <div class="panel-line">Type: {{ selectedJob.storeType }}</div>
                <div class="panel-line">Roles: {{ selectedJob.roles.join(', ') }}</div>
                <div class="panel-line">Time: {{ selectedJob.time }}</div>
                <div class="panel-line">Remaining: {{ selectedJob.count }}</div>
                <div class="panel-line">Address: {{ selectedJob.address || 'Not specified' }}</div>
                <div class="panel-line">Notes: {{ selectedJob.note || 'None' }}</div>
                <div class="panel-actions">
                    <button class="panel-btn delete-btn" @click="deleteSelected" v-if="role === 'employer'">
                    Delete Job
                    </button>
                    <button class="panel-btn secondary" @click="closePanel">Back to list</button>
                </div>
                <div class="panel-msg" v-if="inlineMessage">{{ inlineMessage }}</div>
                </div>
            </template>
            </template>
        </div>
        
        <!-- Bottom Navigation -->
        <bottom-nav 
            v-if="role"
            :current-tab="currentTab"
            :tabs="navTabs"
            :show-my-jobs="showMyJobsButton"
            :show-return="showReturnButton"
            :my-jobs-button-text="myJobsButtonText"
            @switch-tab="switchTab"
            @my-jobs-action="handleMyJobs"
            @return-action="handleReturn"
        ></bottom-nav>
        
        <!-- Modal -->
        <modal
            :show="showModal"
            :title="modalTitle"
            :message="modalMessage"
            @close="closeModal"
            @confirm="confirmAction"
        ></modal>
        
        <!-- Navigation Hint -->
        <navigation-hint
            v-if="mockVerified || role"
            :left-hint="leftSoftKeyHint"
            :right-hint="rightSoftKeyHint"
            :center-hint="centerHint"
        ></navigation-hint>
        </div>
    `,
    components: {
        AppHeader,
        NavigationHint,
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
        const filtersSelected = ref(false); // Track if region/skill filters are set

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

        // Employer watch - show all jobs for employer
        const myJobs = computed(() => jobs.value);

        // Bottom nav (EN)
        const navTabs = computed(() => {
        if (role.value === 'seeker') return [ { key: 'search', label: 'Jobs' } ];
        if (role.value === 'employer') return [ { key: 'mine', label: 'My Jobs' } ]; // Removed Post tab
        return [];
        });

        // Header state
        const headerTitle = computed(() => {
        if (!mockVerified.value) return 'Phone Verification';
        if (!role.value) return 'Choose Role';
        if (role.value === 'seeker') {
            if (selectedJob.value) return `Job: ${selectedJob.value.region}`;
            if (filtersSelected.value) return 'Job Listings';
            return 'Select Preferences';
        }
        if (role.value === 'employer') {
            if (currentTab.value === 'post') return 'Post New Job';
            if (currentTab.value === 'mine') return 'My Jobs';
        }
        return 'Mini Job App';
        });

        const leftSoftKey = computed(() => {
        if (selectedJob.value) return 'Options';
        if (role.value) return 'Menu';
        return '';
        });

        const rightSoftKey = computed(() => {
        if (selectedJob.value) return 'Back';
        if (role.value) return 'Logout';
        return '';
        });

        // Button visibility states
        const showMyJobsButton = computed(() => {
        // Show My Jobs button for employers
        return role.value === 'employer';
        });

        const myJobsButtonText = computed(() => {
        // Dynamic button text based on current view
        if (role.value === 'employer') {
            return currentTab.value === 'mine' ? 'Post Job' : 'My Jobs';
        }
        return 'My Jobs';
        });

        const showReturnButton = computed(() => {
        // Always show return button when user has a role
        return !!role.value;
        });

        // Dynamic soft key hints
        const leftSoftKeyHint = computed(() => {
        if (!mockVerified.value) return 'Enter';
        if (role.value) return 'Confirm';
        return 'Enter';
        });

        const rightSoftKeyHint = computed(() => {
        if (!mockVerified.value) return 'Clear/Quit';
        if (role.value) return 'Return';
        return 'Return';
        });

        const centerHint = computed(() => {
        if (!mockVerified.value) return 'Direct Number Input';
        return '↕ Navigate | ⏎ Select';
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
        
        // Update navigation when job is selected
        if (window.navigationService) {
            window.navigationService.updateFocusableElements();
        }
        
        // Remove modal logic for employers - they should see the inline panel instead
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
        
        // For employers, return to post form instead of my jobs list
        if (role.value === 'employer') {
            currentTab.value = 'post';
        }
        
        // Update navigation when panel is closed
        if (window.navigationService) {
            window.navigationService.updateFocusableElements();
        }
        };

        const addJob = async (payload) => {
        try {
            if (!window.db) throw new Error('Firebase is not initialized');
            const docData = { ...payload, createdAt: Date.now() };
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

        const deleteJob = async (job) => {
        try {
            if (!window.db) throw new Error('Firebase is not initialized');
            if (!job || !job.id) throw new Error('Invalid job data');
            
            await window.db.collection('jobs').doc(job.id).delete();
            
            modalTitle.value = 'Deleted';
            modalMessage.value = 'Job has been deleted successfully.';
            showModal.value = true;
            
            // Close the job detail panel and return to post form
            selectedJob.value = null;
            currentTab.value = 'post';
        } catch (e) {
            console.error(e);
            modalTitle.value = 'Delete failed';
            modalMessage.value = 'Failed to delete job. Please try again.';
            showModal.value = true;
        }
        };

        const deleteSelected = () => {
        if (!selectedJob.value) return;
        
        modalTitle.value = 'Confirm Delete';
        modalMessage.value = `Are you sure you want to delete this job posting?`;
        showModal.value = true;
        
        // Set a flag to indicate this is a delete confirmation
        window.pendingDeleteJob = selectedJob.value;
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
        const chooseRole = (r) => { 
        role.value = r; 
        if (r === 'seeker') {
            currentTab.value = 'search';
            filtersSelected.value = false; // Reset filter selection for seekers
        } else if (r === 'employer') {
            currentTab.value = 'post'; // Default to post form for employers
        }
        };

        const proceedToJobList = () => {
        if (filters.region && filters.skill) {
            filtersSelected.value = true;
        }
        };

        const backToFilterSelection = () => {
        filtersSelected.value = false;
        selectedJob.value = null;
        };

        const closeModal = () => { 
        showModal.value = false; 
        // Clean up any pending delete job
        window.pendingDeleteJob = null;
        };
        const confirmAction = () => {
        // Check if this is a delete confirmation
        if (window.pendingDeleteJob) {
            deleteJob(window.pendingDeleteJob);
            window.pendingDeleteJob = null;
        } else if (role.value === 'seeker' && selectedJob.value) {
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
        filters.region = '';
        filters.skill = '';
        mockVerified.value = false; // back to verification screen
        };

        // Action handlers for new buttons
        const handleMyJobs = () => {
        // Toggle between Post form and My Jobs for employers
        if (role.value === 'employer') {
            currentTab.value = currentTab.value === 'mine' ? 'post' : 'mine';
        }
        };

        const handleReturn = () => {
        if (selectedJob.value) {
            // Return from job detail view to job list (for seekers) or post form (for employers)
            selectedJob.value = null;
            if (role.value === 'employer') {
            currentTab.value = 'post'; // Go to post form for employers
            }
            // For seekers, stay on the job listing (filtersSelected remains true)
        } else if (role.value === 'seeker' && filtersSelected.value) {
            // Return from job listing to filter selection page
            backToFilterSelection();
        } else {
            // Return to role selection (not logout)
            role.value = null;
            currentTab.value = 'search';
            selectedJob.value = null;
            filters.region = '';
            filters.skill = '';
            filtersSelected.value = false;
            // Keep mockVerified as true so we go back to role selection
        }
        };

        // Lifecycle
        onMounted(() => {
        updateTime();
        timeInterval = setInterval(updateTime, 1000);
        startSubscribe();
        
        // Initialize navigation
        if (window.navigationService) {
            window.navigationService.activate();
            window.navigationService.setCallbacks({
            onEscape: () => {
                // Left Soft Key - My Jobs action (if applicable)
                if (showMyJobsButton.value) {
                handleMyJobs();
                }
            },
            onBack: () => {
                // Right Soft Key - Return action  
                handleReturn();
            }
            });
        }
        });
        onUnmounted(() => { 
        if (timeInterval) clearInterval(timeInterval); 
        if (typeof unsubscribe === 'function') unsubscribe(); 
        if (window.navigationService) {
            window.navigationService.deactivate();
        }
        });

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
        filtersSelected,
        regions,
        roles,
        storeTypes,
        timeSlots,
        skills,
        filters,
        filteredJobs,
        myJobs,
        navTabs,
        headerTitle,
        leftSoftKey,
        rightSoftKey,
        showMyJobsButton,
        myJobsButtonText,
        showReturnButton,
        leftSoftKeyHint,
        rightSoftKeyHint,
        centerHint,
        viewJob,
        addJob,
        deleteJob,
        deleteSelected,
        applyJob,
        applySelected,
        closeModal,
        confirmAction,
        switchTab,
        chooseRole,
        proceedToJobList,
        backToFilterSelection,
        onLoginSuccess,
        onMockVerified,
        logout,
        closePanel,
        handleMyJobs,
        handleReturn
        };
    }
};
