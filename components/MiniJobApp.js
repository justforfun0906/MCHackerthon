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

            <!-- Employer Choice Selection (after choosing employer role) -->
            <template v-else-if="role === 'employer' && !employerChoice">
            <div class="job-section">
                <div class="section-title">What would you like to do?</div>
                <div class="job-list">
                <div class="job-item" @click="chooseEmployerAction('post')">Post New Jobs</div>
                <div class="job-item" @click="chooseEmployerAction('mine')">My Jobs</div>
                <div class="job-item" @click="chooseEmployerAction('inbox')">Inbox ({{ applications.length }})</div>
                </div>
            </div>
            </template>

            <!-- Profile Page -->
            <template v-else-if="currentTab === 'profile'">
            <user-profile ref="profileRef" :user-id="userId" @back="handleReturn" @saved="onProfileSaved" />
            </template>

            <!-- Search Jobs -->
            <template v-else-if="currentTab === 'search' && role === 'seeker'">
            <!-- Step 1: Selection menu -->
            <template v-if="!filtersSelected">
                <div class="filter-selection-page">
                    <div class="section-title">Select your preferences</div>
                    <div class="job-list">
                        <div class="job-item" @click="startRegionSelection">
                            <span>Regions: {{ regionDisplayText }}</span>
                            <span v-if="filters.region.length">✓</span>
                        </div>
                        <div class="job-item" @click="startSkillSelection">
                            <span>Skill: {{ filters.skill || 'Not selected' }}</span>
                            <span v-if="filters.skill">✓</span>
                        </div>
                        <!-- Inserted: open profile from menu -->
                        <div class="job-item" @click="openProfile">My Profile</div>
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
                <div class="inline-job-panel full scrollable" tabindex="0">
                    <div class="panel-title">Job Details</div>
                    <div class="panel-line">Region: {{ selectedJob.region }}</div>
                    <div class="panel-line">Type: {{ selectedJob.storeType }}</div>
                    <div class="panel-line">Roles: {{ selectedJob.roles.join(', ') }}</div>
                    <div class="panel-line">Time: {{ selectedJob.time }}</div>
                    <div class="panel-line">Remaining: {{ selectedJob.count }}</div>
                    <div class="panel-actions">
                    <!-- Apply and Back to list now controlled by soft keys -->
                    </div>
                    <!-- Actions moved to soft keys: LSK = Confirm (Apply), RSK = Close -->
                    <div class="panel-msg" v-if="inlineMessage">{{ inlineMessage }}</div>
                </div>
                </template>
            </template>
            </template>

            <!-- Seeker: Region selection page (standard page) -->
            <template v-else-if="currentTab === 'select-region' && role === 'seeker'">
                <selection-page
                    selection-type="region"
                    :options="regions"
                    :selected-value="filters.region"
                    :multi-select="true"
                    @selected="onSelectionMade"
                    @back="backFromRegion"
                ></selection-page>
            </template>

            <!-- Seeker: Skill selection page (standard page) -->
            <template v-else-if="currentTab === 'select-skill' && role === 'seeker'">
                <selection-page
                    selection-type="skill"
                    :options="skills"
                    :selected-value="filters.skill"
                    @selected="onSelectionMade"
                    @back="backFromSkill"
                ></selection-page>
            </template>

            <!-- Post a Job (default view for employers) -->
            <template v-else-if="role === 'employer' && employerChoice === 'post'">
            <post-form
                :regions="regions"
                :roles="roles"
                :store-types="storeTypes"
                :time-slots="timeSlots"
                @submit="addJob"
            ></post-form>
            </template>

            <!-- Employer: My Jobs -->
            <template v-else-if="role === 'employer' && employerChoice === 'mine'">
            <template v-if="!selectedJob">
                <job-section :jobs="myJobs" @select-job="viewJob"></job-section>
            </template>
            <template v-else>
                <div class="inline-job-panel full scrollable" tabindex="0">
                <div class="panel-title">Job Details</div>
                <div class="panel-line">Region: {{ selectedJob.region }}</div>
                <div class="panel-line">Type: {{ selectedJob.storeType }}</div>
                <div class="panel-line">Roles: {{ selectedJob.roles.join(', ') }}</div>
                <div class="panel-line">Time: {{ selectedJob.time }}</div>
                <div class="panel-line">Remaining: {{ selectedJob.count }}</div>
                <div class="panel-line">Address: {{ selectedJob.address || 'Not specified' }}</div>
                <div class="panel-line">Notes: {{ selectedJob.note || 'None' }}</div>
                <!-- Actions moved to soft keys: LSK = Confirm (Delete), RSK = Close -->
                <div class="panel-msg" v-if="inlineMessage">{{ inlineMessage }}</div>
                </div>
            </template>
            </template>

            <!-- Employer: Inbox -->
            <template v-else-if="role === 'employer' && employerChoice === 'inbox'">
            <template v-if="!selectedApplicant">
                <inbox-page :applications="applications" @select-applicant="viewApplicant"></inbox-page>
            </template>
            <template v-else>
                <div class="inline-job-panel full scrollable" tabindex="0">
                <div class="panel-title">Applicant Details</div>
                <div class="panel-line">Name: {{ selectedApplicant.applicantName || 'Anonymous' }}</div>
                <div class="panel-line">Phone: {{ selectedApplicant.phone || 'Not provided' }}</div>
                <div class="panel-line">Applied for: {{ selectedApplicant.jobTitle }}</div>
                <div class="panel-line">Applied at: {{ formatApplicationTime(selectedApplicant.appliedAt) }}</div>
                <div v-if="selectedApplicant.experience" class="panel-line">Experience: {{ selectedApplicant.experience }}</div>
                <div v-if="selectedApplicant.skills" class="panel-line">Skills: {{ selectedApplicant.skills }}</div>
                <div v-if="selectedApplicant.notes" class="panel-line">Notes: {{ selectedApplicant.notes }}</div>
                <!-- Actions moved to soft keys: LSK = Contact, RSK = Close -->
                <div class="panel-msg" v-if="inlineMessage">{{ inlineMessage }}</div>
                </div>
            </template>
            </template>
        </div>
        <bottom-nav 
            v-if="role"
        ></bottom-nav>
        
        <!-- Modal -->
        <modal
            :show="showModal"
            :title="modalTitle"
            :message="modalMessage"
            @close="closeModal"
            @confirm="confirmAction"
        ></modal>
        
        <!-- Soft Keys -->
        <soft-keys
            v-if="mockVerified || role"
            @softkeyclick="handleSoftKeyClick"
        ></soft-keys>
        </div>
    `,
    components: {
        StatusBar,
        JobSection,
        BottomNav,
        Modal,
        FilterBar,
        PhoneMock,
        PostForm,
        SelectionPage,
        UserProfile,
        SoftKeys,
        InboxPage
    },
    setup() {
    const { ref, reactive, computed, onMounted, onUnmounted } = Vue;
    const profileRef = ref(null);

        // State
        const mockVerified = ref(false);
        const role = ref(null); // 'seeker' | 'employer'
        const currentTab = ref('search'); // 'search' | 'post' | 'mine' | 'profile' | 'inbox'
        const selectedJob = ref(null);
        const selectedApplicant = ref(null);
        const showModal = ref(false);
        const modalTitle = ref('');
        const modalMessage = ref('');
        const currentTime = ref('00:00');
        const filtersSelected = ref(false); // Track if region/skill filters are set
        const showSelectionPage = ref(null); // 'region' | 'skill' | null
        const selectionFlow = ref('menu'); // 'menu' | 'region' | 'skill' | 'complete'
        const employerChoice = ref(null); // 'post' | 'mine' | 'inbox' | null - for employer role selection
        const userId = ref('');
        const applications = ref([]); // Store job applications

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

        // Filters - regions is now an array for multi-select
        const filters = reactive({ region: [], skill: '' });
        const PREFS_KEY = 'seekerPrefs';
        const loadPrefs = () => {
            try {
                const raw = localStorage.getItem(PREFS_KEY);
                if (raw) {
                    const obj = JSON.parse(raw);
                    if (obj && obj.region && Array.isArray(obj.region)) filters.region = obj.region;
                    if (obj && typeof obj.skill === 'string') filters.skill = obj.skill;
                }
            } catch {}
        };
        const savePrefs = () => {
            try { localStorage.setItem(PREFS_KEY, JSON.stringify({ region: filters.region, skill: filters.skill, ts: Date.now() })); } catch {}
        };
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
            // Region filtering: check if job region is in selected regions array
            const regionOk = !filters.region.length || filters.region.includes(j.region);
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
        if (role.value === 'employer') return [ { key: 'mine', label: 'My Jobs' } ];
        return [];
        });

        // Display text for selected regions
        const regionDisplayText = computed(() => {
            if (!filters.region.length) return 'Not selected';
            if (filters.region.length === 1) return filters.region[0];
            if (filters.region.length === 2) return filters.region.join(', ');
            return `${filters.region.length} regions selected`;
        });

        // Header state
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


        // Firestore subscribe
        let unsubscribe = null;
        let unsubscribeApplications = null;
        const startSubscribe = () => {
        if (!window.db) {
            modalTitle.value = 'Connection failed';
            modalMessage.value = 'Firebase is not initialized or scripts not loaded. Please check your setup and network.';
            showModal.value = true;
            return;
        }
        
        // Subscribe to jobs
        const col = window.db.collection('jobs');
        unsubscribe = col.orderBy('createdAt', 'desc').onSnapshot(snap => {
            console.log('📊 Firestore snapshot received, size:', snap.size);
            console.log('📊 Snapshot change type:', snap.docChanges().map(change => `${change.type}: ${change.doc.id}`));
            const arr = [];
            snap.forEach(doc => {
                const docData = doc.data();
                const data = { ...docData, id: doc.id }; // Ensure Firestore doc ID takes precedence
                console.log('📊 Job in snapshot:', doc.id, 'type of id:', typeof doc.id, data.region, data.storeType);
                console.log('📊 Doc data id vs Firestore id:', docData.id, 'vs', doc.id);
                arr.push(data);
            });
            // Normalize roles to always be an array of strings and ensure id is string
            const oldJobCount = jobs.value.length;
            jobs.value = arr.map(j => {
            let rolesNorm = [];
            if (Array.isArray(j.roles)) rolesNorm = j.roles.filter(r => typeof r === 'string');
            else if (typeof j.roles === 'string') rolesNorm = [j.roles];
            return { ...j, roles: rolesNorm, id: String(j.id) };
            });
            console.log('📊 Updated jobs array, old count:', oldJobCount, 'new count:', jobs.value.length);
            console.log('📊 Current job IDs:', jobs.value.map(j => j.id));
        }, err => console.error('[Firestore] onSnapshot error', err));
        
        // Subscribe to applications
        const applicationsCol = window.db.collection('applications');
        unsubscribeApplications = applicationsCol.orderBy('appliedAt', 'desc').onSnapshot(snap => {
            console.log('📨 Applications snapshot received, size:', snap.size);
            const arr = [];
            snap.forEach(doc => {
                const data = { ...doc.data(), id: doc.id };
                arr.push(data);
            });
            applications.value = arr;
            console.log('📨 Updated applications array, count:', applications.value.length);
        }, err => console.error('[Firestore] applications onSnapshot error', err));
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
        const closePanel = () => {
        selectedJob.value = null;
        selectedApplicant.value = null;
        inlineMessage.value = '';
        applyingDone.value = false;
        
        // For employers, stay in current context (don't change currentTab)
        // For seekers, ensure we stay on the job listing
        if (role.value === 'seeker') {
            filtersSelected.value = true;
        }
        
        // Update navigation when panel is closed
        if (window.navigationService) {
            window.navigationService.updateFocusableElements();
        }
        };

        const viewApplicant = (applicant) => {
            selectedApplicant.value = applicant;
            inlineMessage.value = '';
            
            // Update navigation when applicant is selected
            if (window.navigationService) {
                window.navigationService.updateFocusableElements();
            }
        };

        const formatApplicationTime = (timestamp) => {
            if (!timestamp) return 'Unknown';
            const date = new Date(timestamp);
            return date.toLocaleString();
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
        console.log('🔥 deleteJob called with job:', job);
        console.log('🔥 job.id:', job?.id);
        console.log('🔥 job.id type:', typeof job?.id);
        console.log('🔥 window.db exists?', !!window.db);
        
        try {
            if (!window.db) {
                console.log('❌ Firebase not initialized');
                throw new Error('Firebase is not initialized');
            }
            if (!job || !job.id) {
                console.log('❌ Invalid job data, job:', job);
                throw new Error('Invalid job data');
            }
            
            // Ensure job.id is a string
            const jobId = String(job.id);
            console.log('🔥 About to delete job with ID:', jobId);
            console.log('🔥 jobId type after String():', typeof jobId);
            
            const deleteResult = await window.db.collection('jobs').doc(jobId).delete();
            console.log('✅ Delete operation completed, result:', deleteResult);
            
            modalTitle.value = 'Deleted';
            modalMessage.value = 'Job has been deleted successfully.';
            showModal.value = true;
            console.log('✅ Modal set to show success message');
            
            // Close the job detail panel and stay in current context
            selectedJob.value = null;
            console.log('✅ selectedJob cleared');
            // Don't change currentTab - stay where the user was (My Jobs or Post)
        } catch (e) {
            console.error('❌ Delete job error:', e);
            console.error('❌ Error details:', {
                message: e.message,
                code: e.code,
                stack: e.stack
            });
            modalTitle.value = 'Delete failed';
            modalMessage.value = 'Failed to delete job. Please try again.';
            showModal.value = true;
        }
        };

        const deleteSelected = () => {
        console.log('🗑️ deleteSelected called');
        console.log('🗑️ selectedJob.value:', selectedJob.value);
        
        if (!selectedJob.value) {
            console.log('❌ No selected job, returning');
            return;
        }
        
        modalTitle.value = 'Confirm Delete';
        modalMessage.value = `Are you sure you want to delete this job posting?`;
        showModal.value = true;
        
        // Set a flag to indicate this is a delete confirmation
        window.pendingDeleteJob = selectedJob.value;
        console.log('🗑️ Set window.pendingDeleteJob to:', window.pendingDeleteJob);
        console.log('🗑️ Modal should now be visible, showModal.value:', showModal.value);
        };

        const applyJob = async (job) => {
        try {
            if (!window.firebase || !window.db) throw new Error('Firebase is not initialized');
            if (!job || !job.id) throw new Error('Invalid data: missing job ID');
            if (!Array.isArray(job.roles)) job.roles = normalizeRoles(job.roles);
            
            // Create application record
            const applicationData = {
                jobId: job.id,
                jobTitle: `${job.region} - ${job.storeType} (${job.roles.join(', ')})`,
                applicantName: 'Demo User', // In a real app, this would come from user profile
                phone: userId.value || 'Not provided',
                appliedAt: Date.now(),
                experience: 'Entry level', // Could be from user profile
                skills: job.roles[0], // Take first role as skill
                notes: 'Applied through mobile app'
            };
            
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
            
            // Store application in Firestore
            await window.db.collection('applications').add(applicationData);
            });
            
            // Add to local applications array for immediate UI update
            applications.value.unshift({
                id: Date.now().toString(),
                ...applicationData
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
            selectionFlow.value = 'menu'; // Reset to menu
            // Reset filters
            filters.region = [];
            filters.skill = '';
        } else if (r === 'employer') {
            // Don't set currentTab immediately, wait for employer choice
            employerChoice.value = null;
        }
        };

        const chooseEmployerAction = (action) => {
        employerChoice.value = action;
        if (action === 'post') {
            currentTab.value = 'post';
        } else if (action === 'mine') {
            currentTab.value = 'mine';
        } else if (action === 'inbox') {
            currentTab.value = 'inbox';
        }
        };

        const proceedToJobList = () => {
        if (filters.region.length && filters.skill) {
            filtersSelected.value = true;
            // Focus on the first job after proceeding to job list
            if (window.navigationService) {
                setTimeout(() => {
                    window.navigationService.updateFocusableElements();
                    window.navigationService.focusFirstElement();
                }, 100);
            }
        }
        };

        // New selection flow functions
        const startRegionSelection = () => {
            currentTab.value = 'select-region';
        };

        const startSkillSelection = () => {
            currentTab.value = 'select-skill';
        };

        const onSelectionMade = (selection) => {
            if (selection.type === 'region') {
                if (selection.multiSelect) {
                    filters.region = Array.isArray(selection.value) ? selection.value : [];
                    // Only navigate back when selection is finished (e.g., Back/Escape inside component)
                    if (selection.finished) {
                        currentTab.value = 'search';
                    }
                } else {
                    filters.region = [selection.value];
                    currentTab.value = 'search';
                }
            } else if (selection.type === 'skill') {
                filters.skill = selection.value;
                // Keep current behavior for skill: return to preferences menu
                currentTab.value = 'search';
            }
            savePrefs();
        };

        const backToMenu = () => {
            currentTab.value = 'search';
            if (window.navigationService) {
                setTimeout(() => {
                    window.navigationService.updateFocusableElements();
                    window.navigationService.focusFirstElement();
                }, 100);
            }
        };

        const backFromRegion = () => { backToMenu(); };
        const backFromSkill = () => { backToMenu(); };

        const backToFilterSelection = () => {
        filtersSelected.value = false;
        selectedJob.value = null;
        selectionFlow.value = 'menu'; // Reset to menu
        // Navigation will be updated by the filtersSelected watch
        };

        const closeModal = () => { 
        showModal.value = false; 
        // Clean up any pending delete job
        window.pendingDeleteJob = null;
        };
        const confirmAction = () => {
        console.log('✅ confirmAction called');
        console.log('✅ window.pendingDeleteJob:', window.pendingDeleteJob);
        console.log('✅ role.value:', role.value);
        console.log('✅ selectedJob.value:', selectedJob.value);
        
        // Check if this is a delete confirmation
        if (window.pendingDeleteJob) {
            console.log('✅ Calling deleteJob with pendingDeleteJob');
            deleteJob(window.pendingDeleteJob);
            window.pendingDeleteJob = null;
            console.log('✅ Cleared window.pendingDeleteJob');
        } else if (role.value === 'seeker' && selectedJob.value) {
            console.log('✅ Calling applyJob for seeker');
            applyJob(selectedJob.value);
        } else {
            console.log('⚠️ No action taken in confirmAction');
        }
        showModal.value = false;
        console.log('✅ Set showModal.value to false');
        };

        const onLoginSuccess = () => {}; // real login removed
        const onMockVerified = (payload) => { 
            mockVerified.value = true; 
            try {
                const phone = (payload && payload.phone) ? String(payload.phone) : '';
                userId.value = phone ? `phone:${phone}` : (userId.value || 'demo-user');
            } catch { userId.value = userId.value || 'demo-user'; }
        };

        // Action handlers for new buttons
        const handleMyJobs = () => {
        // Toggle between Post form and My Jobs for employers
        if (role.value === 'employer') {
            if (employerChoice.value === 'post') {
                employerChoice.value = 'mine';
                currentTab.value = 'mine';
            } else if (employerChoice.value === 'mine') {
                employerChoice.value = 'post';
                currentTab.value = 'post';
            }
        } else if (role.value === 'seeker') {
            currentTab.value = 'profile';
        }
        };

        // Logout: reset session state
        const logout = () => {
        role.value = null;
        currentTab.value = 'search';
        selectedJob.value = null;
        filters.region = '';
        filters.skill = '';
        employerChoice.value = null; // Reset employer choice
        mockVerified.value = false; // back to verification screen
        };

        const onProfileSaved = (payload) => {
        // No global state yet; could integrate with header/user card later
        };


        const handleReturn = () => {
        // Seeker: dedicated region/skill pages
        if (role.value === 'seeker' && (currentTab.value === 'select-region' || currentTab.value === 'select-skill')) {
            backToMenu();
            return;
        }
        if (currentTab.value === 'profile') {
            if (role.value === 'seeker') {
                currentTab.value = 'search';
            } else if (role.value === 'employer') {
                currentTab.value = employerChoice.value || 'mine';
            } else {
                currentTab.value = 'search';
            }
            return;
        }
        // (Handled above) Seeker selection flow
        if (selectedJob.value || selectedApplicant.value) {
            // Return from job detail view or applicant detail view to list
            selectedJob.value = null;
            selectedApplicant.value = null;
            if (role.value === 'seeker') {
                // For seekers, ensure we stay on the job listing
                filtersSelected.value = true;
            } else if (role.value === 'employer') {
                // For employers, stay in current employer choice (post, mine, or inbox)
            }
        } else if (role.value === 'seeker' && filtersSelected.value) {
            // Return from job listing to filter selection page
            backToFilterSelection();
        } else if (role.value === 'employer' && employerChoice.value) {
            // Return from employer action to employer choice selection
            employerChoice.value = null;
        } else {
            // Return to role selection (not logout)
            role.value = null;
            currentTab.value = 'search';
            selectedJob.value = null;
            selectedApplicant.value = null;
            filters.region = '';
            filters.skill = '';
            filtersSelected.value = false;
            employerChoice.value = null;
            // Keep mockVerified as true so we go back to role selection
        }
        };

        // Soft key click handler
        const handleSoftKeyClick = (event) => {
            const { key, action } = event.detail;
            console.log('🎯 Soft key clicked:', key, 'showModal:', showModal.value, 'selectedJob:', !!selectedJob.value, 'role:', role.value);
            
            switch (key) {
                case 'lsk': // Left Soft Key - Confirm
                    console.log('🎯 LSK pressed');
                    if (showModal.value) {
                        console.log('🎯 Modal is showing, calling confirmAction');
                        // Confirm current modal action (e.g., delete)
                        confirmAction();
                    } else if (role.value === 'seeker' && (currentTab.value === 'select-region' || currentTab.value === 'select-skill')) {
                        // Finish selection and return to preferences menu
                        if (currentTab.value === 'select-region') {
                            // Mark selection finished so onSelectionMade won't bounce early
                            onSelectionMade({ type: 'region', value: filters.region.slice(0), multiSelect: true, finished: true });
                            backFromRegion();
                        } else if (currentTab.value === 'select-skill') {
                            backFromSkill();
                        }
                        break;
                    } else if (currentTab.value === 'profile') {
                        if (profileRef.value && typeof profileRef.value.save === 'function') {
                            profileRef.value.save();
                        }
                    } else if (selectedJob.value || selectedApplicant.value) {
                        console.log('🎯 Job or applicant selected, role is:', role.value);
                        if (role.value === 'seeker' && selectedJob.value) {
                            console.log('🎯 Seeker applying for job');
                            // Seeker: LSK triggers apply
                            applyJob(selectedJob.value);
                        } else if (role.value === 'employer' && selectedJob.value) {
                            console.log('🎯 Employer with job - calling deleteSelected');
                            // Employer: LSK triggers delete confirmation
                            deleteSelected();
                        } else if (role.value === 'employer' && selectedApplicant.value) {
                            console.log('🎯 Employer with applicant - contact action');
                            // Employer viewing applicant: LSK for contact action
                            inlineMessage.value = `Contact ${selectedApplicant.value.applicantName || 'applicant'} at ${selectedApplicant.value.phone || 'phone not available'}`;
                        }
                    } else if (!role.value) {
                        // Role selection page - trigger the currently focused element
                        if (window.navigationService) {
                            const currentElement = window.navigationService.getCurrentFocusElement();
                            if (currentElement && currentElement.click) {
                                currentElement.click();
                            }
                        }
                    } else if (role.value === 'seeker' && !filtersSelected.value) {
                        // In filter selection, LSK has smart behavior
                        if (filters.region.length && filters.skill) {
                            // Both selected, proceed to job list
                            proceedToJobList();
                        } else if (filters.region.length && !filters.skill) {
                            // Region selected but not skill, go to skill selection
                            startSkillSelection();
                        } else if (!filters.region.length) {
                            // No region selected, go to region selection
                            startRegionSelection();
                        }
                    } else if (role.value === 'employer' && !employerChoice.value) {
                        // Employer choice selection page - trigger the currently focused element
                        if (window.navigationService) {
                            const currentElement = window.navigationService.getCurrentFocusElement();
                            if (currentElement && currentElement.click) {
                                currentElement.click();
                            }
                        }
                    }
                    break;
                    
                case 'rsk': // Right Soft Key - Return
                    if (showModal.value) {
                        closeModal();
                    } else if (selectedJob.value || selectedApplicant.value) {
                        // Back to list from job detail or applicant detail
                        closePanel();
                    } else if (currentTab.value === 'profile') {
                        handleReturn();
                    } else if (role.value === 'seeker' && (currentTab.value === 'select-region' || currentTab.value === 'select-skill')) {
                        // From dedicated selection pages, go back to preferences menu
                        backToMenu();
                    } else if (role.value === 'seeker' && currentTab.value === 'search' && !filtersSelected.value) {
                        // From preferences menu, go to role chooser
                        handleReturn();
                    } else {
                        handleReturn();
                    }
                    break;
                    
                case 'enter': // Center key - 不觸發任何動作
                    // 中心鍵現在只是視覺指示器，不觸發任何動作
                    break;
            }
        };

        // Watch for mockVerified changes to update navigation
        Vue.watch(mockVerified, (newVerified) => {
            if (newVerified && window.navigationService) {
                // Update navigation when entering role selection
                setTimeout(() => {
                    window.navigationService.updateFocusableElements();
                }, 300);
            }
        });

        // Watch for role changes to update navigation
        Vue.watch(role, (newRole) => {
            // Update navigation when role changes
            if (window.navigationService) {
                setTimeout(() => {
                    window.navigationService.updateFocusableElements();
                    window.navigationService.focusFirstElement();
                }, 200);
            }
        });

        // Watch for currentTab changes to update navigation
        Vue.watch(currentTab, (newTab) => {
            if (window.navigationService) {
                setTimeout(() => {
                    window.navigationService.updateFocusableElements();
                    window.navigationService.focusFirstElement();
                }, 200);
            }
        });

        // Watch for selectedJob changes to update navigation
        Vue.watch(selectedJob, (newJob) => {
            if (window.navigationService) {
                setTimeout(() => {
                    window.navigationService.updateFocusableElements();
                    window.navigationService.focusFirstElement();
                }, 200);
            }
        });

        // Watch for selectionFlow changes to update navigation
        Vue.watch(selectionFlow, (newFlow) => {
            if (window.navigationService) {
                setTimeout(() => {
                    window.navigationService.updateFocusableElements();
                    window.navigationService.focusFirstElement();
                }, 200);
            }
        });

        // Watch for employerChoice changes to update navigation
        Vue.watch(employerChoice, (newChoice) => {
            if (window.navigationService) {
                setTimeout(() => {
                    window.navigationService.updateFocusableElements();
                    window.navigationService.focusFirstElement();
                }, 200);
            }
        });

        // Watch for filter changes to update soft key labels
        Vue.watch([() => filters.region, () => filters.skill], () => {
            savePrefs();
            updateSoftKeyLabels();
        });

        // Watch for selectedJob changes to update soft key labels
        Vue.watch(selectedJob, () => {
            updateSoftKeyLabels();
        });

        // Watch for filtersSelected changes to update navigation
        Vue.watch(filtersSelected, (newValue) => {
            if (window.navigationService) {
                // When entering job list, focus on the first job
                // When returning to preferences, focus on the first element
                setTimeout(() => {
                    window.navigationService.updateFocusableElements();
                    window.navigationService.focusFirstElement();
                }, 200); // Increased delay to ensure DOM is fully updated
            }
        });

        // Function to update soft key labels
        const updateSoftKeyLabels = () => {
            const softKeysElement = document.querySelector('soft-keys');
            if (softKeysElement) {
                if (currentTab.value === 'profile') {
                    softKeysElement.updateLabels({
                        left: 'Save',
                        center: 'Enter',
                        right: 'Back'
                    });
                } else if (role.value === 'seeker' && (currentTab.value === 'select-region' || currentTab.value === 'select-skill')) {
                    softKeysElement.updateLabels({
                        left: 'Done',
                        center: 'Enter',
                        right: 'Back'
                    });
                } else if (selectedJob.value && role.value === 'seeker') {
                    // Job details page for seekers - show Apply
                    softKeysElement.updateLabels({
                        left: 'Apply',
                        center: 'Enter',
                        right: 'Back'
                    });
                } else if (selectedJob.value && role.value === 'employer') {
                    // Job details page for employers - show Delete
                    softKeysElement.updateLabels({
                        left: 'Delete',
                        center: 'Enter',
                        right: 'Back'
                    });
                } else if (selectedApplicant.value && role.value === 'employer') {
                    // Applicant details page for employers - show Contact
                    softKeysElement.updateLabels({
                        left: 'Contact',
                        center: 'Enter',
                        right: 'Back'
                    });
                } else if (role.value === 'seeker' && !filtersSelected.value) {
                    if (filters.region.length && filters.skill) {
                        // Both selected, show "送出" (Submit)
                        softKeysElement.updateLabels({
                            left: 'Submit',
                            center: 'Enter',
                            right: 'Back'
                        });
                    } else {
                        // Not both selected, show "confirm" (Confirm)
                        softKeysElement.updateLabels({
                            left: 'Confirm',
                            center: 'Enter',
                            right: 'Back'
                        });
                    }
                } else {
                    // Default labels
                    softKeysElement.updateLabels({
                        left: 'Confirm',
                        center: 'Enter',
                        right: 'Back'
                    });
                }
            }
        };

    // Lifecycle
    const triggerRSK = () => {
        const sk = document.querySelector('soft-keys');
        if (sk) {
            const evt = new CustomEvent('softkeyclick', { bubbles: true, composed: true, detail: { key: 'rsk', source: 'hardware-back', action: 'return' } });
            sk.dispatchEvent(evt);
        } else {
            // Fallback
            handleReturn();
        }
    };

    const handlePopState = (e) => {
        try { e && e.preventDefault && e.preventDefault(); } catch {}
        // Re-push state to keep SPA in place and navigate internally
        try { history.pushState(null, '', location.href); } catch {}
        // Mirror RSK behavior
        triggerRSK();
    };
    onMounted(() => {
    loadPrefs();
        updateTime();
        timeInterval = setInterval(updateTime, 1000);
        startSubscribe();
        
        // Initialize navigation
        if (window.navigationService) {
            window.navigationService.setCallbacks({
            onEscape: () => {
                // Map ESC (LSK) to context-aware action
                if (showModal.value) {
                    // Confirm in modal
                    confirmAction();
                } else if (selectedJob.value) {
                    if (role.value === 'seeker') {
                        // Apply functionality removed - do nothing
                    } else if (role.value === 'employer') {
                        deleteSelected();
                    }
                } else if (role.value === 'employer' && showMyJobsButton.value) {
                    // Toggle between Post and My Jobs for employers
                    handleMyJobs();
                } else if (role.value === 'seeker' && !filtersSelected.value) {
                    // Seeker in preference selection: smart proceed
                    if (filters.region.length && filters.skill) {
                        proceedToJobList();
                    } else if (filters.region.length && !filters.skill) {
                        startSkillSelection();
                    } else {
                        startRegionSelection();
                    }
                }
            },
            onBack: () => {
                // Bind hardware/back to RSK behavior
                triggerRSK();
            }
            });
            
            // Activate navigation immediately for all pages
            window.navigationService.activate();
        }
        
        // Initialize soft key labels
        updateSoftKeyLabels();

        // Derive a mock userId from phone mock if available
        try {
            const phoneMockEl = document.querySelector('phone-mock');
            // No direct access; use a fixed demo uid if unknown
            userId.value = 'demo-user';
        } catch {}

        // Trap browser/hardware back button to stay inside SPA
        try {
            history.pushState(null, '', location.href);
            window.addEventListener('popstate', handlePopState);
        } catch {}
        });
        onUnmounted(() => { 
        if (timeInterval) clearInterval(timeInterval); 
        if (typeof unsubscribe === 'function') unsubscribe(); 
        if (typeof unsubscribeApplications === 'function') unsubscribeApplications(); 
        if (window.navigationService) {
            window.navigationService.deactivate();
        }
        try { window.removeEventListener('popstate', handlePopState); } catch {}
        });

        // Helpers
        const openProfile = () => { 
            currentTab.value = 'profile'; 
            setTimeout(() => {
                if (window.navigationService) {
                    window.navigationService.updateFocusableElements();
                    window.navigationService.focusFirstElement();
                }
                updateSoftKeyLabels();
                const nameInput = document.querySelector('.profile-form input#name');
                try { if (nameInput) nameInput.focus(); } catch {}
            }, 150);
        };

        // Expose
        return {
    profileRef,
        role,
        mockVerified,
        currentTab,
        selectedJob,
        selectedApplicant,
        inlineMessage,
        applyLoading,
        applyingDone,
        showModal,
        modalTitle,
        modalMessage,
        currentTime,
        jobs,
        applications,
        filtersSelected,
        selectionFlow,
        showSelectionPage,
        employerChoice,
        userId,
        regions,
        roles,
        storeTypes,
        timeSlots,
        skills,
        filters,
        regionDisplayText,
        filteredJobs,
        myJobs,
        navTabs,
        leftSoftKey,
        rightSoftKey,
        viewJob,
        viewApplicant,
        formatApplicationTime,
        addJob,
        deleteJob,
        deleteSelected,
        applyJob,
        closeModal,
        confirmAction,
        switchTab,
        chooseRole,
        chooseEmployerAction,
        proceedToJobList,
        startRegionSelection,
        startSkillSelection,
        onSelectionMade,
        backToMenu,
        backToFilterSelection,
        onLoginSuccess,
        onMockVerified,
        logout,
        closePanel,
        handleReturn,
        openProfile,
        handleSoftKeyClick,
        updateSoftKeyLabels,
        onProfileSaved
        };
    }
};
