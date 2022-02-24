/*
 * @Author: YornQiu
 * @Date: 2021-09-07 17:22:04
 * @LastEditors: Yorn Qiu
 * @LastEditTime: 2022-02-24 10:05:25
 * @Description: file content
 * @FilePath: /vue3-ts-template/src/router.ts
 */

import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

const routes: RouteRecordRaw[] = [];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
