<script>
import { computed, h, provide, reactive, ref } from "vue";
import {
  flattenSlotNodes,
  getQuizPart,
  normalizeFillAnswer,
  PTA_FILL_BLANK_KEY,
  renderQuizHeader,
} from "./shared";

function readFillBlankParts(slotFn) {
  const body = [];
  let explanation = null;
  const stray = [];

  for (const vnode of flattenSlotNodes(slotFn?.() || [])) {
    const part = getQuizPart(vnode);
    if (part === "explanation") {
      if (!explanation) explanation = vnode;
      else stray.push(vnode);
    } else {
      body.push(vnode);
    }
  }

  if (import.meta.env.DEV && stray.length > 0) {
    console.warn("[PTAQuiz] Ignored extra <Explanation> blocks.", stray);
  }

  return { body, explanation };
}

export default {
  name: "PTAFillInTheBlankQuiz",
  props: {
    title: {
      type: String,
      default: "",
    },
    meta: {
      type: Object,
      default: null,
    },
    variant: {
      type: String,
      default: "default",
    },
  },
  setup(props, { slots }) {
    const blanks = reactive(new Map());
    const submitted = ref(false);
    const peekEnabled = ref(false);
    const explanationOpen = ref(false);
    const resetNonce = ref(0);

    function registerBlank(id, expected, value) {
      blanks.set(id, { expected, value: value ?? "" });
    }

    function updateBlank(id, value) {
      const current = blanks.get(id);
      if (!current) return;
      blanks.set(id, { ...current, value });
    }

    function unregisterBlank(id) {
      blanks.delete(id);
    }

    const hasInput = computed(() =>
      Array.from(blanks.values()).some((blank) => String(blank.value || "").trim() !== ""),
    );
    const allCorrect = computed(() => {
      if (blanks.size === 0) return null;
      return Array.from(blanks.values()).every(
        (blank) =>
          normalizeFillAnswer(blank.value) === normalizeFillAnswer(blank.expected),
      );
    });

    function submit() {
      if (submitted.value || peekEnabled.value || blanks.size === 0) return;
      submitted.value = true;
      explanationOpen.value = allCorrect.value === false;
    }

    function reset() {
      submitted.value = false;
      explanationOpen.value = false;
      peekEnabled.value = false;
      resetNonce.value += 1;
      for (const [id, blank] of blanks.entries()) {
        blanks.set(id, { ...blank, value: "" });
      }
    }

    provide(PTA_FILL_BLANK_KEY, {
      variant: computed(() => props.variant),
      submitted,
      peekEnabled,
      resetNonce,
      registerBlank,
      updateBlank,
      unregisterBlank,
    });

    return () => {
      const parts = readFillBlankParts(slots.default);

      const isProgramming = props.variant === "programming";

      return h("section", {
        class: [
          "ptaquiz",
          "ptaquiz--fill-in-the-blank",
          isProgramming && "ptaquiz--fill-in-the-blank-programming",
        ]
          .filter(Boolean)
          .join(" "),
      }, [
        renderQuizHeader(
          isProgramming ? "Programming fill in the blank" : "Fill in the blank",
          props.title,
          props.meta,
        ),
        parts.body.length > 0
          ? h(
              "div",
              {
                class: [
                  "ptaquiz-question",
                  isProgramming && "ptaquiz-question--programming",
                ]
                  .filter(Boolean)
                  .join(" "),
              },
              parts.body,
            )
          : h("div", { class: "ptaquiz-warning" }, "Missing fill-in-the-blank content."),
        h("footer", { class: "ptaquiz-actions" }, [
          h(
            "button",
            {
              class: [
                "ptaquiz-button",
                peekEnabled.value && "ptaquiz-button--active",
              ]
                .filter(Boolean)
                .join(" "),
              type: "button",
              disabled: submitted.value,
              onClick: () => {
                peekEnabled.value = !peekEnabled.value;
                submitted.value = false;
                explanationOpen.value = false;
              },
            },
            peekEnabled.value ? "Answer peek: On" : "Answer peek: Off",
          ),
          !peekEnabled.value
            ? h(
                "button",
                {
                  class: "ptaquiz-button ptaquiz-button--primary",
                  type: "button",
                  disabled: submitted.value || blanks.size === 0,
                  onClick: submit,
                },
                submitted.value ? "Submitted" : "Submit",
              )
            : null,
          submitted.value || hasInput.value
            ? h(
                "button",
                {
                  class: "ptaquiz-button",
                  type: "button",
                  onClick: reset,
                },
                "Reset",
              )
            : null,
          ((peekEnabled.value && parts.explanation) ||
            (submitted.value && allCorrect.value === false && parts.explanation))
            ? h(
                "button",
                {
                  class: "ptaquiz-button",
                  type: "button",
                  onClick: () => {
                    explanationOpen.value = !explanationOpen.value;
                  },
                },
                explanationOpen.value ? "Hide explanation" : "Show explanation",
              )
            : null,
        ]),
        ((peekEnabled.value && explanationOpen.value) ||
          (submitted.value && allCorrect.value === false && explanationOpen.value)) &&
        parts.explanation
          ? h("aside", { class: "ptaquiz-explanation" }, [
              h("div", { class: "ptaquiz-explanation-label" }, "Explanation"),
              h("div", { class: "ptaquiz-explanation-content" }, [parts.explanation]),
            ])
          : null,
      ]);
    };
  },
};
</script>

<style src="./style.css"></style>
