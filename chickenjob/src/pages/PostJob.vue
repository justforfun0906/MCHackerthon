<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createJob } from '@/services/jobs'

const router = useRouter()
const title = ref('')
const company = ref('')
const location = ref('')
const pay = ref('')
const description = ref('')
const submitting = ref(false)

async function submit() {
  submitting.value = true
  try {
    const job = await createJob({ title: title.value, company: company.value, location: location.value, pay: pay.value, description: description.value })
    router.push(`/jobs/${job.id}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="p-4" style="max-width: 720px; margin: auto;">
    <header style="display: flex; justify-content: space-between; align-items: center;">
      <h2>Post a Job</h2>
      <router-link to="/">Home</router-link>
    </header>
    <form @submit.prevent="submit" style="display: grid; gap: 10px; margin-top: 12px;">
      <input v-model="title" placeholder="Title" required />
      <input v-model="company" placeholder="Company" required />
      <input v-model="location" placeholder="Location" />
      <input v-model="pay" placeholder="Pay (e.g., $18/hr)" />
      <textarea v-model="description" placeholder="Description" rows="5"></textarea>
      <button type="submit" :disabled="submitting" style="padding: 10px 14px;">{{ submitting ? 'Publishing…' : 'Publish' }}</button>
    </form>
  </main>
</template>

<style scoped>
input, textarea { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
button { border-radius: 8px; border: 1px solid #ddd; background: #f6f6f6; }
</style>
