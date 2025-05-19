import { defineAsyncComponent, defineComponent } from 'vue'
import {NP,NButton, NCode, NEquation, NTable, NTab, NTabs, NTabPane, NCard} from 'naive-ui'
// import CodeBlocks from '@/components/md-comp/CodeBlocks.vue';
import { pathJoin } from '../pathjoin';
// import DownloadCard from '@/components/md-comp/downloadcard.vue';
// import AccHeading from '@/components/md-comp/accHeading.vue';
// import ElementA from '@/components/md-comp/element-a-handler.vue';


// const 



export function resolveMdComponent (template: any,config: { route: {path:string}; }){
  return defineComponent({
      methods:{
          back(str: string){
              return decodeURIComponent(atob(str));
          },
          handleRelpath(src: string){
              console.log(config.route.path);
              return '/'+pathJoin('/docs/',config.route.path, src);
          }
      },
      components: {
        NP,  NButton, NCode, NEquation, 
        CodeBlocks:defineAsyncComponent(()=>import("@/components/md-comp/CodeBlocks.vue")), 
        NImage,NTable,
        NTab,NTabs,NTabPane,NCard,
        DownloadCard:defineAsyncComponent(()=>import("@/components/md-comp/downloadcard.vue")),
        AccHeading:defineAsyncComponent(()=>import("@/components/md-comp/accHeading.vue")),
        ElementA:defineAsyncComponent(()=>import("@/components/md-comp/element-a-handler.vue")),
      },
      // compiled: compile(markdownCompiled.value)
      template
    })
}