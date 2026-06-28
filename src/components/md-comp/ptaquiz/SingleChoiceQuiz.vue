<script>
import { computed, h, ref } from "vue";
import {
  isFromInteractiveElement,
  LETTERS,
  normalizeChoiceIndexes,
  readQuizParts,
  renderQuizHeader,
} from "./shared";

export default {
  name: "PTASingleChoiceQuiz",
  props: {
    correct: {
      type: [Number, Array],
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    meta: {
      type: Object,
      default: null,
    },
  },
  setup(props, { slots }) {
    const selected = ref(null);
    const explanationOpen = ref(false);
    const correctIndex = computed(() => normalizeChoiceIndexes(props.correct)[0] ?? null);
    const answered = computed(() => selected.value !== null);
    const result = computed(() => {
      if (!answered.value || correctIndex.value === null) return null;
      return selected.value === correctIndex.value;
    });

    function selectChoice(index) {
      if (answered.value) return;
      selected.value = index;
      explanationOpen.value = correctIndex.value !== null && index !== correctIndex.value;
    }

    function reset() {
      selected.value = null;
      explanationOpen.value = false;
    }

    function onChoiceKeydown(event, index) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectChoice(index);
    }

    function renderChoice(vnode, index) {
      const checked = selected.value === index;
      const correct = correctIndex.value === index;
      const wrongSelection = answered.value && checked && !correct;
      const shouldMarkCorrect = answered.value && correct;
      const className = [
        "ptaquiz-choice",
        checked && "is-selected",
        answered.value && "is-submitted",
        shouldMarkCorrect && "is-correct",
        wrongSelection && "is-wrong",
        answered.value && !checked && !correct && "is-muted",
      ]
        .filter(Boolean)
        .join(" ");

      return h(
        "div",
        {
          key: index,
          class: className,
          role: "radio",
          "aria-checked": String(checked),
          tabindex: answered.value ? -1 : 0,
          onClick: (event) => {
            if (isFromInteractiveElement(event)) return;
            selectChoice(index);
          },
          onKeydown: (event) => onChoiceKeydown(event, index),
        },
        [
          h(
            "span",
            {
              class: "ptaquiz-choice-marker ptaquiz-choice-marker--single",
              "aria-hidden": "true",
            },
            LETTERS[index] || String(index + 1),
          ),
          h("div", { class: "ptaquiz-choice-content" }, [vnode]),
        ],
      );
    }

    return () => {
      const parts = readQuizParts(slots.default);

      return h("section", { class: "ptaquiz ptaquiz--single-choice" }, [
        renderQuizHeader("Multiple choice", props.title, props.meta),
        parts.question
          ? h("div", { class: "ptaquiz-question" }, [parts.question])
          : h("div", { class: "ptaquiz-warning" }, "Missing <Q> question block."),
        parts.choices.length > 0
          ? h(
              "div",
              {
                class: "ptaquiz-choices",
                role: "radiogroup",
              },
              parts.choices.map(renderChoice),
            )
          : h("div", { class: "ptaquiz-warning" }, "Missing <C> choice blocks."),
        answered.value
          ? h("footer", { class: "ptaquiz-actions" }, [
              result.value !== null && parts.explanation
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
              h(
                "button",
                {
                  class: "ptaquiz-button",
                  type: "button",
                  onClick: reset,
                },
                "Reset",
              ),
            ])
          : null,
        answered.value && explanationOpen.value && parts.explanation
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
