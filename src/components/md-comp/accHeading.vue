<template>
  <h1 v-if="$props.level == '1'">
    <a :href="'#' + $attrs.id" class="header-anchor">#</a><slot></slot>
  </h1>
  <h2 v-else-if="$props.level == '2'">
    <a :href="'#' + $attrs.id" class="header-anchor">#</a><slot></slot>
  </h2>
  <h3 v-else-if="$props.level == '3'">
    <a :href="'#' + $attrs.id" class="header-anchor">#</a><slot></slot>
  </h3>
  <h4 v-else-if="$props.level == '4'">
    <a :href="'#' + $attrs.id" class="header-anchor">#</a><slot></slot>
  </h4>
  <h5 v-else-if="$props.level == '5'">
    <a :href="'#' + $attrs.id" class="header-anchor">#</a><slot></slot>
  </h5>
  <h6 v-else-if="$props.level == '6'">
    <a :href="'#' + $attrs.id" class="header-anchor">#</a><slot></slot>
  </h6>
</template>
<script setup>
defineProps({
  level: String,
});

</script>
<style>
  .markdown-body .acc-a{
    color: var(--fgColor-anchor-default);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-style: dashed;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .markdown-body .acc-a:hover {
    color: var(--fgColor-anchor-onhover);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  </style>
