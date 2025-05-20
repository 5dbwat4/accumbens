<template>
    <div class="container">
<img src="@/assets/cover.png" style="max-width: 480px;margin-bottom: 50px;margin-top: 30px;"/>
<n-space vertical>
    <n-checkbox :checked="true" v-for = "item in finished" :key="item">
        {{ item }}
    </n-checkbox>
    <n-checkbox :checked="false" v-for = "item in pending" :key="item">
        {{ item }}
    </n-checkbox></n-space>
</div>
</template>
<script setup>
const finished = [
    "Compiling MD & MDX all done right, as well as rendering them",
    "Indexing those pages ",
    "Dynamic loading of all components and pages",
    "Specially, dynamic loading for highlight.js"
]

const pending = [
    "Integrate Algolia for search",
    "Complete the dark mode",
    "A good 404 page",
]
</script>

<style>
.container{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
}
</style>