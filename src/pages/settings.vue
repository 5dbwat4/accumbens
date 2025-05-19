<template>
    <n-h1 prefix="bar">Settings</n-h1>
<n-card title="Theme & Style" content-style="background:transparent">
<p>Of course we know that agreement exceeds configuration, however the themes below are 
all my favour.</p>
<n-form-item label="Font style">
<n-space>
<n-select v-model:value="state.fontStyle" :options="FONT_STYLE__options" style="width: 100%;"/>
<div style="width: 100%;">
<n-p>Preview:</n-p>
<n-text :style="{fontFamily: state.fontStyle}">The quick brown fox jumps over the lazy dog.</n-text>
</div>
</n-space>
</n-form-item>
</n-card>
</template>
<script setup>
import {useStorage} from "@vueuse/core"

const state = useStorage(
  '5dbwat4-proj--accumbens--settings',
  { fontStyle:"XLWK" },
  localStorage,
  { mergeDefaults: true } // <--
)

//-====== Font Style ==================================================


const FONT_STYLE__options=[
    {value:"XLWK",label:"霞鹜文楷"},
    {value:"sansserif",label:"普通的无衬线字体"},
    {value:"serif",label:"普通的衬线字体"},
]


</script>