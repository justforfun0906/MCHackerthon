<template>
  <div class="app">
    <!-- 狀態欄 -->
    <div class="status-bar">
      <span>迷你打工</span>
      <span>{{ currentTime }}</span>
    </div>
    
    <!-- 主要內容 -->
    <div class="main-content">
      <!-- 用戶資訊卡 -->
      <div class="user-card">
        <div class="user-info">
          <div class="avatar">🐥</div>
          <div>
            <div>{{ user.name }}</div>
            <div class="stats">
              <span>等級: {{ user.level }}</span>
              <span>金幣: {{ user.coins }}</span>
            </div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: user.exp + '%' }"></div>
        </div>
      </div>
      
      <!-- 工作區域 -->
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
    </div>
    
    <!-- 底部導航 -->
    <div class="bottom-nav">
      <button 
        class="nav-btn" 
        :class="{ active: currentTab === 'jobs' }"
        @click="switchTab('jobs')"
      >
        工作
      </button>
      <button 
        class="nav-btn" 
        :class="{ active: currentTab === 'shop' }"
        @click="switchTab('shop')"
      >
        商店
      </button>
      <button 
        class="nav-btn" 
        :class="{ active: currentTab === 'profile' }"
        @click="switchTab('profile')"
      >
        個人
      </button>
    </div>
    
    <!-- 彈窗 -->
    <div v-if="showModal" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div>{{ modalTitle }}</div>
        <div>{{ modalMessage }}</div>
        <button class="modal-btn" @click="confirmAction">確認</button>
        <button class="modal-btn" @click="closeModal">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

export default {
  name: 'App',
  setup() {
    // 響應式狀態
    const currentTab = ref('jobs')
    const selectedJob = ref(null)
    const showModal = ref(false)
    const modalTitle = ref('')
    const modalMessage = ref('')
    const currentTime = ref('00:00')
    
    const user = reactive({
      name: '新手小雞',
      level: 1,
      coins: 50,
      exp: 25
    })
    
    const jobs = reactive([
      { id: 1, name: '看廣告', reward: 5, time: 30, completed: false, inProgress: false, progress: 0 },
      { id: 2, name: '簽到', reward: 10, time: 5, completed: false, inProgress: false, progress: 0 },
      { id: 3, name: '分享', reward: 15, time: 10, completed: false, inProgress: false, progress: 0 },
      { id: 4, name: '評分', reward: 20, time: 15, completed: false, inProgress: false, progress: 0 },
      { id: 5, name: '邀請', reward: 50, time: 60, completed: false, inProgress: false, progress: 0 }
    ])
    
    // 定時器引用
    let timeInterval = null
    let progressInterval = null
    
    // 時間更新
    const updateTime = () => {
      const now = new Date()
      const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0')
      currentTime.value = timeString
    }
    
    // 選擇工作
    const selectJob = (job) => {
      if (job.completed) return
      
      selectedJob.value = job
      modalTitle.value = job.name
      modalMessage.value = `獲得 ${job.reward} 金幣\n預估 ${job.time} 秒`
      showModal.value = true
    }
    
    // 關閉彈窗
    const closeModal = () => {
      showModal.value = false
    }
    
    // 確認操作
    const confirmAction = () => {
      if (selectedJob.value && !selectedJob.value.inProgress) {
        selectedJob.value.inProgress = true
        selectedJob.value.progress = 0
      }
      closeModal()
    }
    
    // 切換標籤
    const switchTab = (tab) => {
      currentTab.value = tab
    }
    
    // 工作進度更新
    const updateJobProgress = () => {
      jobs.forEach(job => {
        if (job.inProgress && !job.completed) {
          job.progress += Math.random() * 10
          if (job.progress >= 100) {
            job.progress = 100
            job.completed = true
            job.inProgress = false
            user.coins += job.reward
            user.exp += 5
            if (user.exp >= 100) {
              user.level++
              user.exp = 0
            }
          }
        }
      })
    }
    
    // 組件掛載時初始化
    onMounted(() => {
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
      progressInterval = setInterval(updateJobProgress, 1000)
    })
    
    // 組件卸載時清理定時器
    onUnmounted(() => {
      if (timeInterval) clearInterval(timeInterval)
      if (progressInterval) clearInterval(progressInterval)
    })
    
    return {
      currentTab,
      selectedJob,
      showModal,
      modalTitle,
      modalMessage,
      currentTime,
      user,
      jobs,
      selectJob,
      closeModal,
      confirmAction,
      switchTab
    }
  }
}
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: white;
}

/* 頂部狀態欄 */
.status-bar {
  height: 12px;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
  font-size: 6px;
}

/* 主要內容區域 */
.main-content {
  flex: 1;
  padding: 4px;
  display: flex;
  flex-direction: column;
}

/* 用戶資訊卡 */
.user-card {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 4px;
  margin-bottom: 4px;
  backdrop-filter: blur(10px);
}

.user-info {
  display: flex;
  align-items: center;
  font-size: 7px;
}

.avatar {
  width: 16px;
  height: 16px;
  background: #ffd700;
  border-radius: 50%;
  margin-right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
  font-size: 6px;
}

/* 工作列表 */
.job-section {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
  padding: 4px;
  margin-bottom: 4px;
}

.section-title {
  font-size: 7px;
  font-weight: bold;
  margin-bottom: 3px;
  text-align: center;
}

.job-list {
  max-height: 60px;
  overflow-y: auto;
}

.job-item {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  padding: 3px;
  margin-bottom: 2px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 6px;
}

.job-item:hover {
  background: rgba(255,255,255,0.2);
}

.job-item.completed {
  background: rgba(0,255,0,0.2);
}

.job-item.in-progress {
  background: rgba(255,255,0,0.2);
}

.job-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-reward {
  color: #ffd700;
  font-weight: bold;
}

/* 底部按鈕區 */
.bottom-nav {
  height: 20px;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.nav-btn {
  background: none;
  border: none;
  color: white;
  font-size: 6px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  transition: background 0.2s;
}

.nav-btn.active {
  background: rgba(255,255,255,0.2);
}

.nav-btn:hover {
  background: rgba(255,255,255,0.1);
}

/* 進度條 */
.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(0,0,0,0.2);
  border-radius: 2px;
  overflow: hidden;
  margin: 2px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00aaff);
  border-radius: 2px;
  transition: width 0.3s;
  width: 0%;
}

/* 彈窗 */
.modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  color: black;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
  font-size: 7px;
  max-width: 100px;
}

.modal-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 3px 6px;
  border-radius: 2px;
  font-size: 6px;
  margin: 2px;
  cursor: pointer;
}

.hidden {
  display: none;
}
</style>