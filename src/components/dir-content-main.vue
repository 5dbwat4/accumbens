<template>
    <div style="align-items: flex-start;display: flex;flex-direction: column;width:50%;min-width: 320px;margin: auto;padding-top: 50px;">
    <span style="font-family: Cardo;">Subcategories & Entries</span>
 <n-button-group vertical size="large" style="width:100%">
      <n-button style="justify-content: flex-start ;" v-for="cat in finalShownThings.filter(v => v.type === 'subcategory')" :key="cat.path[0]" @click="$router.push('/'+cat.path[0]+'/')">
        <template #icon>
          <n-icon color="rgb(194,195,184)"><IconTextBoxMultipleTwotone/></n-icon>
        </template>
       {{ cat.name }}
      </n-button>
      <n-button style="justify-content: flex-start ;" v-for="entry in finalShownThings.filter(v => v.type === 'entry')" :key="entry.unikey" @click="$router.push($route.path+'/'+entry.path)" >
        <template #icon>
          <n-icon color="rgb(194,195,184)"><IconFileDocumentFilled/></n-icon>
        </template>
       {{ entry.title||'(no title) /'+entry.path }}
      </n-button>
      <n-button disabled v-if="finalShownThings.length===0">
        -- Nothing --
      </n-button>
    </n-button-group>
    
    </div>
</template>
<script setup>
import {computed} from "vue"
import {IconTextBoxMultipleTwotone,IconFileDocumentFilled}from "@iconify-prerendered/vue-line-md"

const props = defineProps({
    entries: Array,
    subcategories: Array,
})

console.log("Component dirList loaded, props: ", props);

const finalShownThings = computed(() => {
    return [...(props.subcategories?.filter(v=>v.show)||[]).map(v=>({...v, type:'subcategory'})), ...(props.entries?.filter(v=>!v.pathonly)||[]).map(v=>({...v, type:'entry'}))];
});

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