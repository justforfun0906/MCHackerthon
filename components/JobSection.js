// JobSection Component - lists job posts
const JobSection = {
    template: `
        <div class="job-section">
            <div class="section-title">📋 職缺列表</div>
            <div class="job-list">
                <div 
                    v-for="job in jobs" 
                    :key="job.id"
                    class="job-item"
                    @click="selectJob(job)"
                >
                    <div class="job-info">
                        <span>{{ job.region }}｜{{ job.storeType }}</span>
                        <span class="job-reward">{{ job.count }}人</span>
                    </div>
                    <div class="job-info">
                        <span>需求：{{ job.roles.join('、') }}</span>
                        <span>{{ job.time }}</span>
                    </div>
                    <div v-if="job.note" class="job-note">
                        <span>備註：{{ job.note }}</span>
                    </div>
                </div>
                <div v-if="jobs.length === 0" class="job-item">目前沒有符合條件的職缺</div>
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