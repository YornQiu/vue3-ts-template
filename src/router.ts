/*
 * @Author: YornQiu
 * @Date: 2021-09-07 17:22:04
 * @LastEditors: Yorn Qiu
 * @LastEditTime: 2022-02-25 17:52:03
 * @Description: file content
 * @FilePath: /vue3-ts-template/src/router.ts
 */

import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
