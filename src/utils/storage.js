import {useStorage} from "@vueuse/core"
import { isMobile } from "@/utils/isMobile";

const state = useStorage(
  '5dbwat4-proj--accumbens--settings',
  { 
    fontStyle:"XLWK",
    cursorAnim:!isMobile() , // 
   },
  localStorage,
  { mergeDefaults: true } 
)

export default state