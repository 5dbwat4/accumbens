<template>
  <n-button quaternary circle @click="switchColorScheme">
    <template #icon>
      <n-icon :component="CurrComponent" />
    </template>
  </n-button>
</template>
<script setup>
// import {
//   IconMoonFilledToSunnyFilledLoopTransition,
//   IconSunnyFilledLoopToMoonFilledLoopTransition,
//   IconMoonFilled,
//   IconSunnyFilled,
// } from "@iconify-prerendered/vue-line-md";
import IconMoonFilledToSunnyFilledLoopTransition from '~iconify/line-md/moon-filled-to-sunny-filled-loop-transition';
import IconSunnyFilledLoopToMoonFilledLoopTransition from '~iconify/line-md/sunny-filled-loop-to-moon-filled-loop-transition';
import IconMoonFilled from '~iconify/line-md/moon-filled';
import IconSunnyFilled from '~iconify/line-md/sunny-filled';
import { ref } from "vue";

const CurrComponent = ref(null);

// Get the current color scheme using the matchMedia API
let currentColorScheme = window.matchMedia("(prefers-color-scheme: dark)")
  .matches
  ? "dark"
  : "light";

CurrComponent.value =
  currentColorScheme === "dark" ? IconMoonFilled : IconSunnyFilled;

// Watch for changes in the color scheme

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    currentColorScheme = e.matches ? "dark" : "light";

    CurrComponent.value =
      currentColorScheme === "dark"
        ? IconSunnyFilledLoopToMoonFilledLoopTransition
        : IconMoonFilledToSunnyFilledLoopTransition;
  });

const switchColorScheme = () => {
  if (currentColorScheme === "dark") {
    document.documentElement.classList.remove("dark");
    currentColorScheme = "light";
    CurrComponent.value = IconMoonFilledToSunnyFilledLoopTransition;
  } else {
    document.documentElement.classList.add("dark");
    currentColorScheme = "dark";
    CurrComponent.value = IconSunnyFilledLoopToMoonFilledLoopTransition ;
  }
};
</script>
