<template>
  <div class="attachment-card" title="Click to download" @click="download">
    <div class="badge" :style="{ background: meta.color }">
      <n-icon :size="26" :component="meta.icon" />
    </div>
    <div class="meta">
      <p class="name">{{ name }}</p>
      <p v-if="displayedSize" class="size">{{ displayedSize }}</p>
    </div>
    <n-button
      v-if="preview"
      quaternary
      circle
      class="preview-btn"
      title="Preview in new tab"
      @click.stop="previewFile"
    >
      <template #icon>
        <n-icon :size="22" :component="IconVisibility" />
      </template>
    </n-button>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { toDisplayedFilesize } from "@/utils/basic-utils";
import IconPdf from "~icons/material-symbols-light/picture-as-pdf";
import IconDescription from "~icons/material-symbols-light/description";
import IconTable from "~icons/material-symbols-light/table-chart";
import IconSlideshow from "~icons/material-symbols-light/slideshow";
import IconZip from "~icons/material-symbols-light/folder-zip";
import IconImage from "~icons/material-symbols-light/image";
import IconAudio from "~icons/material-symbols-light/audio-file";
import IconMovie from "~icons/material-symbols-light/movie";
import IconCode from "~icons/material-symbols-light/code-blocks";
import IconDraft from "~icons/material-symbols-light/draft";
import IconVisibility from "~icons/material-symbols-light/visibility";

const props = defineProps({
  // File name shown on the card; its extension picks the badge icon.
  name: {
    type: String,
    required: true,
  },
  // Where the file is downloaded / previewed from.
  path: {
    type: String,
    required: true,
  },
  // Bytes (number or numeric string, auto formatted) or a ready-made
  // display string such as "1.88MB".
  size: {
    type: [String, Number],
    default: "",
  },
  // Whether to show the preview (open in new tab) button.
  preview: {
    type: Boolean,
    default: true,
  },
});

const TYPE_MAP = {
  pdf: { icon: IconPdf, color: "#e53935" },
  doc: { icon: IconDescription, color: "#1e88e5" },
  docx: { icon: IconDescription, color: "#1e88e5" },
  odt: { icon: IconDescription, color: "#1e88e5" },
  rtf: { icon: IconDescription, color: "#1e88e5" },
  txt: { icon: IconDescription, color: "#1e88e5" },
  md: { icon: IconDescription, color: "#1e88e5" },
  xls: { icon: IconTable, color: "#43a047" },
  xlsx: { icon: IconTable, color: "#43a047" },
  csv: { icon: IconTable, color: "#43a047" },
  ods: { icon: IconTable, color: "#43a047" },
  ppt: { icon: IconSlideshow, color: "#fb8c00" },
  pptx: { icon: IconSlideshow, color: "#fb8c00" },
  odp: { icon: IconSlideshow, color: "#fb8c00" },
  zip: { icon: IconZip, color: "#f59e0b" },
  rar: { icon: IconZip, color: "#f59e0b" },
  "7z": { icon: IconZip, color: "#f59e0b" },
  tar: { icon: IconZip, color: "#f59e0b" },
  gz: { icon: IconZip, color: "#f59e0b" },
  bz2: { icon: IconZip, color: "#f59e0b" },
  xz: { icon: IconZip, color: "#f59e0b" },
  png: { icon: IconImage, color: "#8e24aa" },
  jpg: { icon: IconImage, color: "#8e24aa" },
  jpeg: { icon: IconImage, color: "#8e24aa" },
  gif: { icon: IconImage, color: "#8e24aa" },
  webp: { icon: IconImage, color: "#8e24aa" },
  svg: { icon: IconImage, color: "#8e24aa" },
  bmp: { icon: IconImage, color: "#8e24aa" },
  ico: { icon: IconImage, color: "#8e24aa" },
  mp3: { icon: IconAudio, color: "#00897b" },
  wav: { icon: IconAudio, color: "#00897b" },
  ogg: { icon: IconAudio, color: "#00897b" },
  flac: { icon: IconAudio, color: "#00897b" },
  m4a: { icon: IconAudio, color: "#00897b" },
  mp4: { icon: IconMovie, color: "#3949ab" },
  mkv: { icon: IconMovie, color: "#3949ab" },
  avi: { icon: IconMovie, color: "#3949ab" },
  mov: { icon: IconMovie, color: "#3949ab" },
  webm: { icon: IconMovie, color: "#3949ab" },
  js: { icon: IconCode, color: "#546e7a" },
  ts: { icon: IconCode, color: "#546e7a" },
  py: { icon: IconCode, color: "#546e7a" },
  c: { icon: IconCode, color: "#546e7a" },
  cpp: { icon: IconCode, color: "#546e7a" },
  java: { icon: IconCode, color: "#546e7a" },
  rs: { icon: IconCode, color: "#546e7a" },
  go: { icon: IconCode, color: "#546e7a" },
  sh: { icon: IconCode, color: "#546e7a" },
  json: { icon: IconCode, color: "#546e7a" },
  html: { icon: IconCode, color: "#546e7a" },
  css: { icon: IconCode, color: "#546e7a" },
};
const DEFAULT_TYPE = { icon: IconDraft, color: "#757575" };

function extensionOf(value) {
  const match = /\.([a-z0-9]+)\s*$/i.exec((value ?? "").trim());
  return match ? match[1].toLowerCase() : "";
}

const meta = computed(
  () => TYPE_MAP[extensionOf(props.name) || extensionOf(props.path)] ?? DEFAULT_TYPE
);

const displayedSize = computed(() => {
  if (props.size === "" || props.size === null || props.size === undefined) {
    return "";
  }
  const numeric = Number(props.size);
  if (Number.isFinite(numeric) && String(props.size).trim() !== "") {
    return toDisplayedFilesize(numeric);
  }
  return String(props.size);
});

function download() {
  const anchor = document.createElement("a");
  anchor.href = props.path;
  anchor.download = props.name || "";
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function previewFile() {
  window.open(props.path, "_blank", "noopener");
}
</script>

<style scoped>
.attachment-card {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 760px;
  margin: 1.2em auto;
  padding: 12px 18px;
  background: #fff;
  border: 1px solid #e3e3e3;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.attachment-card:hover {
  border-color: #c8c8c8;
  box-shadow: 0 2px 10px rgb(0 0 0 / 8%);
}

.badge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 10px;
  color: #fff;
}

.meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  margin: 0;
  font-weight: 600;
  color: #1f1f1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size {
  margin: 0;
  font-size: 0.85em;
  color: #9e9e9e;
}

.preview-btn {
  flex-shrink: 0;
  margin-left: auto;
}
</style>
