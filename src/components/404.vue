<script setup>
import pageMainInit from '@/utils/minecraft-404/main'
import { onMounted, ref } from 'vue'

const canvasRef = ref(null)
const loading = ref(true)

onMounted(async () => {
  if (canvasRef.value) {
    await pageMainInit(canvasRef.value)
    loading.value = false
  }
})
</script>

<template>
  <div class="mc-404-wrapper">
    <n-spin :show="loading">
      <canvas ref="canvasRef" class="mc-404-canvas"></canvas>
    </n-spin>
  </div>
</template>

<style scoped>
.mc-404-wrapper {
  display: flex;
  justify-content: center;
  margin: 1em 0;
}

.mc-404-canvas {
  display: block;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
}
</style>
