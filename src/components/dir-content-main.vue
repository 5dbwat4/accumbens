<template>
    <div style="align-items: flex-start;display: flex;flex-direction: column;width:50%;min-width: 320px;margin: auto;padding-top: 20px;">
    <span style="font-family: Cardo;">Subcategories</span>
 <n-button-group vertical size="large" style="width:100%">
      <n-button style="justify-content: flex-start ;" v-for="cat in $props.subcategories?.filter(v=>v.show)" :key="cat.path[0]" @click="$router.push('/'+cat.path[0]+'/')">
        <template #icon>
          <n-icon color="rgb(194,195,184)"><IconTextBoxMultipleTwotone/></n-icon>
        </template>
       {{ cat.name }}
      </n-button>
      <n-button disabled v-if="!($props?.subcategories) || $props?.subcategories?.length==0">
        --None--
      </n-button>
    </n-button-group>

    <n-divider/>
    <span style="font-family: Cardo;">Entries</span>
     <n-button-group vertical size="large" style="width:50%;min-width: 320px;margin: auto;">
      <n-button style="justify-content: flex-start ;" v-for="entry in $props.entries?.filter(v=>!v.pathonly)" :key="entry.unikey" @click="$router.push($route.path+'/'+entry.path)" >
        <template #icon>
          <n-icon color="rgb(194,195,184)"><IconFileDocumentFilled/></n-icon>
        </template>
       {{ entry.title||'(no title) /'+entry.path }}
      </n-button>
      <n-button disabled v-if="!($props?.entries) || $props?.entries?.length==0">
        --None--
      </n-button>
    </n-button-group>
    
    </div>
</template>
<script setup>

import {IconTextBoxMultipleTwotone,IconFileDocumentFilled}from "@iconify-prerendered/vue-line-md"

const props = defineProps({
    entries: Array,
    subcategories: Array,
})

console.log("Component dirList loaded, props: ", props);

</script>

<style scoped>
.list-container{
    width: 50%;
    min-width: 320px;
        display: flex
;
    flex-direction: column;
    align-content: flex-start;
    align-items: flex-start;
    flex-wrap: nowrap;
    margin: auto;
    
    border: 2px solid rgba(123, 123, 123, 0.757);
}

.list-item{
    display: table-row;
    width: 100%;
    border-collapse: collapse;
    p{
            display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0;
    gap:0.2rem;
    padding:0.4rem;
    
        margin:0
    }
}
</style>