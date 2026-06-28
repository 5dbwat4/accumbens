<script>
import { computed, h, inject, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  extractTextFromSlot,
  normalizeFillAnswer,
  PTA_FILL_BLANK_KEY,
} from "./shared";

let nextBlankId = 0;

export default {
  name: "PTAQuizBlank",
  setup(_, { slots }) {
    const context = inject(PTA_FILL_BLANK_KEY, null);
    const id = `pta-blank-${++nextBlankId}`;
    const value = ref("");
    const peeked = ref(false);
    const expected = computed(() => extractTextFromSlot(slots.default).trim());
    const submitted = computed(() => Boolean(context?.submitted.value));
    const isCorrect = computed(
      () => normalizeFillAnswer(value.value) === normalizeFillAnswer(expected.value),
    );
    const showInlineAnswer = computed(
      () => submitted.value && !isCorrect.value && !peeked.value,
    );
    const peekEnabled = computed(() => Boolean(context?.peekEnabled.value));
    const readOnly = computed(() => submitted.value || peeked.value || peekEnabled.value);

    function syncRegistration() {
      context?.registerBlank(id, expected.value, value.value);
    }

    function updateValue(nextValue) {
      value.value = nextValue;
      context?.updateBlank(id, nextValue);
    }

    function maybePeek() {
      if (peekEnabled.value && !submitted.value) {
        value.value = expected.value;
        context?.updateBlank(id, expected.value);
        peeked.value = true;
      }
    }

    onMounted(syncRegistration);
    onBeforeUnmount(() => context?.unregisterBlank(id));
    watch(expected, (nextExpected) => {
      if (peeked.value) {
        value.value = nextExpected;
      }
      syncRegistration();
    });
    watch(
      () => context?.resetNonce.value,
      () => {
        value.value = "";
        peeked.value = false;
        context?.updateBlank(id, "");
      },
    );
    watch(peekEnabled, (enabled) => {
      if (!enabled && peeked.value) {
        value.value = "";
        peeked.value = false;
        context?.updateBlank(id, "");
      }
    });

    return () =>
      h("span", { class: "ptaquiz-blank" }, [
        h("input", {
          class: [
            "ptaquiz-blank-input",
            (peeked.value || (submitted.value && isCorrect.value)) && "is-correct",
            submitted.value && !isCorrect.value && "is-wrong",
          ]
            .filter(Boolean)
            .join(" "),
          type: "text",
          value: value.value,
          disabled: submitted.value,
          readonly: readOnly.value,
          size: Math.max(8, Math.min(28, expected.value.length + 2)),
          onInput: (event) => updateValue(event.target.value),
          onClick: maybePeek,
        }),
        showInlineAnswer.value
          ? h("span", { class: "ptaquiz-blank-answer" }, expected.value)
          : null,
      ]);
  },
};
</script>

<style src="./style.css"></style>
