<template>
  <span class="exam-blank-inline">
    <input
      v-model="userInput"
      :data-expected="value"
      class="exam-blank-input"
      :size="inputSize"
      placeholder="______"
      @keydown.enter.prevent
    />
    <span class="exam-blank-answer">{{ value }}</span>
  </span>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  value: { type: String, default: '' },
});

const userInput = ref('');

const inputSize = computed(() =>
  Math.max(6, (props.value?.length ?? 4) + 2)
);
</script>

<style scoped>
.exam-blank-inline {
  display: inline;
}

.exam-blank-input {
  display: inline-block;
  min-width: 80px;
  padding: 2px 8px;
  border: none;
  border-bottom: 2px dashed #94a3b8;
  background: #f8fafc;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s ease;
  text-align: center;
  vertical-align: baseline;
}

.exam-blank-input:focus {
  border-bottom-color: #6366f1;
  border-bottom-style: solid;
  background: #eef2ff;
}

.exam-blank-answer {
  display: none;
  font-size: 0.82em;
  color: #22c55e;
  margin-left: 4px;
}

.exam-blank-input--correct {
  border-bottom-color: #22c55e;
  border-bottom-style: solid;
  background: #f0fdf4;
}

.exam-blank-input--wrong {
  border-bottom-color: #ef4444;
  border-bottom-style: solid;
  background: #fef2f2;
}

.exam-blank-input:disabled {
  opacity: 1;
  cursor: default;
}
</style>
