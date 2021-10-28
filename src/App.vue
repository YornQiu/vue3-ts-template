<template>
  <div id="app">
    <el-container direction="vertical">
      <FrameHeader></FrameHeader>
      <el-container>
        <FrameAside></FrameAside>
        <el-main class="frame-content">
          <router-view />
        </el-main>
      </el-container>
      <el-footer> Footer </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import FrameHeader from '@/components/frame/frame-header.vue';
import FrameAside from '@/components/frame/frame-aside.vue';
</script>

<style lang="scss">
#app > .el-container {
  height: 100%;
}
.frame-content {
  background-color: $bg-color-content;
}
.el-footer {
  border-top: 1px solid #eaecef;
}
</style>
