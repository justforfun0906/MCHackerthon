// JobSection Component - lists job posts
const JobSection = {
    template: `
        <div class="job-section">
            <div class="section-title">📋 Job Listings</div>
            <div class="job-list">
                <div 
                    v-for="job in jobs" 
                    :key="job.id"
                    class="job-item"
                    @click="selectJob(job)"
                >
                    <template v-if="$parent && $parent.currentTab === 'mine' && $parent.role === 'employer'">
                        <div class="job-info"><span>Region: {{ job.region }}</span></div>
                        <div class="job-info"><span>Store Type: {{ job.storeType }}</span></div>
                        <div class="job-info"><span>Address: {{ job.address || '(Not provided)' }}</span></div>
                        <div class="job-info"><span>Openings: {{ job.count }}</span></div>
                        <div class="job-info"><span>Roles: {{ job.roles.join(', ') }}</span></div>
                        <div class="job-info"><span>Time: {{ job.time }}</span></div>
                        <div class="job-info" v-if="job.note"><span>Note: {{ job.note }}</span></div>
                    </template>
                    <template v-else>
                        <div class="job-info">
                            <span>{{ job.region }} | {{ job.storeType }}</span>
                            <span class="job-reward">{{ job.count }} openings</span>
                        </div>
                        <div v-if="job.address" class="job-info">
                            <span>Address: {{ job.address }}</span>
                        </div>
                        <div class="job-info">
                            <span>Roles: {{ job.roles.join(', ') }}</span>
                            <span>{{ job.time }}</span>
                        </div>
                        <div v-if="job.note" class="job-note">
                            <span>Note: {{ job.note }}</span>
                        </div>
                    </template>
                </div>
                <div v-if="jobs.length === 0" class="job-item">No jobs matching the criteria</div>
            </div>
        </div>
    `,

    props: ['jobs'],
    emits: ['select-job'],
    methods: {
        selectJob(job) {
            this.$emit('select-job', job);
        }
    }
}