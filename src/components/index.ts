/*
 * @Author: YornQiu
 * @Date: 2021-05-14 17:01:47
 * @LastEditors: Yorn Qiu
 * @LastEditTime: 2023-12-19 13:53:01
 * @FilePath: /vue3-ts-template/src/components/index.ts
 * @Description: global components
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
