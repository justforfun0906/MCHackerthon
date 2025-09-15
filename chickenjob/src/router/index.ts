import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../pages/Home.vue')
const Jobs = () => import('../pages/Jobs.vue')
const JobDetail = () => import('../pages/JobDetail.vue')
const PostJob = () => import('../pages/PostJob.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/jobs', name: 'jobs', component: Jobs },
    { path: '/jobs/:id', name: 'job-detail', component: JobDetail },
    { path: '/post', name: 'post-job', component: PostJob },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
