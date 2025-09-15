<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { getJob } from '@/services/jobs'
import type { Job } from '@/types'

const route = useRoute()
const jobId = route.params.id as string
const job = ref<Job | null>(null)
const loading = ref(true)

onMounted(async () => {
  job.value = (await getJob(jobId)) || null
  loading.value = false
})
</script>

<template>
  <main class="p-4" style="max-width: 720px; margin: auto;">
    <header style="display: flex; justify-content: space-between; align-items: center;">
      <h2>Job Detail</h2>
      <router-link to="/jobs">Back</router-link>
    </header>
    <section style="margin-top: 12px;">
      <div v-if="loading">Loading…</div>
      <template v-else>
        <h3 style="margin: 0;">{{ job?.title }}</h3>
        <div style="color: #555; margin-top: 4px;">{{ job?.company }} • {{ job?.location }}</div>
        <div style="margin-top: 8px;">{{ job?.pay }}</div>
        <p style="margin-top: 12px; white-space: pre-wrap;">{{ job?.description }}</p>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <a v-if="job?.contact?.phone" :href="`tel:${job.contact.phone}`">Call</a>
          <a v-if="job?.contact?.email" :href="`mailto:${job.contact.email}`">Email</a>
          <a v-if="job?.contact?.url" :href="job.contact.url" target="_blank" rel="noopener">Apply</a>
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped>
main { line-height: 1.4; }
</style>
