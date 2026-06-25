import {useStorage} from "@vueuse/core"
import { isMobile } from "@/utils/isMobile";

const state = useStorage(
  '5dbwat4-proj--accumbens--settings',
  { 
    fontStyle:"XLWK",
    cursorAnimV2:false ,
    showPrintNotif: false,
    keyboardShortcuts: {
      focusTrap: false,
      indexSwitchEnabled: false,
      backspaceEnabled: false,
    },
    hideHeaderWhenPrinting: false,
   },
  localStorage,
  { mergeDefaults: true } 
)

export default state