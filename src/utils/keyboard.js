import { useRoute } from 'vue-router';
import state from './storage.js'
import { useRouter } from 'vue-router';
import * as focusTrap from 'focus-trap';

let config = {
    available: false,
    indexSwitchEnabled: false,
    MainareaIsMarkdown: true,
    route: null,
    router: null,
}

let currentArea = "Main";

if (state.value.keyboardShortcuts.indexSwitchEnabled || state.value.keyboardShortcuts.backspaceEnabled) {
    window.addEventListener('keydown', (e) => {
        // console.log("kd",e,config.route);
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable);
        if (isInputFocused) return; // 如果焦点在输入框或可编辑区域，忽略快捷键
        if (config.route.name != 'layout') return; // 仅有MD-main页面启用
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return; // 忽略组合键
        if (!config.available) return; // 未启用
        // console.log("kd-processed");

        if (config.indexSwitchEnabled && e.key === 'q' && state.value.keyboardShortcuts.indexSwitchEnabled && config.route && config.router) {
            // console.log("kd-q");
            e.preventDefault();
            config.router.push(config.route.path.endsWith('/') ? config.route.path.slice(0, -1) : config.route.path + '/')
        }

        if (state.value.keyboardShortcuts.backspaceEnabled && e.key === 'Backspace') {
            e.preventDefault();
            config.router.back();
        }

    });
}

let trap = null;

function updateFocusTrap() {
    if (!config.available) return;
    const focusableElementsSelector = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';
    let trapArea = null;
    console.log("Updating focus trap");
    // if(config.MainareaIsMarkdown){
    //     trapArea = document.querySelector('.markdown-body');
    // }else{
    //     trapArea = document.querySelector('main');
    // }
    console.log(document.querySelector('.markdown-body'));
    if(config.MainareaIsMarkdown){
        document.querySelectorAll('.markdown-body > *, .markdown-body a').forEach(el => {
                el.setAttribute('tabindex', '0');
                el.classList.add('focus-trap-target');
        });
    }
    trap = focusTrap.createFocusTrap(document.querySelector('.markdown-body'), {
        // escapeDeactivates: false,
        allowOutsideClick: true,
    });
    trap.activate();
    console.log("Focus trap activated");
}

export const reportKeyboardSettings = (_) => {
    config = _;
    // console.log(config.route,config.route.name)
    if (config.available &&state.value.keyboardShortcuts.focusTrap && config?.route?.name === 'layout') {
        updateFocusTrap();
    }
    if (!config.available){
        trap?.deactivate();
    }
    return;
}

