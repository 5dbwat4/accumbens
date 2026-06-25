<template>
  <n-h1 prefix="bar">Settings</n-h1>
  <n-divider title-placement="left"> 样式和效果 </n-divider>
  <n-card title="打印时样式">
    <n-form-item label="展示引流块" label-placement="left">
      <n-switch v-model:value="state.showPrintNotif" />
    </n-form-item>
    <n-form-item label="打印时隐藏header和breadcrumb" label-placement="left">
      <n-switch v-model:value="state.hideHeaderWhenPrinting" />
    </n-form-item>
  </n-card>
  <n-card title="鼠标指针效果">
    <n-p>*关闭鼠标指针效果后需刷新页面以同步更改</n-p>
    <n-form-item label="开启鼠标指针效果" label-placement="left">
      <n-switch v-model:value="state.cursorAnimV2" />
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

  <n-divider title-placement="left"> 存储 </n-divider>

  <n-card title="Cache in indexDB">
    当前Service Worker状态： Not available


  </n-card>

  <n-divider title-placement="left"> 构建信息 </n-divider>

  <n-card title="Build Info">
    <n-p>
      <strong>Accumbens</strong> —
      <a v-if="buildInfo.git.accumbens.url" :href="buildInfo.git.accumbens.url" target="_blank" class="hash-link">{{ buildInfo.git.accumbens.hash }}</a>
      <template v-else>{{ buildInfo.git.accumbens.hash }}</template>
      <template v-if="buildInfo.git.accumbens.time"> · <span :title="formatTime(buildInfo.git.accumbens.time)">{{ formatRelative(buildInfo.git.accumbens.time) }}</span></template>
    </n-p>
    <n-p>
      <strong>Noting</strong> —
      <a v-if="buildInfo.git.noting.url" :href="buildInfo.git.noting.url" target="_blank" class="hash-link">{{ buildInfo.git.noting.hash }}</a>
      <template v-else>{{ buildInfo.git.noting.hash }}</template>
      <template v-if="buildInfo.git.noting.time"> · <span :title="formatTime(buildInfo.git.noting.time)">{{ formatRelative(buildInfo.git.noting.time) }}</span></template>
    </n-p>

    <!-- <n-divider />

    <template v-if="sizes">
      <n-p>
        <strong>Built Artifact</strong> —
        {{ formatSize(sizes.built.totalSize) }} ({{ sizes.built.totalCount }} files)
      </n-p>
      <table class="build-info-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Count</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sizes.built.byExt" :key="item.ext">
            <td><code>{{ item.ext }}</code></td>
            <td>{{ item.count }}</td>
            <td>{{ formatSize(item.size) }}</td>
          </tr>
        </tbody>
      </table>

      <template v-if="sizes.noting">
        <n-divider />
        <n-p>
          <strong>Original Noting Files</strong> —
          {{ formatSize(sizes.noting.totalSize) }} ({{ sizes.noting.totalCount }} files)
        </n-p>
        <table class="build-info-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Count</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sizes.noting.byExt" :key="item.ext">
              <td><code>{{ item.ext }}</code></td>
              <td>{{ item.count }}</td>
              <td>{{ formatSize(item.size) }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </template>
    <n-p v-else>Build size data not available.</n-p> -->
  </n-card>

</template>
<script setup>
import { onMounted, ref } from "vue";
import { formatDistanceToNow } from "date-fns";
import state from "@/utils/storage";
import buildInfo from "virtual:build-info";

const sizes = ref(null);

onMounted(async () => {
  try {
    const resp = await fetch("/build-info-sizes.json");
    if (resp.ok) {
      sizes.value = await resp.json();
    }
  } catch {
    // sizes data not available in dev mode
  }
});

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatRelative(iso) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

//-====== Font Style ==================================================

const FONT_STYLE__options = [
  { value: "XLWK", label: "霞鹜文楷" },
  { value: "sansserif", label: "普通的无衬线字体" },
  { value: "serif", label: "普通的衬线字体" },
];
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
</style>

<style scoped>
.n-card {
  background-color: transparent;
  border: 1px solid #a2a2a2 !important;
  margin-bottom: 1rem;
}
.n-divider {
  --n-color: rgb(131, 131, 179) !important;
}
.build-info-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
}
.build-info-table th,
.build-info-table td {
  padding: 0.35rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
.build-info-table th {
  font-weight: 600;
  color: #666;
  font-size: 0.85rem;
}
.build-info-table td code {
  font-size: 0.85rem;
}
.hash-link {
  font-family: 'JetBrains Mono', monospace;
  color: #0969da;
  text-decoration: none;
}
.hash-link:hover {
  text-decoration: underline;
}
</style>
