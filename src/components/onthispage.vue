<template>
  <div id="table-of-contents" class="table-of-contents" v-if="toc.length>5">
    <p class="toc-hint">On this page:</p>
    <ul >
      <li v-for="item in toc" :key="item.href" :style="{'padding-top': item.depth==1?'0.2em':'0'}">
        <span class="toc-numbering">{{ item.numbering.join('.') }}</span>
        <a :href="item.href" :style="{'padding-left': 1.5+'em'}">{{ item.value }}</a>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const toc = ref([])

const props = defineProps({
  PostRenderHook: {
    type: Function,
    default: () => {}
  }
})  

function extractHeadingText(headingEl) {
  const rawText = headingEl.textContent || ''
  return rawText.trim().replace(/^#+\s*/, '')
}

props.PostRenderHook(() => {
  const markdownBody = document.querySelector('.markdown-body')
  if (!markdownBody) {
    toc.value = []
    return
  }

  const selector = 'h1, h2, h3, h4, h5, h6'
  const headings = Array.from(markdownBody.querySelectorAll(selector))
  const h1Count = headings.filter((heading) => heading.tagName === 'H1').length
  const promoteH2AsTopLevel = h1Count === 1

  const tocList = []
  let numbering = []

  headings.forEach((heading) => {
    if (!heading.id) return

    const originalDepth = Number.parseInt(heading.tagName.slice(1), 10)
    if (!Number.isFinite(originalDepth)) return

    if (promoteH2AsTopLevel && originalDepth === 1) return

    const depth = promoteH2AsTopLevel ? originalDepth - 1 : originalDepth

    if (depth > numbering.length) {
      numbering.push(1)
    } else if (depth < numbering.length) {
      numbering = numbering.slice(0, depth)
      numbering[depth - 1] += 1
    } else {
      numbering[depth - 1] += 1
    }

    tocList.push({
      value: extractHeadingText(heading),
      href: `#${heading.id}`,
      depth,
      numbering: [...numbering]
    })
  })

  toc.value = tocList
})


</script>


<style>
.table-of-contents{
    background-color: #e5e5e5;

    padding-left: 1.5em;
    padding-right: 1.5em;
    padding-top: .5em;
    padding-bottom: 0.5em;
    border-radius: .3em;
    font-family: Cardo;
        margin-bottom: 16px;
}

.table-of-contents .toc-hint{
    margin-top: 0;
    font-weight: bold;
    width: 95%;
    /* min-height: fit-content; */
    display: block;
    border-bottom: 1px dotted #b0b0b0;
    padding-bottom: 0.5em;
    margin-bottom: 0.5em;
    user-select: none;
}

.table-of-contents ul{
    display: flex;
    flex-direction: column;
    list-style-type: none; 
    padding-left: 0;
     /* margin-left: 0.5em; */
}



.table-of-contents a{
    display: table-cell;
    color: #333;
    text-decoration: none;
    /* transition: cubic-bezier(0.075, 0.82, 0.165, 1) 0.3s; */
    transition-property: color;
    transition-duration: 0.3s;
    transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
    flex-grow: 1;
}

.table-of-contents li{
    display: flex;
    flex-direction: row;
    margin-bottom: 0.1em;
}

/* .table-of-contents a::before{
    color: #333;
    text-decoration: none;
    transition-property: color;
    transition-duration: 0.3s;
    transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
} */

.table-of-contents a:hover{
    color: #007bff;
    text-decoration-line: underline;
    text-decoration-style: dashed;
    text-decoration-color: #007bff;
}

.table-of-contents {
  max-height: 100vh;
  overflow-y: auto;
}

@media print {
  .table-of-contents {
  max-height: unset;
}
}
</style>