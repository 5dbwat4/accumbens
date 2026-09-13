<template>
  <div
    v-if="targetTime !== null"
    class="acc-timer"
    role="timer"
    :aria-label="ariaText"
  >
    <template v-for="(unit, ui) in unitList" :key="unit.key">
      <div v-if="ui > 0" class="colon" aria-hidden="true"><i></i><i></i></div>
      <div class="unit">
        <div class="card">
          <span
            v-for="(ch, i) in strings[unit.key]"
            :key="unit.key + '-' + i"
            class="digit"
          >
            <span :key="ch" class="roller">
              <span class="face">{{ ch }}</span>
              <span class="face">{{ prevChar(unit.key, i) }}</span>
            </span>
          </span>
        </div>
        <span class="label">{{ unit.label }}</span>
      </div>
    </template>
  </div>
  <div v-else class="acc-timer-invalid">Timer: invalid or missing "target"</div>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  // End date: ISO string ("2027-01-01T00:00:00+08:00"), unix timestamp in
  // ms (or seconds), or a Date object.
  target: {
    type: [String, Number, Date],
    required: true,
  },
  // Accent color: cards, colon dots and labels.
  color: {
    type: String,
    default: "#f59e0b",
  },
  // Digit color on the cards.
  textColor: {
    type: String,
    default: "#ffffff",
  },
  // Comma separated unit labels.
  labels: {
    type: String,
    default: "Days,Hours,Minutes,Seconds",
  },
});

const FALLBACK_LABELS = ["Days", "Hours", "Minutes", "Seconds"];

const unitList = computed(() => {
  const parsed = props.labels
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const keys = ["days", "hours", "minutes", "seconds"];
  return keys.map((key, i) => ({
    key,
    label: parsed[i] || FALLBACK_LABELS[i],
  }));
});

function parseTarget(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const raw = value.trim();
    if (/^\d+$/.test(raw)) {
      const n = Number(raw);
      return n < 1e12 ? n * 1000 : n; // seconds vs milliseconds
    }
    const t = new Date(raw).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

const targetTime = computed(() => parseTarget(props.target));

function computeParts(diffMs) {
  const total = Math.max(0, Math.floor(diffMs / 1000));
  return {
    days: String(Math.floor(total / 86400)),
    hours: String(Math.floor(total / 3600) % 24).padStart(2, "0"),
    minutes: String(Math.floor(total / 60) % 60).padStart(2, "0"),
    seconds: String(total % 60).padStart(2, "0"),
  };
}

const strings = ref(computeParts((targetTime.value ?? Date.now()) - Date.now()));
const prevStrings = ref({ ...strings.value });

function prevChar(key, i) {
  return prevStrings.value[key]?.[i] ?? strings.value[key][i];
}

function refresh() {
  if (targetTime.value === null) return;
  prevStrings.value = { ...strings.value };
  strings.value = computeParts(targetTime.value - Date.now());
}

let timer = null;
onMounted(() => {
  timer = setInterval(refresh, 500);
});
onBeforeUnmount(() => {
  if (timer !== null) clearInterval(timer);
});

const ariaText = computed(() => {
  const s = strings.value;
  return `${s.days} days ${s.hours} hours ${s.minutes} minutes ${s.seconds} seconds remaining`;
});
</script>

<style scoped>
.acc-timer {
  --face-h: 2.3em;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  margin: 1.5em 0;
  user-select: none;
}

.unit {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card {
  display: flex;
  padding: 8px 6px;
  background: v-bind(color);
  border-radius: 10px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 15%);
}

.digit {
  width: 1.4em;
  height: var(--face-h);
  overflow: hidden;
  font-size: 1.7em;
  font-weight: 700;
  line-height: 1;
  color: v-bind(textColor);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.roller {
  display: flex;
  flex-direction: column;
  will-change: transform;
  animation: timer-roll 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.face {
  height: var(--face-h);
  line-height: var(--face-h);
}

@keyframes timer-roll {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .roller {
    animation: none;
  }
}

.colon {
  height: calc(var(--face-h) + 16px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5em;
}

.colon i {
  display: block;
  width: 6px;
  height: 6px;
  margin: 0 auto;
  border-radius: 50%;
  background: v-bind(color);
}

.label {
  margin-top: 7px;
  font-size: 0.9em;
  font-weight: 600;
  color: v-bind(color);
}

.acc-timer-invalid {
  margin: 1.5em 0;
  padding: 0.6em 1em;
  border: 1px dashed #d0d0d0;
  border-radius: 6px;
  color: #b00;
  font-size: 0.9em;
  text-align: center;
}
</style>
