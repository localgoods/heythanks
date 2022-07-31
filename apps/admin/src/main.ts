import { createApp } from 'vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import App from '@/App.vue'
import '@/index.css'

console.log('Creating app...', import.meta.env)
console.log('Local mocking is', import.meta.env.PUBLIC_MOCK_ENABLED ? 'enabled' : 'disabled')

const app = createApp(App)
app.mount('#app')