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
                    <template v-if="$parent && $parent.currentTab === 'mine' && $parent.role === 'employer'">
                        <div class="job-info"><span>地區：{{ job.region }}</span></div>
                        <div class="job-info"><span>店鋪類型：{{ job.storeType }}</span></div>
                        <div class="job-info"><span>地址：{{ job.address || '（未填）' }}</span></div>
                        <div class="job-info"><span>人數：{{ job.count }}</span></div>
                        <div class="job-info"><span>需求：{{ job.roles.join('、') }}</span></div>
                        <div class="job-info"><span>時段：{{ job.time }}</span></div>
                        <div class="job-info" v-if="job.note"><span>備註：{{ job.note }}</span></div>
                    </template>
                    <template v-else>
                        <div class="job-info">
                            <span>{{ job.region }}｜{{ job.storeType }}</span>
                            <span class="job-reward">{{ job.count }}人</span>
                        </div>
                        <div v-if="job.address" class="job-info">
                            <span>地址：{{ job.address }}</span>
                        </div>
                        <div class="job-info">
                            <span>需求：{{ job.roles.join('、') }}</span>
                            <span>{{ job.time }}</span>
                        </div>
                        <div v-if="job.note" class="job-note">
                            <span>備註：{{ job.note }}</span>
                        </div>
                    </template>
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