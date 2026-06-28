<script>
import { h, ref } from "vue";
import { readQuizParts, renderQuizHeader } from "./shared";

const LABELS = {
  programming: "Programming",
  "multiple-file": "Multiple file",
  "code-completion": "Code completion",
  subjective: "Subjective",
};

export default {
  name: "PTASolutionRevealQuiz",
  props: {
    title: {
      type: String,
      default: "",
    },
    meta: {
      type: Object,
      default: null,
    },
    kind: {
      type: String,
      default: "programming",
    },
  },
  setup(props, { slots }) {
    const answerOpen = ref(false);

    return () => {
      const parts = readQuizParts(slots.default);
      const label = LABELS[props.kind] || LABELS.programming;

      return h("section", { class: "ptaquiz ptaquiz--solution-reveal" }, [
        renderQuizHeader(label, props.title, props.meta),
        parts.question
          ? h("div", { class: "ptaquiz-question" }, [parts.question])
          : h("div", { class: "ptaquiz-warning" }, "Missing <Q> question block."),
        parts.answer
          ? h("footer", { class: "ptaquiz-actions" }, [
              h(
                "button",
                {
                  class: "ptaquiz-button",
                  type: "button",
                  onClick: () => {
                    answerOpen.value = !answerOpen.value;
                  },
                },
                answerOpen.value ? "Hide answer" : "Show answer",
              ),
            ])
          : h("div", { class: "ptaquiz-warning" }, "Missing <A> answer block."),
        answerOpen.value && parts.answer
          ? h("aside", { class: "ptaquiz-answer" }, [
              h("div", { class: "ptaquiz-answer-label" }, "Answer"),
              h("div", { class: "ptaquiz-answer-content" }, [parts.answer]),
            ])
          : null,
      ]);
    };
  },
};
</script>

<style src="./style.css"></style>
