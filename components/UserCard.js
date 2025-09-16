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
                    </div>
                </div>
            </div>
        </div>
    `,
    props: ['user']
}