// Header Component with 40px height (no marquee)
const AppHeader = {
    template: `
        <div class="app-header">
            <div class="header-content">
                <div class="header-title" ref="titleElement">
                    {{ displayTitle }}
                </div>
            </div>
        </div>
    `,
    props: {
        title: {
            type: String,
            default: '迷你打工'
        }
    },
    setup(props) {
        const { ref, computed } = Vue;
        
        const titleElement = ref(null);
        
        // Simple title display without marquee
        const displayTitle = computed(() => props.title);
        
        return {
            titleElement,
            displayTitle
        };
    }
};