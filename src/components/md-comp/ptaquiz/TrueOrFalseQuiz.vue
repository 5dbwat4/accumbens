<script>
import { computed, h, ref } from "vue";
import { normalizeBooleanAnswer, readQuizParts, renderQuizHeader } from "./shared";

export default {
  name: "PTATrueOrFalseQuiz",
  props: {
    correct: {
      type: Boolean,
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
    const correctAnswer = computed(() => normalizeBooleanAnswer(props.correct));
    const answered = computed(() => selected.value !== null);
    const result = computed(() => {
      if (!answered.value || correctAnswer.value === null) return null;
      return selected.value === correctAnswer.value;
    });

    function selectAnswer(value) {
      if (answered.value) return;
      selected.value = value;
      explanationOpen.value = correctAnswer.value !== null && value !== correctAnswer.value;
    }

    function reset() {
      selected.value = null;
      explanationOpen.value = false;
    }

    function onChoiceKeydown(event, value) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectAnswer(value);
    }

    function renderAnswer(value, label) {
      const checked = selected.value === value;
      const correct = correctAnswer.value === value;
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
          key: String(value),
          class: className,
          role: "radio",
          "aria-checked": String(checked),
          tabindex: answered.value ? -1 : 0,
          onClick: () => selectAnswer(value),
          onKeydown: (event) => onChoiceKeydown(event, value),
        },
        [
          h(
            "span",
            {
              class: "ptaquiz-choice-marker ptaquiz-choice-marker--single",
              "aria-hidden": "true",
            },
            value ? "T" : "F",
          ),
          h("div", { class: "ptaquiz-choice-content" }, label),
        ],
      );
    }

    return () => {
      const parts = readQuizParts(slots.default);

      return h("section", { class: "ptaquiz ptaquiz--true-or-false" }, [
        renderQuizHeader("True or false", props.title, props.meta),
        parts.question
          ? h("div", { class: "ptaquiz-question" }, [parts.question])
          : h("div", { class: "ptaquiz-warning" }, "Missing <Q> question block."),
        h("div", { class: "ptaquiz-choices ptaquiz-choices--inline", role: "radiogroup" }, [
          renderAnswer(true, "True"),
          renderAnswer(false, "False"),
        ]),
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
