/*
 * @Author: YornQiu
 * @Date: 2021-05-14 17:01:47
 * @LastEditors: Yorn Qiu
 * @LastEditTime: 2023-05-22 13:53:48
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
