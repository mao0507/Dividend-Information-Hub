import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import router from './router'
import { primevuePT } from './plugins/primevue'
import './styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(VueQueryPlugin)
app.use(PrimeVue, { unstyled: true, pt: primevuePT })
app.use(router)
app.mount('#app')
