<template>
  <n-message-provider>
    <n-notification-provider>
      <n-config-provider>
      <!-- <n-config-provider :hljs="hljs"> -->
      <!-- <n-config-provider :katex="katex" :hljs="hljs"> -->
        <header class="header">
          <div class="header-block">
            <div class="header-left">
              <span class="notebook-name" @click="$router.push('/')"
                >5dbwat4's Notebook</span
              >
            </div>
            <div class="header-right">
              <!-- <n-button quaternary circle>
                <template #icon>
                  <n-icon :component="IconSearchTwotone"></n-icon>
                </template>
              </n-button> -->
              <n-button quaternary circle @click="$router.push('/contents')">
                <template #icon>
                  <n-icon :component="IconList3Twotone"></n-icon>
                </template>
              </n-button>
              <SwitchLightDark />
              
              <n-button quaternary circle @click="$router.push('/settings')">
                <template #icon>
                  <n-icon :component="SettingsOutline"></n-icon>
                </template>
              </n-button>
              <n-divider vertical></n-divider>
              <!-- <n-button quaternary circle>
                <template #icon>
                  <n-icon :component="IconGithubLoop"></n-icon>
                </template>
              </n-button> -->
              <github-nav />
            </div>
          </div>
        </header>
         
        <div class="spacer"></div>
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <main class="main" :key="route.path">
              <div class="global-padding">
                <div class="entry-container">
                  <Suspense>
                    <component :is="Component" />
                  </Suspense>
                </div>
              </div>
            </main>
          </transition>
          <footer class="footer">
            <div class="footer-block">
              <div class="footer-columned">
                <div style="flex-basis: 65%">
                  <p class="small-font">
                    Copyright © 2024-{{ thisYear }} 5dbwat4
                  </p>
                  <p class="small-font">Powered by Accumbens</p>
                  <p class="small-font">
                    Unless otherwise specified, all articles are licensed under
                    CC-BY-NC-SA.
                  </p>
                </div>
                <div style="flex-basis: 35%">
                  <p class="small-font">About me</p>
                  <p
                    class="small-font"
                    @click="$router.push('/about-accumbens')"
                  >
                    About Accumbens
                  </p>
                  <p class="small-font">Privacy, Terms and Conditions</p>
                </div>
              </div>
            </div>
          </footer>
        </router-view>
        <cursor-anim />
        <n-back-top />
      </n-config-provider>
    </n-notification-provider>
  </n-message-provider>
</template>

<script setup>
import { onMounted, ref } from "vue";
// import {
//   IconSearchTwotone,
//   IconList3Twotone,
//   IconGithubLoop,
// } from "@iconify-prerendered/vue-line-md";
import IconGithubLoop from '~iconify/line-md/github-twotone-loop';
import IconSearchTwotone from '~iconify/line-md/search-twotone';
import IconList3Twotone from '~iconify/line-md/list-3-twotone';
import { SettingsOutline } from "@vicons/ionicons5";
// import katex from "katex";
import "katex/dist/katex.css";
import hljs from "highlight.js/lib/core";
import SwitchLightDark from "./components/switch-light-dark.vue";
import githubNav from "./components/nav-github-ck.vue";
const isHeaderActivated = ref(false);

const thisYear = new Date().getFullYear();

// Control header nav display
onMounted(() => {
  let lastScroll = 0;
  const navbar = document.querySelector("header");

  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;

    if (currentScroll <= 0) {
      navbar.classList.remove("nav--hide");
      return;
    }

    if (currentScroll > lastScroll) {
      navbar.classList.add("nav--hide");
    } else {
      navbar.classList.remove("nav--hide");
    }

    lastScroll = currentScroll;
  });
});
</script>

<style>
.header-block {
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  position: relative;
  box-sizing: border-box;
  padding-right: min(6.5rem, 8vw);
  padding-left: min(6.5rem, 8vw);
  /* background-color: #efefef !important; */
  padding-top: 20px;
  padding-bottom: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;


  box-sizing: border-box;
  gap: 1.2rem;
  margin-left: auto !important;
  margin-right: auto !important;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  display: flex;
  margin-block-start: 0;
  margin-block-end: 0;
  max-width: 1280px;
}
.nav--hide {
  /* opacity: 0;; */
  transform: translateY(-100%);
  /* transition: opacity 0.3s; */
}
.footer-block * {
  pointer-events: all;
}
.header {
  font-size: 1.05rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  margin-block-end: 0;
  margin-block-start: 0;
  color: #afafaf;
  transition: color 0.3s, transform 0.3s ease-in-out;
  position: fixed;
  /* opacity: 1; */
  /* backdrop-filter: blur(20px); */
  top: 0;
  width: 100%;
  z-index: 1;
  /* pointer-events: none; */
}
.header::before {
  content: "";
  height: 150%;
  mask-image: linear-gradient(to bottom, white 20%, transparent);
  backdrop-filter: blur(20px);
  display: inline-block;
  width: 100%;
  position: absolute;
  pointer-events: none;
  top: 0;
}
.header:hover {
  color: #000;
}
.header-left {
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  box-sizing: border-box;
  flex-wrap: wrap;
  align-items: center;
  gap: min(1.5rem, 2vw);
  display: flex;
  margin: 0;
}
.header-right {
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  box-sizing: border-box;
  flex-wrap: wrap;
  align-items: center;
  gap: min(0.5rem, 0.75vw);
  display: flex;
  margin: 0;
}

.main {
  flex: 1;
  font-size: 1.05rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  margin-block-start: 1.2rem;
  margin-block-end: 0;
  box-sizing: border-box;

  scroll-behavior: smooth;
}

.footer {
  color: var(--wp--preset--color--contrast);
  font-family: var(--wp--preset--font-family--body);
  font-size: 1.05rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  margin-block-start: 1.2rem;
  margin-block-end: 0;
}

.global-padding {
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  position: relative;
  box-sizing: border-box;
  padding-right: min(6.5rem, 8vw);
  padding-left: min(6.5rem, 8vw);
  margin-block-end: 0;
  margin-block-start: 0;
}
.entry-container > * {
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
}

/* .entry-container {
    max-width: 680px;
    overflow-x: visible;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
} */
/* .entry-container > * {

} */

.notebook-name {
  font-family: Cardo;
  user-select: none;
  cursor: pointer;
}

.spacer {
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  clear: both;
  margin-block-end: 0;
  margin-left: auto !important;
  margin-right: auto !important;
  margin-block-start: 0;
  min-height: calc(min(3.5rem, 3vw) + 2rem);
}

.footer-block {
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  position: relative;
  box-sizing: border-box;
  padding-right: min(6.5rem, 8vw);
  padding-left: min(6.5rem, 8vw);
  padding-top: min(6.5rem, 8vw);
  padding-bottom: min(1.75rem, 2vw);
}

.footer-columned {
  font-style: normal;
  font-weight: 400;
  line-height: 1.55;
  margin-bottom: 1.75em;
  align-items: normal !important;
  box-sizing: border-box;
  flex-wrap: nowrap !important;
  margin-block-end: 0;
  gap: 1.2rem;
  margin-left: auto !important;
  margin-right: auto !important;
  display: flex;
  margin-block-start: 0;
  max-width: 1280px;
}
.footer-columned > * {
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
  margin: 0;
  flex-grow: 0;
}
.small-font {
  font-size: 0.7em;
  color: #000000;
  margin: 0.4em;
}


@media print{
  .header{
    display: block;
    position: inherit;
  }
  .header-right{
    display: none;
  }
  .spacer{
    display: none;
  }
  .footer{
    display: none;
  }
  .main{
    margin-block-start: 0;
  }
  .entry-container{
    max-width: 100%;
  }
}
</style>
