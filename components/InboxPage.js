// InboxPage Component - shows applicant profiles for employers
const InboxPage = {
    template: `
        <div class="job-section">
            <div class="section-title">📨 Applicant Inbox</div>
            <div class="job-list">
                <div 
                    v-for="application in applications" 
                    :key="application.id"
                    class="job-item applicant-item"
                    @click="selectApplicant(application)"
                >
                    <div class="job-info applicant-info">
                        <span class="applicant-name">{{ application.applicantName || 'Anonymous' }}</span>
                        <span class="job-reward applicant-time">{{ formatTime(application.appliedAt) }}</span>
                    </div>
                    <div class="job-info job-details">
                        <span>Applied for: {{ application.jobTitle }}</span>
                    </div>
                    <div class="job-info contact-info">
                        <span>Phone: {{ application.phone || 'Not provided' }}</span>
                    </div>
                    <div v-if="application.experience" class="job-note">
                        <span>Experience: {{ application.experience }}</span>
                    </div>
                </div>
                <div v-if="applications.length === 0" class="job-item">
                    No applications received yet
                </div>
            </div>
        </div>
    `,

    props: ['applications'],
    emits: ['select-applicant'],
    methods: {
        selectApplicant(application) {
            this.$emit('select-applicant', application);
        },
        formatTime(timestamp) {
            if (!timestamp) return '';
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString();
        }
    }
}