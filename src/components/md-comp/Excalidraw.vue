<template>
  <div
    class="acc-excalidraw"
    :class="{ 'acc-excalidraw--hide-toolbar': viewMode && hideToolbar }"
    :style="{ height }"
  >
    <div ref="container" class="acc-excalidraw-canvas"></div>
    <div v-if="loading" class="acc-excalidraw-status">Loading diagram…</div>
    <div v-else-if="error" class="acc-excalidraw-status acc-excalidraw-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  // Excalidraw data: { elements, appState, files } (or just an elements
  // array). A JSON string with either shape is accepted as well.
  payload: {
    type: [Object, Array, String],
    default: null,
  },
  // URL of a .excalidraw / JSON file. Ignored when `payload` is provided.
  src: {
    type: String,
    default: "",
  },
  // CSS height of the board.
  height: {
    type: String,
    default: "480px",
  },
  // Disable editing (view only). Enabled by default.
  viewMode: {
    type: Boolean,
    default: true,
  },
  // Zoom the board so all elements fit inside the viewport.
  fitToContent: {
    type: Boolean,
    default: true,
  },
  // Extra padding (in px) around the content when fitting.
  padding: {
    type: Number,
    default: 40,
  },
  // Hide Excalidraw's top menu bar while in view mode.
  hideToolbar: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["change", "ready"]);

const container = ref(null);
const loading = ref(false);
const error = ref("");

let root = null;
let revision = 0;
let requestId = 0;
let depsPromise = null;

// Excalidraw is a large React package; keep it out of the main bundle and
// load it only when an Excalidraw board is actually rendered.
function loadDependencies() {
  if (!depsPromise) {
    depsPromise = Promise.all([
      import("react"),
      import("react-dom/client"),
      import("@excalidraw/excalidraw"),
      import("@excalidraw/excalidraw/index.css"),
    ]).then(([react, reactDom, excalidraw]) => ({
      createElement: react.createElement,
      createRoot: reactDom.createRoot,
      Excalidraw: excalidraw.Excalidraw,
    }));
  }
  return depsPromise;
}

function normalize(data) {
  if (typeof data === "string") {
    const text = data.trim();
    if (!text) return null;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON in payload");
    }
  }

  if (Array.isArray(data)) {
    return {
      elements: data,
      appState: { viewBackgroundColor: "transparent" },
      files: {},
    };
  }

  if (!data || typeof data !== "object") return null;

  const appState =
    data.appState && typeof data.appState === "object" ? { ...data.appState } : {};
  if (!("viewBackgroundColor" in appState)) {
    appState.viewBackgroundColor = "transparent";
  }

  return {
    elements: Array.isArray(data.elements) ? data.elements : [],
    appState,
    files: data.files && typeof data.files === "object" ? data.files : {},
    scrollToContent: data.scrollToContent,
    libraryItems: data.libraryItems ?? data.library,
  };
}

async function resolveData() {
  if (props.payload !== null && props.payload !== undefined && props.payload !== "") {
    return normalize(props.payload);
  }

  if (!props.src) return normalize({ elements: [] });

  const response = await fetch(props.src);
  if (!response.ok) {
    throw new Error(`Failed to load diagram (${response.status})`);
  }
  return normalize(await response.text());
}

async function renderBoard() {
  const currentRequest = ++requestId;
  loading.value = true;
  error.value = "";

  let data;
  let deps;
  try {
    data = await resolveData();
    deps = await loadDependencies();
  } catch (err) {
    if (currentRequest !== requestId) return;
    loading.value = false;
    error.value = err instanceof Error ? err.message : String(err);
    return;
  }

  if (currentRequest !== requestId) return;
  if (!container.value) return;

  if (data && props.fitToContent) {
    data.scrollToContent = true;
  }

  loading.value = false;
  revision += 1;

  if (!root) {
    root = deps.createRoot(container.value);
  }

  root.render(
    deps.createElement(deps.Excalidraw, {
      key: revision,
      initialData: data,
      viewModeEnabled: props.viewMode,
      onChange: (elements, appState, files) => {
        emit("change", { elements, appState, files });
      },
      excalidrawAPI: (api) => {
        emit("ready", api);
        fitContent(api);
      },
    })
  );
}

let fitTimer = null;

// Excalidraw keeps the previous zoom/scroll when initialData is loaded, which
// often leaves the drawing larger than the viewport. Fit it after layout.
function fitContent(api) {
  if (!props.fitToContent || !api) return;
  clearTimeout(fitTimer);
  const run = () => {
    const elements = api.getSceneElements();
    if (elements && elements.length) {
      const padding = Math.max(0, Number(props.padding) || 0);
      const canvasOffsets = {
        left: padding,
        top: padding,
        right: padding,
        bottom: padding,
      };
      api.scrollToContent(elements, {
        fitToContent: true,
        animate: false,
        canvasOffsets,
      });
    }
  };
  requestAnimationFrame(() => requestAnimationFrame(run));
  fitTimer = setTimeout(run, 200);
}

onMounted(renderBoard);

watch(
  () => [props.payload, props.src, props.viewMode, props.fitToContent, props.padding],
  renderBoard,
  { deep: true }
);

onBeforeUnmount(() => {
  requestId += 1;
  clearTimeout(fitTimer);
  if (root) {
    root.unmount();
    root = null;
  }
});
</script>

<style scoped>
.acc-excalidraw {
  position: relative;
  width: 100%;
  margin: 1.5em 0;
  overflow: hidden;
  border: 1px solid #e3e3e3;
  border-radius: 12px;
  background: transparent;
}

.acc-excalidraw-canvas {
  width: 100%;
  height: 100%;
}

.acc-excalidraw--hide-toolbar :deep(.App-menu_top),
.acc-excalidraw--hide-toolbar :deep(.App-toolbar-content),
.acc-excalidraw--hide-toolbar :deep(.App-bottom-bar) {
  display: none !important;
}

.acc-excalidraw-status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1em;
  font-size: 0.9em;
  color: #757575;
  background: rgb(255 255 255 / 80%);
  pointer-events: none;
}

.acc-excalidraw-error {
  color: #b00020;
}
</style>
