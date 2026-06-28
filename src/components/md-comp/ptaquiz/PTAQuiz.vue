<script>
import { h } from "vue";
import FillInTheBlankQuiz from "./FillInTheBlankQuiz.vue";
import MultipleChoiceQuiz from "./MultipleChoiceQuiz.vue";
import SingleChoiceQuiz from "./SingleChoiceQuiz.vue";
import SolutionRevealQuiz from "./SolutionRevealQuiz.vue";
import TrueOrFalseQuiz from "./TrueOrFalseQuiz.vue";

const CATEGORY_ATTRS = [
  "true-or-false",
  "multiple-choice",
  "fill-in-the-blank",
  "fill-in-the-blank-for-programming",
  "multiple-answer",
  "multiple-file",
  "programming",
  "subjective",
  "code-completion",
];

function hasCategoryAttr(attrs, name) {
  if (!Object.prototype.hasOwnProperty.call(attrs, name)) return false;
  const value = attrs[name];
  return value !== false && value !== null && value !== undefined && value !== "false";
}

function readCategory(attrs) {
  return CATEGORY_ATTRS.find((name) => hasCategoryAttr(attrs, name)) || "";
}

export default {
  name: "PTAQuiz",
  inheritAttrs: false,
  props: {
    correct: {
      type: [Number, Array, Boolean],
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
  setup(props, { slots, attrs }) {
    return () => {
      const category = readCategory(attrs);
      const commonProps = {
        correct: props.correct,
        title: props.title,
        meta: props.meta,
      };

      if (category === "true-or-false") {
        return h(TrueOrFalseQuiz, commonProps, slots);
      }

      if (category === "multiple-choice") {
        return h(SingleChoiceQuiz, commonProps, slots);
      }

      if (category === "multiple-answer") {
        return h(MultipleChoiceQuiz, commonProps, slots);
      }

      if (category === "fill-in-the-blank") {
        return h(FillInTheBlankQuiz, { ...commonProps, variant: "default" }, slots);
      }

      if (category === "fill-in-the-blank-for-programming") {
        return h(FillInTheBlankQuiz, { ...commonProps, variant: "programming" }, slots);
      }

      if (
        category === "multiple-file" ||
        category === "programming" ||
        category === "subjective" ||
        category === "code-completion"
      ) {
        return h(SolutionRevealQuiz, { ...commonProps, kind: category }, slots);
      }

      return h("section", { class: "ptaquiz" }, [
        h("div", { class: "ptaquiz-warning" }, "Missing PTAQuiz category."),
      ]);
    };
  },
};
</script>
