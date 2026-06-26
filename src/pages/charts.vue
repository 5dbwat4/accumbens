<template>
   <n-h1 prefix="bar">
    <span class="heading-overwrite">Charts & Stats</span>
  </n-h1>
    <n-card title="Overview">
    <n-p class="overview-line">
      <PaperLineIcon /> 页面总数：<span class="overview-number">{{ formatInteger(overviewStats.totalFiles) }} </span>
      <PenLineDuotoneIcon /> 字数：<span class="overview-number">{{ formatInteger(overviewStats.totalWords) }} </span>
    </n-p>
    <n-p class="overview-line">
      <ListBoldIcon /> 总行数：<span class="overview-number">{{ formatInteger(overviewStats.totalLines) }} </span>
      <CodeBoldDuotoneIcon /> 包含 <span class="overview-number">{{ formatInteger(overviewStats.codeBlockLines) }} </span> 行代码
    </n-p>
  </n-card>
  <n-card title="Git">
    <n-p>
      <strong>Accumbens</strong> —
      <a v-if="gitInfo.accumbens.url" :href="gitInfo.accumbens.url" target="_blank" class="hash-link">{{ gitInfo.accumbens.hash }}</a>
      <template v-else>{{ gitInfo.accumbens.hash }}</template>
      <template v-if="gitInfo.accumbens.time"> · <span :title="formatTime(gitInfo.accumbens.time)">{{ formatRelative(gitInfo.accumbens.time) }}</span></template>
    </n-p>
    <n-p>
      <strong>Noting</strong> —
      <a v-if="gitInfo.noting.url" :href="gitInfo.noting.url" target="_blank" class="hash-link">{{ gitInfo.noting.hash }}</a>
      <template v-else>{{ gitInfo.noting.hash }}</template>
      <template v-if="gitInfo.noting.time"> · <span :title="formatTime(gitInfo.noting.time)">{{ formatRelative(gitInfo.noting.time) }}</span></template>
    </n-p>
  </n-card>

  
  <n-divider title-placement="left">Rankings</n-divider>

  <div style="width: fit-content;">
    <n-input-group>
      <n-input-group-label>Wanna take a glance of</n-input-group-label>
      <n-select  v-model:value="selectedRankingCard" :options="rankingCardOptions" />
    </n-input-group>
    </div>

  <n-card v-if="selectedRankingCard === 'recentlyUpdated'" title="Recently updated">
    <ol class="ranking-list">
      <li
        v-for="(doc, index) in recentDocs"
        :key="`${doc.path}-${doc.updatedAt}`"
        :class="{ 'ranking-clickable': getRankingDocRoute(doc) }"
        :tabindex="getRankingDocRoute(doc) ? 0 : -1"
        role="link"
        @click="openRankingDoc(doc)"
        @keydown.enter.prevent="openRankingDoc(doc)"
        @keydown.space.prevent="openRankingDoc(doc)"
      >
        <span class="ranking-index">{{ padRank(index + 1) }}</span>
        <div class="ranking-main">
          <strong
            :class="{ 'ranking-path-title': !doc.title }"
            :title="rankingDocTitle(doc)"
          >{{ rankingDocTitle(doc) }}</strong>
          <span v-if="doc.title">{{ rankingDocUrl(doc) }}</span>
        </div>
        <time :datetime="doc.updatedAt" :title="formatTime(doc.updatedAt)">
          {{ formatRelative(doc.updatedAt) }}
        </time>
      </li>
    </ol>
  </n-card>

  <n-card v-if="selectedRankingCard === 'largest'" title="Largest">
    <ol class="ranking-list">
      <li
        v-for="(doc, index) in largestDocs"
        :key="doc.path"
        :class="{ 'ranking-clickable': getRankingDocRoute(doc) }"
        :tabindex="getRankingDocRoute(doc) ? 0 : -1"
        role="link"
        @click="openRankingDoc(doc)"
        @keydown.enter.prevent="openRankingDoc(doc)"
        @keydown.space.prevent="openRankingDoc(doc)"
      >
        <span class="ranking-index">{{ padRank(index + 1) }}</span>
        <div class="ranking-main">
          <strong
            :class="{ 'ranking-path-title': !doc.title }"
            :title="rankingDocTitle(doc)"
          >{{ rankingDocTitle(doc) }}</strong>
          <span v-if="doc.title">{{ rankingDocUrl(doc) }}</span>
        </div>
        <code>{{ formatSize(doc.size) }}</code>
      </li>
    </ol>
  </n-card>

  <n-divider title-placement="left">Neurons & Myelins</n-divider>

  <n-p>
    Accumbens compiled
    <span class="bundle-size-number">{{ formatSize(overviewStats.totalSize) }}</span>
    notes into
    <span class="bundle-size-number">{{ formatSize(buildStats.neuron.size) }}</span>
    neurons, plus
    <span class="bundle-size-number">{{ formatSize(buildStats.neuronAssets.size) }}</span>
    assets, along with
    <span class="bundle-size-number">{{ formatSize(buildStats.myelin.size) }}</span>
    myelins.
  </n-p>
  <div class="bundle-chart-wrap">
    <canvas ref="bundleCanvas" aria-label="Neurons and myelins size chart"></canvas>
  </div>

  <n-divider />
  <n-p>Last build: {{ lastBuildTime }}</n-p>

</template>

<script setup>
import Chart from "chart.js/auto";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useTitle } from "@vueuse/core";
import { formatDistanceToNow } from "date-fns";
import PaperLineIcon from '~icons/mingcute/paper-line';
import ListBoldIcon from '~icons/solar/list-bold';
import CodeBoldDuotoneIcon from '~icons/solar/code-bold-duotone?width=1em&height=1em';
import PenLineDuotoneIcon from '~icons/solar/pen-line-duotone?width=1em&height=1em';

useTitle("Charts - 5dbwat4's Notebook");
const router = useRouter();

const stats = ref(null);
const bundleCanvas = ref(null);
const selectedRankingCard = ref("recentlyUpdated");

let bundleChart = null;

const bundleCalloutLabels = ["myelin", "neuron content"];
const bundleBoldCalloutLabels = ["myelin", "neuron content"];

const bundleCalloutPlugin = {
  id: "bundleCallouts",
  afterDatasetsDraw(chart, _args, options) {
    const explicitLabels = new Set(options?.labels || []);
    const boldLabels = new Set(options?.boldLabels || []);
    const minRatio = Number(options?.minRatio ?? 0);

    const meta = chart.getDatasetMeta(0);
    const labels = chart.data.labels || [];
    const data = chart.data.datasets?.[0]?.data || [];
    const total = data.reduce((sum, value) => sum + Number(value || 0), 0);
    const { ctx } = chart;

    ctx.save();
    ctx.strokeStyle = "#25313a";
    ctx.fillStyle = "#25313a";
    ctx.lineWidth = 1;
    ctx.font = '12px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.textBaseline = "middle";

    meta.data.forEach((arc, index) => {
      const label = labels[index];
      const value = Number(data[index] || 0);
      const ratio = total ? value / total : 0;
      const shouldShow = explicitLabels.has(label) || ratio > minRatio;
      if (!shouldShow) return;

      const props = arc.getProps(["x", "y", "startAngle", "endAngle", "outerRadius"], true);
      const angle = (props.startAngle + props.endAngle) / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rightSide = cos >= 0;
      const startX = props.x + cos * props.outerRadius;
      const startY = props.y + sin * props.outerRadius;
      const elbowX = props.x + cos * (props.outerRadius + 14);
      const elbowY = props.y + sin * (props.outerRadius + 14);
      const endX = elbowX + (rightSide ? 34 : -34);
      const textX = endX + (rightSide ? 6 : -6);
      const text = `${label} ${formatSize(data[index])}`;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(endX, elbowY);
      ctx.stroke();

      ctx.textAlign = rightSide ? "left" : "right";
      ctx.font = `${boldLabels.has(label) ? "600 " : ""}12px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.fillText(text, textX, elbowY);
    });

    ctx.restore();
  },
};

const emptyGitInfo = {
  accumbens: { hash: "读取中", url: "", time: "" },
  noting: { hash: "读取中", url: "", time: "" },
};

const gitInfo = computed(() => stats.value?.git || emptyGitInfo);

const overviewStats = computed(() => ({
  totalFiles: stats.value?.docs?.totalFiles ?? 0,
  totalSize: stats.value?.docs?.totalSize ?? 0,
  totalWords: stats.value?.docs?.totalWords ?? 0,
  totalLines: stats.value?.docs?.totalLines ?? 0,
  codeBlockLines: stats.value?.docs?.codeBlockLines ?? 0,
}));

const buildStats = computed(() => ({
  neuron: stats.value?.build?.neuron ?? { count: 0, size: 0 },
  neuronAssets: stats.value?.build?.neuronAssets ?? { count: 0, size: 0 },
  myelin: stats.value?.build?.myelin ?? { count: 0, size: 0 },
}));

const rankingCardOptions = [
  { label: "Recently updated", value: "recentlyUpdated" },
  { label: "Largest", value: "largest" },
];

const topDocs = computed(() => stats.value?.docs.topSize || []);
const recentDocs = computed(() => stats.value?.docs.recentlyUpdated || []);
const largestDocs = computed(() => topDocs.value);
const lastBuildTime = computed(() => formatTime(stats.value?.generatedAt));

onMounted(async () => {
  try {
    const response = await fetch("/accumbens-stats.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("请先执行构建，生成 dist/accumbens-stats.json。");
    }

    stats.value = await response.json();
    await nextTick();
    renderCharts();
  } catch (err) {
    console.warn(err?.message || "无法读取 /accumbens-stats.json。");
  }
});

onBeforeUnmount(() => {
  destroyCharts();
});

function destroyCharts() {
  bundleChart?.destroy();
  bundleChart = null;
}

function renderCharts() {
  if (!stats.value) return;
  destroyCharts();

  const { build } = stats.value;

  if (bundleCanvas.value) {
    const bundleSlices = getBundleChartSlices(build);
    bundleChart = new Chart(bundleCanvas.value, {
      type: "pie",
      data: {
        labels: bundleSlices.map((item) => item.label),
        datasets: [
          {
            data: bundleSlices.map((item) => item.size),
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderColor: "#25313a",
            borderWidth: 2,
            hoverBorderColor: "#2f7d76",
            hoverBorderWidth: 3,
            hoverOffset: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        radius: "82%",
        layout: {
          padding: {
            top: 18,
            right: 96,
            bottom: 8,
            left: 96,
          },
        },
        animation: {
          duration: 700,
          easing: "easeOutQuart",
        },
        plugins: {
          legend: {
            display: false,
            position: "bottom",
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              color: "#25313a",
              usePointStyle: false,
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.label}: ${formatSize(context.raw)}`;
              },
            },
          },
          bundleCallouts: {
            labels: bundleCalloutLabels,
            boldLabels: bundleBoldCalloutLabels,
            minRatio: 0.05,
          },
        },
      },
      plugins: [bundleCalloutPlugin],
    });
  }
}

function sizeByExt(items, ext) {
  return items?.find((item) => item.ext === ext)?.size || 0;
}

function getBundleChartSlices(build) {
  const neuronByExt = build.neuronByExt || [];
  const neuronAssetsByExt = build.neuronAssetsByExt || [];
  const slices = [
    { label: "myelin", size: build.myelin?.size || 0 },
    { label: "neuron content", size: sizeByExt(neuronByExt, ".js") },
    { label: "neuron .css", size: sizeByExt(neuronByExt, ".css") },
    ...neuronAssetsByExt.map((item) => ({
      label: `neuron assets ${item.ext}`,
      size: item.size,
    })),
  ];

  return slices.filter((item) => item.size > 0);
}

function formatInteger(value) {
  return new Intl.NumberFormat("zh-CN").format(Number(value || 0));
}

function formatSize(bytes) {
  if (bytes === null || bytes === undefined) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = Number(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未知";
  return date.toLocaleString();
}

function formatRelative(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未知";
  return formatDistanceToNow(date, { addSuffix: true });
}

function padRank(value) {
  return String(value).padStart(2, "0");
}

function openRankingDoc(doc) {
  if (!doc?.routePath) return;
  router.push(doc.routePath);
}

function getRankingDocRoute(doc) {
  return doc?.routePath || "";
}

function rankingDocTitle(doc) {
  return doc?.title || `(${doc?.path || ""})`;
}

function rankingDocUrl(doc) {
  return doc?.path || "";
}

</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
</style>


<style scoped>

.heading-overwrite {
  font-family: Cardo;
  color: #000000;
  font-weight: bold;
}

.n-input-group-label{
    background-color: transparent;
    color:#515151;
  margin-bottom: 1rem;
}

.n-select :deep(.n-base-selection-label){
    background-color: transparent;
}
.n-select :deep(.n-base-selection-input__content){

    color: rgb(23, 23, 123);
}


.n-card {
  background-color: transparent;
  border: 1px solid #a2a2a2 !important;
  margin-bottom: 1rem;
}

.hash-link {
  font-family: 'JetBrains Mono', monospace;
  color: #0969da;
  text-decoration: none;
}
.hash-link:hover {
  text-decoration: underline;
}

.overview-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem 0.55rem;
}

.overview-line :deep(svg) {
  flex: 0 0 auto;
  width: 1.08em;
  height: 1.08em;
  color: #59636b;
}

.overview-number {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.18em;
  font-weight: 600;
  line-height: 1;
  color: #2f7d76;
}

.bundle-size-number {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.02em;
  font-weight: 600;
  line-height: 1;
  color: #25313a;
}

.bundle-chart-wrap {
  position: relative;
  height: 400px;
  max-width: 100%;
  margin: 0.5rem 0 1rem;
  margin-right: auto;
  margin-left: auto;
}

.ranking-list {
  display: grid;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}

.ranking-list li {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid rgba(37, 49, 58, 0.16);
}

.ranking-list li:last-child {
  border-bottom: 0;
}

.ranking-list li.ranking-clickable {
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}

.ranking-list li.ranking-clickable:hover,
.ranking-list li.ranking-clickable:focus-visible {
  background-color: rgba(47, 125, 118, 0.08);
}

.ranking-list li.ranking-clickable:focus-visible {
  outline: 1px solid rgba(47, 125, 118, 0.72);
  outline-offset: -1px;
}

.ranking-index,
.ranking-list code {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.ranking-index {
  color: #2f7d76;
  font-weight: 600;
}

.ranking-main {
  min-width: 0;
}

.ranking-main strong,
.ranking-main span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-main .ranking-path-title {
  color: #657078;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.ranking-main span {
  margin-top: 0.15rem;
  color: #657078;
  font-size: 0.82rem;
}

.ranking-list time,
.ranking-list code {
  color: #59636b;
  white-space: nowrap;
}

.n-divider {
  --n-color: rgb(131, 131, 179) !important;
}

@media (max-width: 720px) {
  .ranking-list li {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
}
</style>
