import { createApp } from 'vue';
import App from './App.vue';

import 'ant-design-vue/dist/reset.css';
import { Button, Modal } from 'ant-design-vue';

const app = createApp(App);

app.use(Button);
app.use(Modal);

app.mount('#app');
