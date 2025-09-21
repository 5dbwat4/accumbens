<template>
  <n-h1 prefix="bar">Settings</n-h1>
  <n-divider title-placement="left"> 样式和效果 </n-divider>
  <n-card title="打印时样式">
    <n-form-item label="展示引流块" label-placement="left">
      <n-switch v-model:value="state.showPrintNotif" />
    </n-form-item>
  </n-card>
  <n-card title="鼠标指针效果">
    <n-p>*关闭鼠标指针效果后需刷新页面以同步更改</n-p>
    <n-form-item label="开启鼠标指针效果" label-placement="left">
      <n-switch v-model:value="state.cursorAnim" />
    </n-form-item>
  </n-card>

  <n-divider title-placement="left"> 功能 </n-divider>

  <n-card title="Keyboard Shortcuts">
    <n-form-item label="启用Focus Trap" label-placement="left">
      <n-switch v-model:value="state.keyboardShortcuts.focusTrap" />
    </n-form-item>
    <n-p>*启用后，按Tab键时会在核心元素间循环切换，按Shift+Tab键会反向切换，单击Esc在该页面临时退出Focus Trap</n-p>
        <n-form-item label="使用Q在index文件和entry list间切换" label-placement="left">
      <n-switch v-model:value="state.keyboardShortcuts.indexSwitchEnabled" />
    </n-form-item>
    <n-form-item label="使用Backspace返回上一页" label-placement="left">
      <n-switch v-model:value="state.keyboardShortcuts.backspaceEnabled" />
    </n-form-item>

    <!-- <n-button round type="primary">调整按键绑定</n-button> -->
  </n-card>
</template>
<script setup>
import state from "@/utils/storage";

//-====== Font Style ==================================================

const FONT_STYLE__options = [
  { value: "XLWK", label: "霞鹜文楷" },
  { value: "sansserif", label: "普通的无衬线字体" },
  { value: "serif", label: "普通的衬线字体" },
];
</script>

<style scoped>
.n-card {
  background-color: transparent;
  border: 1px solid #a2a2a2 !important;
  margin-bottom: 1rem;
}
.n-divider {
  --n-color: rgb(131, 131, 179) !important;
}
</style>
