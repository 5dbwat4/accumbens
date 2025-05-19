<template>
<div class="download-card-wrapper" @click="downloadFile($attrs.url)">
<p >{{ $attrs.title }}</p>
<p>Size: {{ toDisplayedFilesize($attrs.size) }}</p>
<p><span>{{ $attrs.url }}</span><span>{{ $attrs.url?.split('/')?.pop() || 'file' }}</span></p>
<div class="download-card-icon"></div>
</div>
</template>
<script setup>
import { useAttrs } from 'vue';
import {toDisplayedFilesize} from '@/utils/basic-utils';



// const attrs = useAttrs();

// const sizeDisplayed = 

</script>