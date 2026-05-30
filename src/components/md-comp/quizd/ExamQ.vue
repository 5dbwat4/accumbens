<template>
  <div class="exam-q">
    <div class="exam-q-label">Question</div>
    <div class="exam-q-content"><slot /></div>
  </div>
</template>

<script>
export default { name: 'ExamQ' };
</script>

<style scoped>
.exam-q {
  margin-bottom: 16px;
}
.exam-q-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6366f1;
  margin-bottom: 8px;
}
.exam-q-content {
  font-size: 16px;
  line-height: 1.7;
  color: #1e293b;
}
</style>
