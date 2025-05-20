<template>
 <n-popover :overlap="overlap" placement="bottom-end" trigger="click">
      <template #trigger>
        <n-button quaternary circle>
                <template #icon>
                  <n-icon :component="IconGithubLoop"></n-icon>
                </template>
              </n-button>
      </template>
      <a href="https://github.com/5dbwat4/accumbens" target="_blank">

      <img style="max-width: 360px;" src="https://opengraph.githubassets.com/token/5dbwat4/accumbens"/>
   </a>


    </n-popover>
</template>
<script setup>
import { IconGithubLoop,IconStar } from "@iconify-prerendered/vue-line-md";

// fetch('https://api.github.com/repos/5dbwat4/note')

</script>
