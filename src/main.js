// import './assets/reset.css'
import './assets/global.css'
import './assets/fonts.css'

// import './assets/github-markdown.css'

import './utils/sw-all'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// import "@notebook-entry"

const app = createApp(App)

app.use(router)

app.mount('#app')
