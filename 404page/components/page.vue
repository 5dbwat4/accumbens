<script setup>
import pageMainInit from '../404page/main'
import { onMounted, ref } from 'vue'

const canvasRef = ref(null)

onMounted(() => {
  if (canvasRef.value) {
    pageMainInit(canvasRef.value)
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="scene-canvas"></canvas>
</template>

<style scoped>
.scene-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
