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
  },
  url: {
    type: String,
  }
});

const downloadCastFile = () => {
  if(props.cast){
  saveAs(new Blob([props.cast]), "data.cast");
  }else if(props.url){
    // If a URL is provided, we can fetch the file and then save it
    fetch(props.url)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, "data.cast");
      })
      .catch(error => {
        console.error("Error downloading the cast file:", error);
      });
  } else {
    console.error("Not enough args provided for Asciinema player.");
  }
  
};

onMounted(() => {
  // Initialize the Asciinema player
  // Prefer cast data first
  if(props.cast){
  AsciinemaPlayer.create({ data: props.cast }, asciinemaContainer.value);
  }else if(props.url){
    AsciinemaPlayer.create(props.url, asciinemaContainer.value);
  } else {
    console.error("Not enough args provided for Asciinema player.");
  }
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