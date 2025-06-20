<template>
  <div class="qa-card">
    <div class="question-section">
      <div class="section-header">
        <span class="icon question-icon"><HelpCircleOutline/></span>
        <span class="section-title">Question</span>
      </div>
      <div class="content">
        <Q/>
      </div>
    </div>
    
    <div class="answer-section">
      <div class="section-header">
        <span class="icon answer-icon"><BulbOutline/></span>
        <span class="section-title">Answer</span>
      </div>
      <div class="content">
        <A/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BulbOutline,HelpCircleOutline } from '@vicons/ionicons5';
import { useSlots } from 'vue';
const slots = useSlots();

const [Q, A] = slots.default();

</script>

<style scoped>
.qa-card {
  max-width: 800px;
  margin: 16px auto;
  border: 1px solid #d1d9e0;
  border-radius: 8px;
  background-color: #ffffff00;
  box-shadow: 0 0px 0px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
}

.question-section {
  background-color: #f6f8fa;
  border-bottom: 1px solid #d1d9e0;
  padding: 16px 20px;
}

.answer-section {
  background-color: #ffffff;
  padding: 16px 20px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.icon {
  font-size: 18px;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.question-icon {
  filter: grayscale(0.3);
}

.answer-icon {
  filter: grayscale(0.2);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #24292f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.content {
  font-size: 16px;
  line-height: 1.6;
  color: #24292f;
  margin: 0;
  word-wrap: break-word;
}

.question-section .content {
  font-weight: 500;
  color: #031932;
}

.answer-section .content {
  color: #2c274f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .qa-card {
    margin: 12px 16px;
    border-radius: 6px;
  }
  
  .question-section,
  .answer-section {
    padding: 12px 16px;
  }
  
  .content {
    font-size: 15px;
  }
  
  .section-title {
    font-size: 13px;
  }
}

/* 悬停效果 */
.qa-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.5s ease-in-out;
}

/* 焦点状态 */
.qa-card:focus-within {
  border-color: #0969da;
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
}
</style>