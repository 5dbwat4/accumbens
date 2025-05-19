<template>
 <n-popover :overlap="overlap" placement="bottom-end" trigger="click">
      <template #trigger>
        <n-button quaternary circle>
                <template #icon>
                  <n-icon :component="IconGithubLoop"></n-icon>
                </template>
              </n-button>
      </template>
      <div class="large-text">
        啊！
      </div>
    </n-popover>
</template>
<script setup>
import { IconGithubLoop } from "@iconify-prerendered/vue-line-md";

// fetch('https://api.github.com/repos/5dbwat4/note')
</script>