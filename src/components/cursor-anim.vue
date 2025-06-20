<template>
  <div class="cursor-dot-outline"></div>
  <div class="cursor-dot"></div>
</template>
<script setup>
import { onMounted } from "vue";
import { isMobile } from "@/utils/isMobile";
import state from "@/utils/storage";
onMounted(() => {
  var cursor = {
    delay: 8,
    _x: 0,
    _y: 0,
    endX: window.innerWidth / 2,
    endY: window.innerHeight / 2,
    cursorVisible: true,
    cursorEnlarged: false,
    $dot: document.querySelector(".cursor-dot"),
    $outline: document.querySelector(".cursor-dot-outline"),

    init: function () {
      // Set up element sizes
      this.dotSize = this.$dot.offsetWidth;
      this.outlineSize = this.$outline.offsetWidth;
      document.body.style.cursor = "none";

      this.setupEventListeners();
      this.animateDotOutline();
    },

    //     updateCursor: function(e) {
    //         var self = this;

    //         console.log(e)

    //         // Show the cursor
    //         self.cursorVisible = true;
    //         self.toggleCursorVisibility();

    //         // Position the dot
    //         self.endX = e.pageX;
    //         self.endY = e.pageY;
    //         self.$dot.style.top = self.endY + 'px';
    //         self.$dot.style.left = self.endX + 'px';
    //     },

    initAnchors: function () {
      var self_ = this;
      //   console.log(self_);
      // Anchor hovering
      document.querySelectorAll("*:not(.katex)").forEach(function (el) {
        // console.log("init", el);
        if (
          window.getComputedStyle(el).cursor === "pointer" ||
          el.tagName === "A" ||
          el.tagName === "BUTTON"
        ) {
          el.style.cursor = "none";
          el.addEventListener("mouseover", function () {
            // console.log(self_);

            self_.cursorEnlarged = true;
            self_.toggleCursorSize();
          });
          el.addEventListener("mouseout", function () {
            self_.cursorEnlarged = false;
            self_.toggleCursorSize();
          });
        }

        //   el.addEventListener("mouseover", function () {
        //       // console.log(self_);

        //     self_.cursorEnlarged = true;
        //     self_.toggleCursorSize();
        //   });
        //   el.addEventListener("mouseout", function () {
        //     self_.cursorEnlarged = false;
        //     self_.toggleCursorSize();
        //   });
      });
      // document.querySelectorAll("a,button,.clickAble").forEach(function (el) {
      //   // console.log("init", el);

      //   el.addEventListener("mouseover", function () {
      //       // console.log(self_);

      //     self_.cursorEnlarged = true;
      //     self_.toggleCursorSize();
      //   });
      //   el.addEventListener("mouseout", function () {
      //     self_.cursorEnlarged = false;
      //     self_.toggleCursorSize();
      //   });
      // });
    },

    setupEventListeners: function () {
      var self = this;

      this.initAnchors();

      // Click events
      document.addEventListener("mousedown", function () {
        self.cursorEnlarged = true;
        self.toggleCursorSize();
      });
      document.addEventListener("mouseup", function () {
        self.cursorEnlarged = false;
        self.toggleCursorSize();
      });

      let lastEventTriggered = new Date();
      let latencyDetectedCount = 0;

      document.addEventListener("mousemove", function (e) {
        // Show the cursor
        self.cursorVisible = true;
        self.toggleCursorVisibility();

        // Position the dot
        self.endX = e.clientX;
        self.endY = e.clientY;
        self.$dot.style.top = self.endY + "px";
        self.$dot.style.left = self.endX + "px";
      });

      // Hide/show cursor
      document.addEventListener("mouseenter", function (e) {
        self.cursorVisible = true;
        self.toggleCursorVisibility();
        self.$dot.style.opacity = 1;
        self.$outline.style.opacity = 1;
      });

      document.addEventListener("mouseleave", function (e) {
        self.cursorVisible = true;
        self.toggleCursorVisibility();
        self.$dot.style.opacity = 0;
        self.$outline.style.opacity = 0;
      });
    },

    animateDotOutline: function () {
      var self = this;

      self._x += (self.endX - self._x) / self.delay;
      self._y += (self.endY - self._y) / self.delay;
      self.$outline.style.top = self._y + "px";
      self.$outline.style.left = self._x + "px";

      requestAnimationFrame(this.animateDotOutline.bind(self));
    },

    toggleCursorSize: function () {
      var self = this;

      if (self.cursorEnlarged) {
        self.$dot.style.transform = "translate(-50%, -50%) scale(0.75)";
        self.$outline.style.transform = "translate(-50%, -50%) scale(1.5)";
      } else {
        self.$dot.style.transform = "translate(-50%, -50%) scale(1)";
        self.$outline.style.transform = "translate(-50%, -50%) scale(1)";
      }
    },

    toggleCursorVisibility: function () {
      var self = this;

      if (self.cursorVisible) {
        self.$dot.style.opacity = 1;
        self.$outline.style.opacity = 1;
      } else {
        self.$dot.style.opacity = 0;
        self.$outline.style.opacity = 0;
      }
    },
  };

  if (!isMobile() && state.value.cursorAnim) {
    cursor.init();
    // window.updateCursorAnim = () => {
    //   cursor.initAnchors();
    // };
    const observer = new MutationObserver(() => {
      cursor.initAnchors();
    });
    // 开始监听整个文档的变化
    observer.observe(document.body, { childList: true, subtree: true });
  }
});
</script>

<style scoped>
.cursor-dot,
.cursor-dot-outline {
  pointer-events: none;
  position: fixed;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  opacity: 0;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  z-index: 2025;
}

.cursor-dot {
  width: 8px;
  height: 8px;
  background-color: #949d87;
}

.cursor-dot-outline {
  width: 40px;
  height: 40px;
  background-color: rgba(163, 235, 173, 0.339);
}

@media print {
  .cursor-dot,
  .cursor-dot-outline {
    display: none;
  }
}
</style>

<style>
/* html,
html *,
body,
body * {
  cursor: none;
} */
</style>
