<script setup lang="ts">
</script>

<template>
  <main class="p-4" style="max-width: 720px; margin: auto;">
    <h1>ChickenJob</h1>
    <p>Find flexible, part-time work near you.</p>
    <nav style="display: flex; gap: 12px; margin-top: 16px;">
      <router-link to="/jobs">Browse Jobs</router-link>
      <router-link to="/post">Post a Job</router-link>
    </nav>
  </main>
</template>

<style scoped>
main { line-height: 1.4; }
a { font-weight: 600; }
</style>
