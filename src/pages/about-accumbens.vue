<template>
   <n-h1 prefix="bar">
    <span class="heading-overwrite">About Accumbens</span>
  </n-h1>
  <n-p>Accumbens is the framework behind my notebook.</n-p>

  <div class="showcard">
    <span class="bold">Accumbens</span> <span class="italic">n.</span>
    <span class="trans">伏隔核</span>
  </div>

  <n-p>
    As a <span class="italic">notebook framework</span>, its behavior is
    designed to meet the needs of readers (who frequently access the notebook,
    and the same note will be accessed multiple times). It:
  </n-p>

  <n-ul>
    <n-li
      >Loads as a PWA, using IndexedDB and Service Worker to cache resources
      that belong to the framework—they will only be loaded once;</n-li
    >
    <n-li>Automatically caches note pages and checks for updates;</n-li>
    <n-li>Also provides a good navigation experience between pages.</n-li>
  </n-ul>

  <n-p>
    By sacrificing the initial first-page access experience of visitors,
    accumbens can achieve an almost perfect subsequent access experience.
  </n-p>

  <n-divider></n-divider>

  <n-p>
    <a class="link-style">Click here</a> to view the list of all 3rd-party libraries used in the framework.
  </n-p>
</template>
<script setup></script>
<style scoped>
.showcard {
  font-family: Georgia, "Times New Roman", Times, serif;
  background-color: #f0f0f0;
  padding: 1em;
  border-radius: 0.5em;
  font-size: 1.5em;
  text-align: center;
  border: 1px dotted #a0a0a0;
  vertical-align: center;
  /* width: 101%; */

  .trans {
    font-size: 0.8em;
    color: #000000;
  }
}
.bold {
  font-weight: bold;
}
.italic {
  font-family: Georgia, "Times New Roman", Times, serif;
  font-style: italic;
}
.heading-overwrite {
  font-family: Cardo;
  color: #000000;
  font-weight: bold;
}
.link-style {
  color: #0969da;
  text-decoration: underline;
  text-underline-offset: .2rem;
    cursor: pointer;
    
}
</style>
