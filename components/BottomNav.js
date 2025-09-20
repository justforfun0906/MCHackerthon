// Bottom Navigation Component with action buttons
const BottomNav = {
    template: `
        <div class="bottom-nav">
            <!-- Left Action Button (Dynamic for employers) -->
            <button class="action-btn my-jobs" @click="handleMyJobs" v-if="showMyJobs">
                {{ myJobsButtonText }}
            </button>
        </div>
    `,
    props: {
        showMyJobs: { type: Boolean, default: false },
        myJobsButtonText: { type: String, default: 'My Jobs' }
    },
    emits: ['my-jobs-action'],
    methods: {
        handleMyJobs() {
            this.$emit('my-jobs-action');
        }
    }
}
