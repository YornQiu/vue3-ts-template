import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import '@/styles/cover.scss';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import '@/styles/index.scss';

import GlobalComponents from '@/components';
import directives from '@/directives';

// eslint-disable-next-line prettier/prettier
createApp(App)
  .use(GlobalComponents)
  .use(directives)
  .use(store)
  .use(router)
  .use(ElementPlus, { locale: zhCn })
  .mount('#app');
