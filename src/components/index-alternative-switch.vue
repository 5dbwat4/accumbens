<template>
    <div>
    <n-button text @click="$router.push($route.path.endsWith('/') ? $route.path.slice(0, -1) : $route.path + '/')">

<template #icon>

    <n-icon :component="flip"></n-icon>
</template>
{{ 
    $route.path.endsWith("/")? "View all entries in this category.":
                               "View the index file."
}}
    </n-button></div>
</template>
<script setup>
import flip from "@/assets/fluent~card-ui-portrait-flip-16-regular.vue"
</script>