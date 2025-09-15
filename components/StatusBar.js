// StatusBar Component
const StatusBar = {
    template: `
        <div class="status-bar">
            <span>迷你打工</span>
            <span>{{ currentTime }}</span>
        </div>
    `,
    props: ['currentTime']
}