<template>
  <div class="container">
    <img
      src="@/assets/cover.png"
      style="max-width: 480px; margin-bottom: 50px; margin-top: 30px"
    />
    <n-h3>
      「&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;」——欢迎来到5dbwat4的笔记本
    </n-h3>
    <n-button
      @click="$router.push('/contents')"
      round
    >
      <template #icon>
        <n-icon :component="IconList3Twotone"></n-icon>
        </template>
      看看这个人到底写了什么
    </n-button>
    <n-p
      >这里主要是我的课程笔记。一些碎碎念或者不成体系的记录，欢迎移步<a
        href="https://blog.5dbwat4.top/"
        target="_blank"
        >我的博客</a
      >。</n-p
    >
    <n-divider />

    <n-button
      text
      @click="do_confetti()"
    >
      <template #icon>
        <n-icon :component="IconConfettiLineDuotone"></n-icon>
        </template>
      听说主页要有一个能放礼花的按钮
    </n-button>
    <n-button
      text
      @click="$router.push('/charts')"
    >
      <template #icon>
        <n-icon :component="IconChartLineDuotone"></n-icon>
        </template>
      看看数值
    </n-button>
    <n-divider />

    <n-p>还有好多东西没有实现</n-p>
    <n-space vertical>
      <n-checkbox :checked="true" v-for="item in finished" :key="item">
        {{ item }}
      </n-checkbox>
      <n-checkbox :checked="false" v-for="item in pending" :key="item">
        {{ item }}
      </n-checkbox>
    </n-space>
  </div>
</template>
<script setup>
// import { IconList3Twotone } from "@iconify-prerendered/vue-line-md";
// import {
//   IconConfettiLineDuotone,
//   IconChartLineDuotone,
// } from "@iconify-prerendered/vue-solar";
import IconList3Twotone from '~iconify/line-md/list-3-twotone';
import IconConfettiLineDuotone from '~iconify/solar/confetti-line-duotone';
import IconChartLineDuotone from '~iconify/solar/chart-line-duotone';
import confetti from "canvas-confetti";
// import { navInfo } from "@/utils/configUtils.js";
// import dirList from "@/components/dir-content-main.vue";
const finished = [
  "Compiling MD & MDX all done right, as well as rendering them",
  "Indexing those pages ",
  "Dynamic loading of all components and pages",
  "Table of Contents!!!",
];

const pending = [
  "...We may not implement a search component",
  "Complete the dark mode",
  "A good 404 page",
];

let currentConfettiCount = 0;
const do_confetti = () => {
  var end = Date.now() + 5 * 1000;

  var colors = ["#ffffff", "#5c55f5", "#e6d81c", "#ee1414"];
  if (currentConfettiCount > 1) {
    return; // Prevent multiple confetti bursts
  }
  currentConfettiCount++;
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    } else {
      currentConfettiCount--;
    }
  })();
};
</script>

<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
}
</style>
