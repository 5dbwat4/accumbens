<template>
  <div class="library-card">
    <div class="card-header">
      <div class="library-info">
        <h2 class="library-name">
          <a class="library-name" v-if="library.url" :href="library.url" target="_blank">{{ library.name }}</a>
          <span v-else>{{ library.name }}</span>
        </h2>
        <span class="library-version">{{ library.version }}</span>
      </div>
      <div class="license-badge">
        {{ library.license }}
      </div>
    </div>

    <div class="card-body">
      <p class="library-description">{{ library.description }}</p>

      <div class="author-section">
        <div class="author-icon">👤</div>
        <div class="author-info">
          <span class="author-label">Author:</span>
          <div v-if="typeof library.author === 'string'" class="author-text">
            {{ library.author }}
          </div>
          <div v-else>
            {{ library.author?.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  library: {
    type: Object,
    required: true,
  },
});
</script>
<style scoped>
/* @media (prefers-color-scheme: dark) {
  .library-card {
    --bg-primary: #0d1117;
    --bg-secondary: #21262d;
    --border-primary: #30363d;
    --border-secondary: #21262d;
    --text-primary: #f0f6fc;
    --text-secondary: #8b949e;
    --text-muted: #7d8590;
    --accent-primary: #58a6ff;
    --accent-hover: #79c0ff;
    --success: #238636;
    --shadow: rgba(0, 0, 0, 0.3);
    --shadow-hover: rgba(0, 0, 0, 0.4);
  }
} */

/* Light theme */
/* @media (prefers-color-scheme: light) { */
  .library-card {
    --bg-primary: #ffffff;
    --bg-secondary: #f6f8fa;
    --border-primary: #d0d7de;
    --border-secondary: #d8dee4;
    --text-primary: #24292f;
    --text-secondary: #656d76;
    --text-muted: #656d76;
    --accent-primary: #0969da;
    --accent-hover: #0550ae;
    --success: #1a7f37;
    --shadow: rgba(0, 0, 0, 0.1);
    --shadow-hover: rgba(0, 0, 0, 0.15);
  }
/* } */

.library-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  margin: 20px auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
    Helvetica, Arial, sans-serif;
  color: var(--text-primary);
  box-shadow: 0 8px 24px var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.library-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px var(--shadow-hover);
}

.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.library-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.library-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--accent-primary);
  text-decoration: none;
  word-break: break-word;
}

.library-version {
  background: var(--bg-secondary);
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid var(--border-primary);
}

.license-badge {
  background: var(--success);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.card-body {
  padding: 16px 24px;
}

.library-description {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.author-section {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.author-icon {
  font-size: 16px;
  margin-top: 2px;
  color: var(--text-muted);
}

.author-info {
  flex: 1;
  min-width: 0;
}

.author-label {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 4px;
}

.author-text {
  color: var(--text-primary);
  font-size: 14px;
  word-break: break-word;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.author-contact {
  display: flex;
  align-items: center;
}

.author-email,
.author-web {
  color: var(--accent-primary);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s ease;
}

.author-email:hover,
.author-web:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.card-footer {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border-secondary);
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  font-size: 14px;
  color: var(--text-muted);
}

.stat-text {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
}

/* Theme toggle button */
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--border-primary);
}

/* Responsive design */
@media (max-width: 480px) {
  .library-card {
    margin: 16px;
    max-width: none;
  }

  .card-header {
    padding: 16px 20px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .library-info {
    width: 100%;
  }

  .library-name {
    font-size: 18px;
  }

  .card-body {
    padding: 12px 20px;
  }

  .card-footer {
    padding: 12px 20px 16px;
  }

  .stats {
    flex-wrap: wrap;
    gap: 16px;
  }

  .theme-toggle {
    top: 10px;
    right: 10px;
    padding: 6px 10px;
  }
}
</style>
