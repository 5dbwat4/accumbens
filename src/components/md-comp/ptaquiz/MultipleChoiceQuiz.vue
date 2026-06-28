<script>
import { computed, h, ref } from "vue";
import {
  isFromInteractiveElement,
  LETTERS,
  normalizeChoiceIndexes,
  readQuizParts,
  renderQuizHeader,
  sameIndexSet,
} from "./shared";

export default {
  name: "PTAMultipleChoiceQuiz",
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
    const selected = ref([]);
    const submitted = ref(false);
    const explanationOpen = ref(false);
    const correctIndexes = computed(() => normalizeChoiceIndexes(props.correct));
    const result = computed(() => {
      if (!submitted.value || correctIndexes.value.length === 0) return null;
      return sameIndexSet(selected.value, correctIndexes.value);
    });

    function toggleChoice(index) {
      if (submitted.value) return;
      const next = new Set(selected.value);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      selected.value = Array.from(next).sort((a, b) => a - b);
    }

    function submit() {
      if (submitted.value || selected.value.length === 0) return;
      submitted.value = true;
      explanationOpen.value = !sameIndexSet(selected.value, correctIndexes.value);
    }

    function reset() {
      selected.value = [];
      submitted.value = false;
      explanationOpen.value = false;
    }

    function onChoiceKeydown(event, index) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleChoice(index);
    }

    function renderChoice(vnode, index) {
      const checked = selected.value.includes(index);
      const correct = correctIndexes.value.includes(index);
      const wrongSelection = submitted.value && checked && !correct;
      const shouldMarkCorrect = submitted.value && correct;
      const className = [
        "ptaquiz-choice",
        checked && "is-selected",
        submitted.value && "is-submitted",
        shouldMarkCorrect && "is-correct",
        wrongSelection && "is-wrong",
        submitted.value && !checked && !correct && "is-muted",
      ]
        .filter(Boolean)
        .join(" ");

      return h(
        "div",
        {
          key: index,
          class: className,
          role: "checkbox",
          "aria-checked": String(checked),
          tabindex: submitted.value ? -1 : 0,
          onClick: (event) => {
            if (isFromInteractiveElement(event)) return;
            toggleChoice(index);
          },
          onKeydown: (event) => onChoiceKeydown(event, index),
        },
        [
          h("span", { class: "ptaquiz-choice-marker", "aria-hidden": "true" }, [
            LETTERS[index] || String(index + 1),
          ]),
          h("div", { class: "ptaquiz-choice-content" }, [vnode]),
        ],
      );
    }

    return () => {
      const parts = readQuizParts(slots.default);

      return h("section", { class: "ptaquiz ptaquiz--multiple-choice" }, [
        renderQuizHeader("Multiple answer", props.title, props.meta),
        parts.question
          ? h("div", { class: "ptaquiz-question" }, [parts.question])
          : h("div", { class: "ptaquiz-warning" }, "Missing <Q> question block."),
        parts.choices.length > 0
          ? h("div", { class: "ptaquiz-choices", role: "group" }, parts.choices.map(renderChoice))
          : h("div", { class: "ptaquiz-warning" }, "Missing <C> choice blocks."),
        h("footer", { class: "ptaquiz-actions" }, [
          h(
            "button",
            {
              class: "ptaquiz-button ptaquiz-button--primary",
              type: "button",
              disabled: submitted.value || selected.value.length === 0,
              onClick: submit,
            },
            submitted.value ? "Submitted" : "Submit",
          ),
          submitted.value || selected.value.length > 0
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
          submitted.value && result.value !== null && parts.explanation
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
        submitted.value && explanationOpen.value && parts.explanation
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
