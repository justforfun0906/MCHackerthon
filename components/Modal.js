// Modal Component
const Modal = {
    template: `
        <div v-if="show" class="modal" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div>{{ title }}</div>
                <div>{{ message }}</div>
                <!-- Actions moved to soft keys: LSK/ESC = confirm, RSK/F12 = close -->
            </div>
        </div>
    `,
    props: ['show', 'title', 'message'],
    emits: ['close', 'confirm'],
    methods: {
        closeModal() {
            this.$emit('close');
        },
        confirmAction() {
            this.$emit('confirm');
        }
    }
}