<template>
  <a
    class="link-card"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="link-card-body">
      <span class="link-card-title">{{ title || url }}</span>
      <span class="link-card-host">{{ host }}</span>
    </div>
    <n-icon :size="18" class="link-card-icon">
      <IconExternalLink />
    </n-icon>
  </a>
</template>
<script setup>
import { computed } from "vue";
import IconExternalLink from "~icons/line-md/external-link";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    required: true,
  },
});

const host = computed(() => {
  try {
    return new URL(props.url).hostname;
  } catch {
    return props.url;
  }
});
</script>

<style scoped>
.link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 1em 0;
  padding: 12px 16px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background-color: #ffffff;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.link-card:hover {
  border-color: #0969da;
  box-shadow: 0 2px 8px rgba(9, 105, 218, 0.12);
}

.link-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.link-card-title {
  font-size: 0.95em;
  font-weight: 500;
  color: #1f2328;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-card:hover .link-card-title {
  color: #0969da;
}

.link-card-host {
  font-size: 0.75em;
  color: #656d76;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-card-icon {
  flex-shrink: 0;
  color: #8c959f;
  transition: color 0.2s ease;
}

.link-card:hover .link-card-icon {
  color: #0969da;
}
</style>
