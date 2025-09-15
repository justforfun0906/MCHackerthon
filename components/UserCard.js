// UserCard Component
const UserCard = {
    template: `
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
    `,
    props: ['user']
}