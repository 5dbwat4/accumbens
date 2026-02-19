<template>
  <div @mouseenter="onHover = true" @mouseleave="onHover = false">
    <n-config-provider :hljs="hljs">
    <n-code
      :code="codeData"
      :language="$props.language"
      :show-line-numbers="!$props.breakLines"
      :word-wrap="$props.breakLines"
      class="code-block"
    />
    </n-config-provider>
    <div
      style="position: absolute; top: 0; right: 0; height: 100%"
      v-if="onHover"
    >
      <n-popover trigger="hover">
        <template #trigger>
          <n-button
            style="position: sticky; top: 0; right: 0"
            circle
            @click="copyToClipboard"
          >
            <n-icon :component="IconClipboardPlusTwotone" />
          </n-button>
        </template>
        <span>{{ copyToolTipX ? "Copy to clipboard" : "Copied!" }}</span>
      </n-popover>
    </div>
  </div>
</template>
<script setup>
import { IconClipboardPlusTwotone } from "@iconify-prerendered/vue-line-md";
import { ref, useAttrs, useSlots } from "vue";
import copy from "copy-to-clipboard";
import hljs from "highlight.js/lib/core"
import injectLanguage from "@/utils/hljs-ondemand";
// const containerRef = ref(null);
const copyToolTipX = ref(true);
const onHover = ref(false);

const prop = defineProps({
  code: String,
  language: String,
  breakLines: {
    type: Boolean,
    default: false,
  },
});
await injectLanguage(hljs,prop.language)

const codeData = ref(useSlots().default()?.[0].children)


// console.log( useSlots().default()?.[0].children)

const copyToClipboard = () => {
  copy(prop.code, {
    message: "Press #{key} to copy",
  });
  copyToolTipX.value = false;
  setTimeout(() => {
    copyToolTipX.value = true;
  }, 1500);
};
</script>


<style  scoped>


.code-block {
  position: relative;
overflow-x: auto;

 background-color: #0000;

}

.code-block::-webkit-scrollbar {
height: 5px;
background-color: #0000;
transition: background-color 0.3s ease;
}

.code-block::-webkit-scrollbar-track {
background-color: #0000;
transition: background-color 0.3s ease;
}

.code-block::-webkit-scrollbar-thumb {
background:#0000;
border-radius: 2px;
transition: background-color 0.3s ease;
}

.code-block::-webkit-scrollbar-thumb:hover {
background-color: #0000;
}


.code-block:hover::-webkit-scrollbar{
 
height: 5px;
}

/* Track */
.code-block:hover::-webkit-scrollbar-track {
background-color: #f1f1f1;
}

/* Handle */
.code-block:hover::-webkit-scrollbar-thumb {
background-color: #bbb;
border-radius: 2px;
}

/* Handle on hover */
.code-block:hover::-webkit-scrollbar-thumb:hover {
background-color: #555;
}
</style>