// Selection Page Component for Region and Skill selection
const SelectionPage = {
    props: {
        selectionType: {
            type: String,
            required: true,
            validator: value => ['region', 'skill'].includes(value)
        },
        options: {
            type: Array,
            required: true
        },
        selectedValue: {
            type: [String, Array],
            default: () => []
        },
        multiSelect: {
            type: Boolean,
            default: false
        }
    },
    emits: ['selected', 'back'],
    template: `
        <div class="selection-page">
            <div class="section-title">
                Select {{ selectionType === 'region' ? 'Regions' : 'Skill' }}
                <span v-if="multiSelect && selectedCount > 0" class="selection-count">({{ selectedCount }} selected)</span>
            </div>
            
            <div class="selection-list" ref="selectionListRef">
                <div 
                    v-for="(option, index) in options" 
                    :key="option"
                    :ref="el => setItemRef(el, index)"
                    :class="['selection-item', { 
                        'focused': index === currentFocusIndex,
                        'selected': isSelected(option)
                    }]"
                    @click="selectOption(option)"
                >
                    <span class="option-text">{{ option }}</span>
                    <span v-if="isSelected(option)" class="checkmark">✓</span>
                </div>
            </div>
            
            <div class="selection-hint">
                Use ↑↓ arrows to navigate, Enter to {{ multiSelect ? 'toggle selection' : 'select' }}
                <br>{{ multiSelect ? 'Escape when done selecting' : 'Escape to go back' }}
            </div>
        </div>
    `,
    setup(props, { emit }) {
        const { ref, onMounted, onUnmounted, nextTick, computed } = Vue;
        
        const currentFocusIndex = ref(0);
        const selectionListRef = ref(null);
        const itemRefs = ref([]);
        
        // Set refs for each item
        const setItemRef = (el, index) => {
            if (el) {
                itemRefs.value[index] = el;
            }
        };
        
        // Get current selections as array
        const currentSelections = computed(() => {
            if (props.multiSelect) {
                return Array.isArray(props.selectedValue) ? props.selectedValue : 
                       props.selectedValue ? [props.selectedValue] : [];
            } else {
                return props.selectedValue ? [props.selectedValue] : [];
            }
        });
        
        // Check if an option is selected
        const isSelected = (option) => {
            return currentSelections.value.includes(option);
        };
        
        // Count of selected items
        const selectedCount = computed(() => currentSelections.value.length);
        
        // Find the currently selected item index
        const findSelectedIndex = () => {
            if (currentSelections.value.length > 0) {
                const index = props.options.findIndex(option => 
                    currentSelections.value.includes(option));
                return index >= 0 ? index : 0;
            }
            return 0;
        };
        
        // Scroll focused item into view
        const scrollIntoView = async () => {
            await nextTick();
            const focusedItem = itemRefs.value[currentFocusIndex.value];
            const container = selectionListRef.value;
            
            if (focusedItem && container) {
                const containerRect = container.getBoundingClientRect();
                const itemRect = focusedItem.getBoundingClientRect();
                
                // Check if item is above the visible area
                if (itemRect.top < containerRect.top) {
                    container.scrollTop -= (containerRect.top - itemRect.top);
                }
                // Check if item is below the visible area
                else if (itemRect.bottom > containerRect.bottom) {
                    container.scrollTop += (itemRect.bottom - containerRect.bottom);
                }
            }
        };
        
        // Initialize focus on the selected item or first item
        onMounted(() => {
            currentFocusIndex.value = findSelectedIndex();
            setupNavigation();
            scrollIntoView();
        });
        
        onUnmounted(() => {
            cleanupNavigation();
        });
        
        const moveFocus = async (direction) => {
            const newIndex = currentFocusIndex.value + direction;
            if (newIndex >= 0 && newIndex < props.options.length) {
                currentFocusIndex.value = newIndex;
                await scrollIntoView();
            }
        };
        
        const selectOption = (option) => {
            if (props.multiSelect) {
                // For multi-select, toggle the selection
                const newSelections = [...currentSelections.value];
                const index = newSelections.indexOf(option);
                
                if (index >= 0) {
                    // Remove if already selected
                    newSelections.splice(index, 1);
                } else {
                    // Add if not selected
                    newSelections.push(option);
                }
                
                emit('selected', {
                    type: props.selectionType,
                    value: newSelections,
                    multiSelect: true
                });
            } else {
                // For single-select, emit the single value and go back
                emit('selected', {
                    type: props.selectionType,
                    value: option,
                    multiSelect: false
                });
            }
        };
        
        const selectCurrentOption = () => {
            const selectedOption = props.options[currentFocusIndex.value];
            selectOption(selectedOption);
        };
        
        const goBack = () => {
            // For multi-select, emit the current selections when going back
            if (props.multiSelect) {
                emit('selected', {
                    type: props.selectionType,
                    value: currentSelections.value,
                    multiSelect: true,
                    finished: true
                });
            }
            emit('back');
        };
        
        const handleKeyDown = (event) => {
            switch(event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    moveFocus(-1);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    moveFocus(1);
                    break;
                case 'Enter':
                    event.preventDefault();
                    selectCurrentOption();
                    break;
                case 'Escape':
                    event.preventDefault();
                    goBack();
                    break;
            }
        };
        
        const setupNavigation = () => {
            document.addEventListener('keydown', handleKeyDown);
            
            // Integrate with existing navigation service if available
            if (window.navigationService) {
                window.navigationService.setCallbacks({
                    onEscape: goBack,
                    onBack: goBack
                });
            }
        };
        
        const cleanupNavigation = () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
        
        return {
            currentFocusIndex,
            selectionListRef,
            setItemRef,
            selectOption,
            goBack,
            isSelected,
            selectedCount
        };
    }
};