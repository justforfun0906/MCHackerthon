// Modal Component
const Modal = {
    template: `
        <div v-if="show" class="modal" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div>{{ title }}</div>
                <div>{{ message }}</div>
                <button class="modal-btn" @click="confirmAction">確認</button>
                <button class="modal-btn" @click="closeModal">取消</button>
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