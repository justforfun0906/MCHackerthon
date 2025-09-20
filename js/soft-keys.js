// Cloud Phone 軟體按鍵組件
// 提供視覺化的軟體按鍵界面，與導航系統整合

class SoftKeys extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        const style = document.createElement("style");
        style.textContent = `
            :host {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                z-index: 1001;
            }

            .softkeys-container {
                background: #000000;
                height: 32px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                color: #ffffff;
                font-family: 'Roboto', sans-serif;
                font-size: 12px;
                border-top: 1px solid #333;
            }

            .soft-key {
                flex: 1;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                user-select: none;
                transition: background-color 0.2s ease;
                position: relative;
            }

            .soft-key:hover {
                background: #333333;
            }

            .soft-key:active {
                background: #555555;
            }

            .soft-key:focus {
                outline: none;
                background: #333333;
            }

            .soft-key.dpad-focus {
                background: #007acc;
            }

            svg {
                width: 16px;
                height: 16px;
                fill: currentColor;
            }

            .left { 
                justify-content: center; 
                padding-left: 8px;
            }
            
            .center { 
                justify-content: center; 
                font-weight: bold;
                font-size: 11px;
            }
            
            .right { 
                justify-content: center; 
                padding-right: 8px;
            }

            .key-label {
                margin-left: 4px;
                font-size: 10px;
            }

            /* Cloud Phone 邊距適配 */
            @media (max-width: 240px) {
                .softkeys-container {
                    height: 28px;
                    font-size: 10px;
                }
                
                svg {
                    width: 14px;
                    height: 14px;
                }
                
                .center {
                    font-size: 10px;
                }
            }
        `;

        const menuIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/>
            </svg>
        `;

        const backIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
        `;

        const html = document.createElement("div");
        html.innerHTML = `
            <div class="softkeys-container">
                <div class="soft-key left no-navigation" tabindex="-1" role="button" aria-label=Confirm" data-key="lsk">
                    ${menuIcon}
                    <span class="key-label">Confirm</span>
                </div>
                <div class="soft-key center no-focus no-navigation" tabindex="-1" role="button" aria-label="Enter" data-key="enter">
                    Enter
                </div>
                        <div class="soft-key right no-navigation" tabindex="-1" role="button" aria-label="Back" data-key="rsk">
                            ${backIcon}
                            <span class="key-label">Back</span>
                        </div>
            </div>
        `;

        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(html);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const [leftKey, centerKey, rightKey] = this.shadowRoot.querySelectorAll(".soft-key");

        // 左軟鍵 (LSK) - confirm
        leftKey.addEventListener("click", () => {
            this.dispatchEvent(
                new CustomEvent("softkeyclick", {
                    bubbles: true,
                    composed: true,
                    detail: { 
                        key: "lsk",
                        source: "left-key",
                        action: "confirm"
                    }
                })
            );
        });

        // 中心鍵 - 選擇（觸發enter事件）
        centerKey.addEventListener("click", () => {
            this.dispatchEvent(
                new CustomEvent("softkeyclick", {
                    bubbles: true,
                    composed: true,
                    detail: { 
                        key: "enter",
                        source: "center-key",
                        action: "input"
                    }
                })
            );
        });

        // 右軟鍵 (RSK) - 返回
        rightKey.addEventListener("click", () => {
            console.log('🔧 RSK button clicked in soft-keys component');
            this.dispatchEvent(
                new CustomEvent("softkeyclick", {
                    bubbles: true,
                    composed: true,
                    detail: { 
                        key: "rsk",
                        source: "right-key",
                        action: "return"
                    }
                })
            );
        });

        // 鍵盤導航支援
        leftKey.addEventListener("keydown", this.handleKeyPress);
        centerKey.addEventListener("keydown", this.handleKeyPress);
        rightKey.addEventListener("keydown", this.handleKeyPress);

        // D-pad / hardware key 支援，包含更多實機上的返回鍵變體
        document.addEventListener("keydown", (e) => {
            // Check if we're in a selection page
            const isInSelectionPage = document.querySelector('.selection-page') !== null;
            const activeEl = document.activeElement;
            const isTextInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

            // Debug logging for all keydown events - expanded to catch more keys
            console.log(`🔧 All hardware keys detected: ${e.key}, code: ${e.code}, keyCode: ${e.keyCode}, isTextInput: ${isTextInput}`);
            
            if (['SoftLeft', 'SoftRight', 'F12', 'BrowserBack', 'GoBack', 'Back', 'Backspace', 'Escape', 'Enter'].includes(e.key)) {
                console.log(`🔧 Known hardware key detected: ${e.key}, isTextInput: ${isTextInput}`);
            }

            if (e.key === "SoftLeft" || e.key === "Escape") {
                console.log('🔧 LSK hardware key triggering leftKey.click()');
                e.preventDefault();
                leftKey.click();
            } else if (e.key === "Enter" || e.key === " ") {
                console.log('🔧 Center hardware key triggering centerKey.click()');
                e.preventDefault();
                centerKey.click();
            } else if (
                e.key === "SoftRight" ||
                e.key === "F12" ||
                e.key === "BrowserBack" ||
                e.key === "GoBack" ||
                e.key === "Back" ||
                (e.key === "Backspace" && !isTextInput)
            ) {
                console.log(`🔧 RSK hardware key (${e.key}) triggering rightKey.click()`);
                e.preventDefault();
                rightKey.click();
            }
        });

        // 某些環境（Hybrid/OS）會發出自定義返回事件
        window.addEventListener('backbutton', (e) => {
            try { e.preventDefault(); } catch {}
            rightKey.click();
        });
        // Tizen / 特定平台
        window.addEventListener('tizenhwkey', (e) => {
            try {
                if (e && (e.key === 'back' || e.keyName === 'back')) {
                    e.preventDefault();
                    rightKey.click();
                }
            } catch {}
        });

        // 與導航系統整合
        this.setupNavigationIntegration();
    }

    setupNavigationIntegration() {
        // 監聽導航系統的焦點變化
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.updateFocusDisplay();
            }
        });
    }

    handleKeyPress(event) {
        switch (event.key) {
            case "Enter":
            case " ":
                event.preventDefault();
                event.target.click();
                break;
            case "ArrowLeft":
                event.preventDefault();
                this.focusPrevious();
                break;
            case "ArrowRight":
                event.preventDefault();
                this.focusNext();
                break;
        }
    }

    focusPrevious() {
        const keys = Array.from(this.shadowRoot.querySelectorAll(".soft-key"));
        const currentIndex = keys.findIndex(key => key === document.activeElement);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : keys.length - 1;
        keys[prevIndex].focus();
    }

    focusNext() {
        const keys = Array.from(this.shadowRoot.querySelectorAll(".soft-key"));
        const currentIndex = keys.findIndex(key => key === document.activeElement);
        const nextIndex = currentIndex < keys.length - 1 ? currentIndex + 1 : 0;
        keys[nextIndex].focus();
    }

    // 更新按鍵標籤
    updateLabels(labels) {
        const leftKey = this.shadowRoot.querySelector('.left .key-label');
        const centerKey = this.shadowRoot.querySelector('.center');
        const rightKey = this.shadowRoot.querySelector('.right .key-label');

        if (labels.left && leftKey) {
            leftKey.textContent = labels.left;
        }
        if (labels.center && centerKey) {
            centerKey.textContent = labels.center;
        }
        if (labels.right && rightKey) {
            rightKey.textContent = labels.right;
        }
    }

    // 設置按鍵功能
    setKeyFunction(key, action) {
        const keyElement = this.shadowRoot.querySelector(`[data-key="${key}"]`);
        if (keyElement) {
            keyElement.setAttribute('data-action', action);
        }
    }

    // 更新焦點顯示
    updateFocusDisplay() {
        // 清除所有焦點樣式
        this.shadowRoot.querySelectorAll('.soft-key').forEach(key => {
            key.classList.remove('dpad-focus');
        });

        // 根據當前導航狀態顯示焦點
        if (window.navigationService && window.navigationService.isActive) {
            const currentElement = window.navigationService.getCurrentFocusElement();
            if (currentElement) {
                // 可以根據當前元素類型來高亮對應的軟鍵
                this.highlightRelevantKey(currentElement);
            }
        }
    }

    highlightRelevantKey(element) {
        // 根據元素類型高亮相關軟鍵
        const tagName = element.tagName.toLowerCase();
        const className = element.className;

        // 不再高亮任何軟鍵，因為軟鍵不應該被選中
        // 軟鍵只是視覺指示器，不應該顯示焦點樣式
    }

    // 顯示/隱藏軟鍵
    setVisible(visible) {
        this.style.display = visible ? 'block' : 'none';
    }

    // 設置按鍵狀態
    setKeyState(key, enabled) {
        const keyElement = this.shadowRoot.querySelector(`[data-key="${key}"]`);
        if (keyElement) {
            keyElement.style.opacity = enabled ? '1' : '0.5';
            keyElement.style.pointerEvents = enabled ? 'auto' : 'none';
        }
    }

    connectedCallback() {
        // 組件連接到 DOM 時
        console.log('Soft Keys 組件已載入');
    }

    disconnectedCallback() {
        // 組件從 DOM 移除時
        console.log('Soft Keys 組件已移除');
    }
}

// 註冊自定義元素
customElements.define("soft-keys", SoftKeys);

// 導出類別供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoftKeys;
}