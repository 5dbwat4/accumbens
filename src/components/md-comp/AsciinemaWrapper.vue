<template>
  <div class="asciinema-wrapper">
    <div ref="asciinemaContainer"></div>
    <span class="credit">
      Recorded and played using
      <a href="https://asciinema.org/" target="_blank" rel="noopener noreferrer">
        <img src="@/assets/asciinema-logo.svg" style="width:1em;height:1em;"/>
        Asciinema
      </a>,
      <a @click="downloadCastFile">Download the raw cast file</a>
    </span>
  </div>
</template>
<script setup>
import { onMounted, useTemplateRef } from "vue";
import * as AsciinemaPlayer from "asciinema-player";
import "asciinema-player/dist/bundle/asciinema-player.css";
import { saveAs } from "file-saver";
// import AsciinemaLogo from "@/assets/asciinema-logo.svg";

const asciinemaContainer = useTemplateRef("asciinemaContainer");
const props = defineProps({
  cast: {
    type: String,
    required: true,
  },
});

const downloadCastFile = () => {
  saveAs(new Blob([props.cast]), "data.cast");
};

onMounted(() => {
  // Initialize the Asciinema player
  AsciinemaPlayer.create({ data: props.cast }, asciinemaContainer.value);
});
</script>
<style>
.asciinema-wrapper {
    padding: 0.em;
    border-radius: 0.1em;
    align-items: center;
    text-align: center;
    border: 1px solid #ccc;
    margin: 1em 0;
  .credit {
    margin-top: 1em;
    font-size: 0.6em;
    width: fit-content;
    color: #666;
    a {
      color: #007bff;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }

}
</style>