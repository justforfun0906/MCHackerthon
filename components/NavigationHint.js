// Navigation Hint Component
const NavigationHint = {
    template: `
        <div class="nav-hint" v-if="showHint">
            <span>{{ leftHint }}</span>
            <span>{{ centerHint }}</span>
            <span>{{ rightHint }}</span>
        </div>
    `,
    props: {
        leftHint: {
            type: String,
            default: '⬅ Menu'
        },
        centerHint: {
            type: String,
            default: '↕ Navigate | ⏎ Select'
        },
        rightHint: {
            type: String,
            default: 'Back ➡'
        },
        showHint: {
            type: Boolean,
            default: true
        }
    }
};