/*
 * @Author: YornQiu
 * @Date: 2021-05-14 17:01:47
 * @LastEditors: YornQiu
 * @LastEditTime: 2021-11-08 11:11:30
 * @Description: global components
 * @FilePath: /vue3-ts-template/src/components/index.ts
 */
import type { App, Component } from 'vue';

interface Components {
  [key: string]: Component;
}

const components: Components = {
  //import, then add global component here
};

/**
 * Usage: Vue.use(components)
 */
export default {
  install(app: App) {
    Object.keys(components).forEach((key) => {
      app.component(key, components[key]);
    });
  },
};
