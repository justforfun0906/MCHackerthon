// JobSection Component
const JobSection = {
    template: `
        <div class="job-section">
            <div class="section-title">📋 可接工作</div>
            <div class="job-list">
                <div 
                    v-for="job in jobs" 
                    :key="job.id"
                    class="job-item"
                    :class="{ 
                        'completed': job.completed, 
                        'in-progress': job.inProgress 
                    }"
                    @click="selectJob(job)"
                >
                    <div class="job-info">
                        <span>{{ job.name }}</span>
                        <span class="job-reward">+{{ job.reward }}</span>
                    </div>
                    <div v-if="job.inProgress" class="progress-bar">
                        <div class="progress-fill" :style="{ width: job.progress + '%' }"></div>
                    </div>
                </div>
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