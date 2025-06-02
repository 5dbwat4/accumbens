<template>
    <LetterEffects style="font-size:0.8rem;margin-bottom:48px">

<strong>ATTENTION TIME TRAVELER!</strong>
<p>You've stumbled into the Print version of this notebook page - basically the mummified tomb of the original content.</p>
<p>▶ Videos here are practicing vow of silence 🧘</p>
<p>▶ GIFs got frozen in 1995 ❄️</p>
<p>▶ Some links are napping 💤</p>
<p>▶ Also, pages are cut like beef jerky 🥩</p>
<p>But don't worry, the real deal is just a click away! 🖱️</p>
<p>Click <a :href="url">{{url}}</a> to teleport to the live version of this page.</p>
<div style="text-align: center; margin: 20px 0;">
<img :src="qrcode" style="width:128px;height: 128px;display: block;margin:0 auto;"/>
</div>
    </LetterEffects>
</template>
<script setup>
import { onMounted, ref } from "vue";
import QRCode from "qrcode";
import LetterEffects from "./md-comp/letter-effects.vue";
const url = window.location.href;
const qrcode = ref("");


  QRCode.toString(url, { width: 512, margin: 1, color: { dark: "#000000", light: "#ffffff00" },
type: "svg" })
    .then((svg) => {
      const svgBlob = new Blob([svg], { type: "image/svg+xml" });
      const dataUrl = URL.createObjectURL(svgBlob);
      // return dataUrl;
      qrcode.value = dataUrl;
    })

</script>