// StatusBar Component
const StatusBar = {
    template: `
        <div class="status-bar">
            <span>Mini job</span>
            <span>{{ currentTime }}</span>
        </div>
    `,
    props: ['currentTime']
}