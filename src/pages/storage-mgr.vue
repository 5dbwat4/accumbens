<template>
	<n-h1 prefix="bar">Storage Manager</n-h1>

	<n-card title="Service Worker 状态">
		<n-space vertical>
			<n-p>
				支持情况：
				<n-tag :type="swSupported ? 'success' : 'error'" size="small">
					{{ swSupported ? "支持" : "不支持" }}
				</n-tag>
			</n-p>
			<n-p>
				运行状态：
				<n-tag :type="isRunning ? 'success' : 'warning'" size="small">
					{{ isRunning ? "已运行" : "未运行" }}
				</n-tag>
			</n-p>
			<n-p>
				控制当前页面：
				<n-tag :type="isControllingPage ? 'success' : 'warning'" size="small">
					{{ isControllingPage ? "是" : "否" }}
				</n-tag>
			</n-p>
			<n-space>
				<n-button :loading="isLoading" @click="refreshStatus">刷新状态</n-button>
			</n-space>
		</n-space>
	</n-card>

	<n-card title="缓存统计">
		<n-space vertical>
			<n-p>缓存名称：{{ cacheStats.cacheName || "(未获取)" }}</n-p>
			<n-p>资源数量：{{ cacheStats.resourceCount }}</n-p>
			<n-p>总大小：{{ formattedSize }}</n-p>
			<n-space>
				<n-button :loading="isLoading" @click="refreshStatus">重新统计</n-button>
				<n-button
					type="error"
					ghost
					:disabled="!swSupported || !isRunning"
					:loading="isClearing"
					@click="clearCache"
				>
					清空缓存
				</n-button>
			</n-space>
			<n-alert v-if="errorMessage" type="error" :show-icon="false">
				{{ errorMessage }}
			</n-alert>
		</n-space>
	</n-card>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const swSupported = typeof navigator !== "undefined" && "serviceWorker" in navigator;
const isRunning = ref(false);
const isControllingPage = ref(false);
const isLoading = ref(false);
const isClearing = ref(false);
const errorMessage = ref("");
const cacheStats = ref({
	cacheName: "",
	resourceCount: 0,
	totalBytes: 0,
});

const formattedSize = computed(() => formatBytes(cacheStats.value.totalBytes || 0));

onMounted(async () => {
	if (!swSupported) {
		return;
	}

	navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
	navigator.serviceWorker.addEventListener("message", onServiceWorkerMessage);
	await refreshStatus();
});

onBeforeUnmount(() => {
	if (!swSupported) {
		return;
	}

	navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
	navigator.serviceWorker.removeEventListener("message", onServiceWorkerMessage);
});

async function refreshStatus() {
	if (!swSupported) {
		return;
	}

	isLoading.value = true;
	errorMessage.value = "";

	try {
		await updateRegistrationFlags();
		const response = await sendMessageToServiceWorker("GET_CACHE_STATUS");

		if (response && response.type === "CACHE_STATUS") {
			applyCacheStats(response.payload);
			isRunning.value = true;
		}
	} catch (error) {
		isRunning.value = false;
		errorMessage.value = error instanceof Error ? error.message : "无法获取 Service Worker 状态";
	} finally {
		isLoading.value = false;
	}
}

async function clearCache() {
	if (!swSupported) {
		return;
	}

	isClearing.value = true;
	errorMessage.value = "";

	try {
		const response = await sendMessageToServiceWorker("CLEAR_CACHE");

		if (response && response.payload) {
			applyCacheStats(response.payload);
		}
	} catch (error) {
		errorMessage.value = error instanceof Error ? error.message : "清空缓存失败";
	} finally {
		isClearing.value = false;
	}
}

function onControllerChange() {
	isControllingPage.value = Boolean(navigator.serviceWorker.controller);
}

function onServiceWorkerMessage(event) {
	const data = event.data;
	if (!data || data.type !== "CACHE_UPDATED") {
		return;
	}

	if (data.payload) {
		applyCacheStats(data.payload);
	}
}

function applyCacheStats(payload) {
	cacheStats.value = {
		cacheName: payload.cacheName || "",
		resourceCount: payload.resourceCount || 0,
		totalBytes: payload.totalBytes || 0,
	};
}

async function updateRegistrationFlags() {
	const registration = await navigator.serviceWorker.getRegistration();
	isRunning.value = Boolean(registration && registration.active);
	isControllingPage.value = Boolean(navigator.serviceWorker.controller);
}

async function sendMessageToServiceWorker(type, payload = {}) {
	const registration = await navigator.serviceWorker.ready;
	const target = registration.active || navigator.serviceWorker.controller;

	if (!target) {
		throw new Error("Service Worker 未激活，请刷新页面后重试");
	}

	return new Promise((resolve, reject) => {
		const channel = new MessageChannel();
		const timer = window.setTimeout(() => {
			reject(new Error("Service Worker 响应超时"));
		}, 6000);

		channel.port1.onmessage = (event) => {
			window.clearTimeout(timer);
			resolve(event.data);
		};

		target.postMessage({ type, payload }, [channel.port2]);
	});
}

function formatBytes(bytes) {
	if (!bytes) {
		return "0 B";
	}

	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex += 1;
	}

	return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}
</script>

<style scoped>
.n-card {
	background-color: transparent;
	border: 1px solid #a2a2a2 !important;
	margin-bottom: 1rem;
}
</style>
