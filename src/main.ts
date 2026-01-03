import './assets/main.css'

import { createApp } from 'vue'
import App from '@/App.vue'
import favIcon from "@/assets/favicon.png?inline";

const iconLink = (() => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = favIcon;

    return link;
})();
document.head.appendChild(iconLink);

createApp(App).mount('#app')
