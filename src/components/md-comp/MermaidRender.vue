<template>
  <div class="mermaid-render" :class="{ 'is-error': renderError }">
    <pre v-if="renderError" class="mermaid-render__error">{{ renderError }}</pre>
    <div v-else-if="!renderedSvg" class="mermaid-render__placeholder">
      Rendering diagram...
    </div>
    <div
      v-else
      ref="svgContainerRef"
      class="mermaid-render__svg"
      v-html="renderedSvg"
    />
  </div>
</template>

<script>
let renderId = 0;
let mermaidLoader;

async function getMermaid() {
  if (!mermaidLoader) {
    mermaidLoader = import("mermaid").then((mod) => {
      const mermaid = mod.default ?? mod;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "default",
      });
      return mermaid;
    });
  }

  return mermaidLoader;
}
</script>

<script setup>
import { nextTick, ref, watch } from "vue";

const props = defineProps({
  g: {
    type: String,
    default: "",
  },
});

const renderedSvg = ref("");
const renderError = ref("");
const svgContainerRef = ref(null);
let renderVersion = 0;

async function renderDiagram(graphDefinition) {
  const currentVersion = ++renderVersion;
  const graph = graphDefinition.trim();

  renderedSvg.value = "";
  renderError.value = "";

  if (!graph) {
    return;
  }

  try {
    const mermaid = await getMermaid();
    const { svg, bindFunctions } = await mermaid.render(
      `mermaid-render-${Date.now()}-${++renderId}`,
      graph,
    );

    if (currentVersion !== renderVersion) {
      return;
    }

    renderedSvg.value = svg;
    await nextTick();

    if (bindFunctions && svgContainerRef.value) {
      bindFunctions(svgContainerRef.value);
    }
  } catch (error) {
    if (currentVersion !== renderVersion) {
      return;
    }

    renderError.value = error instanceof Error ? error.message : String(error);
    console.error("Mermaid render failed:", error);
  }
}

watch(
  () => props.g,
  (graphDefinition) => {
    renderDiagram(graphDefinition ?? "");
  },
  { immediate: true },
);
</script>

<style scoped>
.mermaid-render {
  width: 100%;
  margin: 1em 0;
  overflow-x: auto;
  border: 1px solid #dedede;
  border-radius: 6px;
  background: #fff;
}

.mermaid-render__svg {
  min-width: max-content;
  padding: 1em;
  text-align: center;
}

.mermaid-render__svg :deep(svg) {
  max-width: 100%;
  height: auto;
}

.mermaid-render__placeholder,
.mermaid-render__error {
  margin: 0;
  padding: 1em;
  color: #6b7280;
}

.mermaid-render__error {
  overflow-x: auto;
  color: #b42318;
  white-space: pre-wrap;
}
</style>
