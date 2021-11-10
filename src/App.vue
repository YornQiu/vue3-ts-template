<template>
  <TheFrameHeader />
  <el-container>
    <TheFrameAside />
    <el-main class="frame-content">
      <router-view />
    </el-main>
  </el-container>
  <TheFrameFooter />
</template>

<script setup lang="ts">
import TheFrameHeader from '@/components/frame/TheFrameHeader.vue';
import TheFrameFooter from '@/components/frame/TheFrameFooter.vue';
import TheFrameAside from '@/components/frame/TheFrameAside.vue';
</script>
