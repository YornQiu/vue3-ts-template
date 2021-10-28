/*
 * @Author: YornQiu
 * @Date: 2021-09-07 17:22:04
 * @LastEditors: YornQiu
 * @LastEditTime: 2021-10-20 15:30:14
 * @Description: file content
 * @FilePath: \vue3-ts-template\src\router.ts
 */

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
