<template>
  <div class="detail-card">
    <div class="detail-header" @click="toggleCollapse">
      <div class="header-content">
        <div class="icon-wrapper">
          <component :is="icon" class="icon" />
        </div>
        <h3 class="title">{{ title }}</h3>
      </div>
      <div class="collapse-button" :class="{ 'collapsed': !isExpanded }" v-if="!$props.noExpansion">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    
    <div class="detail-content" :class="{ 'collapsed': !isExpanded }" :style="{
      maxHeight: $props
    }" ref="content">
      <div class="content-inner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
// import { IconCodeRounded, IconInfoOutlineRounded, IconBookOutlineRounded,
//     IconWarningRounded, IconErrorRounded
//  } from '@iconify-prerendered/vue-material-symbols-light'
//  import {IconTask} from '@iconify-prerendered/vue-material-symbols'
//  import IconFire from "@/assets/hugeicons~fire.svg";
//  import IconPrompt from "@/assets/icons/fluent~prompt-16-filled.vue";
import IconCodeRounded from '~iconify/material-symbols-light/code-rounded';
import IconInfoOutlineRounded from '~iconify/material-symbols-light/info-outline-rounded';
import IconBookOutlineRounded from '~iconify/material-symbols-light/book-outline-rounded';
import IconWarningRounded from '~iconify/material-symbols-light/warning-rounded';
import IconErrorRounded from '~iconify/material-symbols-light/error-rounded';
import IconTask from '~iconify/material-symbols/task';
import IconFire from '~iconify/hugeicons/fire';
import IconPrompt from '~iconify/fluent/prompt-16-filled';
import { useAttrs } from '@vue/runtime-core';

const CONFIG = {
    "code":{
        icon: IconCodeRounded ,
        primaryColor: "#2196f3",
    },
    "info":{
        icon: IconInfoOutlineRounded,
        primaryColor: "#2196f3",
    },
    "reference":{
        icon: IconBookOutlineRounded,
        primaryColor: "#2196f3",
    },
    "warn":{
        icon: IconWarningRounded,
        primaryColor: "#f44336",
    },
    "error":{
        icon: IconErrorRounded,
        primaryColor: "#f44336",
    },
    "hint":{
        icon: h("img", { src: IconFire, alt: "Hint Icon" }),
        primaryColor: "#2196f3",
    },
    "task":{
      icon:IconTask,
      primaryColor: '#200eb4'
    },
    "prompt":{
      icon: IconPrompt,
      primaryColor: '#36a11f'
    }

}

const props = defineProps({
  title: {
    type: String,
    default: ''
  },


  collapsed: {
    type: Boolean,
    default: false
  },

  noExpansion: {
    type: Boolean,
    default: false
  },

  type: {
    type: String,
    default: null
  },
  icon: {
    type: Object,
    default: null
  },
  color:{
    type: String,
    default: null
  },
  secondaryColor:{
    type: String,
    default: null
  }
})

console.log(props)

const isExpanded = ref(!props.collapsed && !props.noExpansion)
const content = ref(null)

const toggleCollapse = () => {
  if(!props.noExpansion)
  isExpanded.value = !isExpanded.value
}

onMounted(() => {
//   if (!props.defaultExpanded) {
//     isExpanded.value = false
//   }
})

const {icon, primaryColor, secondaryColor} = (props.type && CONFIG[props.type])? CONFIG[props.type]: {
  icon: props.icon ?? CONFIG.info.icon,
  primaryColor: props.color ?? CONFIG.info.primaryColor,
}
</script>

<style scoped>
.detail-card {
  border: 2px solid v-bind(primaryColor);
  border-radius: 8px;
  background: #ffffff10;
  margin: 16px 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background:  rgb(from v-bind(primaryColor) r g b / 0.1);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.detail-header:hover {
  background:  rgb(from v-bind(primaryColor) r g b / 0.16);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: v-bind(primaryColor);
}

.icon {
  width: 20px;
  height: 20px;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
}

.collapse-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: rgb(from v-bind(primaryColor) r g b / 1);
  transition: transform 0.3s ease;
}

.collapse-button.collapsed {
  transform: rotate(-90deg);
}

.chevron {
  width: 16px;
  height: 16px;
}

.detail-content {
  overflow: auto;
  transition: max-height 0.3s ease, padding 0.3s ease;
  font-size: 85%;
}

.detail-content.collapsed {
  max-height: 0;
  padding: 0;
}

.content-inner {
  padding: 10px 20px;
  line-height: 1.6;
  color: #333;
}

.content-inner :last-child {
  margin-bottom: 0;
}

.content-inner p {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.content-inner p:last-child {
  margin-bottom: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .detail-header {
    padding: 14px 16px;
  }
  
  .content-inner {
    padding: 16px;
  }
  
  .title {
    font-size: 15px;
  }
  
  .content-inner p {
    font-size: 13px;
  }
}
</style>