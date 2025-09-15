<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { listJobs, type ListParams } from '@/services/jobs'
import type { Job, JobType } from '@/types'

const jobs = ref<Job[]>([])
const loading = ref(false)
const q = ref('')
const location = ref('')
const type = ref<JobType | ''>('')
let timer: ReturnType<typeof setTimeout> | null = null

async function load(params: ListParams = {}) {
  loading.value = true
  try {
    jobs.value = await listJobs(params)
  } finally {
    loading.value = false
  }
}

function scheduleLoad() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const params: ListParams = {
      q: q.value || undefined,
      location: location.value || undefined,
      type: (type.value as JobType) || undefined,
    }
    load(params)
  }, 250)
}

watch([q, location, type], scheduleLoad)
onMounted(() => load())
</script>

<template>
  <main class="p-4" style="max-width: 720px; margin: auto;">
    <header style="display: flex; justify-content: space-between; align-items: center;">
      <h2>Jobs</h2>
      <router-link to="/">Home</router-link>
    </header>
    <section style="display: grid; gap: 8px; margin-top: 12px;">
      <input v-model="q" placeholder="Search jobs or companies" />
      <div style="display: flex; gap: 8px;">
        <input v-model="location" placeholder="Location" style="flex: 1;" />
        <select v-model="type">
          <option value="">All types</option>
          <option value="shift">Shift</option>
          <option value="hourly">Hourly</option>
          <option value="remote">Remote</option>
          <option value="contract">Contract</option>
        </select>
      </div>
    </section>

    <div v-if="loading" style="margin-top: 12px;">Loading…</div>

    <ul v-else style="list-style: none; padding: 0; margin-top: 12px;">
      <li v-for="job in jobs" :key="job.id" style="padding: 12px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px;">
        <router-link :to="`/jobs/${job.id}`" style="text-decoration: none; color: inherit;">
          <div style="font-weight: 700;">{{ job.title }}</div>
          <div style="font-size: 14px; color: #555;">{{ job.company }} • {{ job.location }}</div>
          <div style="margin-top: 6px;">{{ job.pay }}</div>
        </router-link>
      </li>
      <li v-if="!jobs.length" style="padding: 12px; color: #666;">No jobs found.</li>
    </ul>
  </main>
  
</template>

<style scoped>
main { line-height: 1.4; }
input, select { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
</style>
