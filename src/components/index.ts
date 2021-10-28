/*
 * @Author: YornQiu
 * @Date: 2021-05-14 17:01:47
 * @LastEditors: YornQiu
 * @LastEditTime: 2021-07-16 14:58:17
 * @Description: file content
 * @FilePath: \vue3-ts-template\src\components\index.ts
 */

const components = {
  //import, then add global component here
};

/**
 * Usage: Vue.use(components)
 */
export default {
  install(Vue) {
    Object.keys(components).forEach((key) => {
      Vue.component(key, components[key]);
    });
  },
};
