<template>
    <n-p>Subcategories:</n-p>
    <n-space vertical>
        <n-button v-for="cat in $props.subcategories" :key="cat.path[0]" @click="$router.push(cat.path[0])">
            {{ cat.name }}
        </n-button>
    </n-space>
    <n-p>Entries:</n-p>
    <n-space vertical>
        <n-button v-for="entry in $props.entries" :key="entry.unikey" @click="$router.push($route.path+'/'+entry.path)">
            {{ entry.title||entry.path }}
        </n-button>
    </n-space>
</template>
<script setup>

const props = defineProps({
    entries: Array,
    subcategories: Array,
})

console.log("Component dirList loaded, props: ", props);

</script>