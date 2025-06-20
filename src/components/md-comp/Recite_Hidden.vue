<template>
<div :style="{
    color: show?'unset':'transparent',
}" class="recite-box" @click="show = !show">
    <slot></slot>
</div>
</template>
<script setup>
import { ref } from "vue";
const show = ref(false);
</script>

<style >
.recite-box{
    display: inline-block;
    transition: color 0.2s ease-in-out;
    padding: 0.1rem 0.5rem;

      background-image: linear-gradient(to top, #99a9cde8 0%, #d5d8f221 100%);
  background-repeat: no-repeat;
  background-size: 100% 0.2em;
  background-position: 0 100%;
  transition: background-size 0.25s ease-in,
                color 0.2s ease-in;
  &:hover {
    background-size: 100% 100%;
  }
}
</style>