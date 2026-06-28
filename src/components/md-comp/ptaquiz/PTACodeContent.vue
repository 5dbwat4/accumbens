<script>
import hljs from "highlight.js/lib/core";
import { Comment, Fragment, Text, h, inject, onMounted, ref, watch } from "vue";
import injectLanguage from "@/utils/hljs-ondemand";
import {
  extractTextFromNodes,
  getQuizPart,
  PTA_FILL_BLANK_KEY,
} from "./shared";

const FALLBACK_LANGUAGE = "plaintext";

function normalizeLanguage(value) {
  return String(value || FALLBACK_LANGUAGE).trim().toLowerCase() || FALLBACK_LANGUAGE;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isBlankNode(vnode) {
  return getQuizPart(vnode) === "blank" || vnode?.type?.name === "PTAQuizBlank";
}

function readBlankAnswer(vnode) {
  const children = vnode?.children;
  if (children && typeof children.default === "function") {
    return extractTextFromNodes(children.default()).trim();
  }
  if (Array.isArray(children)) return extractTextFromNodes(children).trim();
  if (typeof children === "string" || typeof children === "number") {
    return String(children).trim();
  }
  return "";
}

function appendCodeNode(node, model) {
  if (node === null || node === undefined || typeof node === "boolean") return;

  if (typeof node === "string" || typeof node === "number") {
    model.source += String(node);
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) appendCodeNode(child, model);
    return;
  }

  if (node.type === Comment) return;

  if (node.type === Fragment) {
    for (const child of node.children || []) appendCodeNode(child, model);
    return;
  }

  if (node.type === Text) {
    model.source += String(node.children || "");
    return;
  }

  if (isBlankNode(node)) {
    const answer = readBlankAnswer(node);
    const start = model.source.length;
    model.source += answer;
    model.blanks.push({
      start,
      end: start + answer.length,
      vnode: node,
    });
    return;
  }

  if (typeof node.children === "string" || typeof node.children === "number") {
    model.source += String(node.children);
    return;
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) appendCodeNode(child, model);
    return;
  }

  model.source += extractTextFromNodes([node]);
}

function readCodeModel(slotFn) {
  const model = {
    source: "",
    blanks: [],
  };

  for (const node of slotFn?.() || []) appendCodeNode(node, model);
  return model;
}

function highlightSource(source, language) {
  if (!source) return "";
  if (!hljs.getLanguage(language)) return escapeHtml(source);

  try {
    return hljs.highlight(source, {
      language,
      ignoreIllegals: true,
    }).value;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[PTACodeContent] Failed to highlight ${language}.`, error);
    }
    return escapeHtml(source);
  }
}

function renderPlainSource(source, blanks) {
  const children = [];
  let offset = 0;

  for (const blank of blanks) {
    if (blank.start > offset) children.push(source.slice(offset, blank.start));
    children.push(blank.vnode);
    offset = blank.end;
  }

  if (offset < source.length) children.push(source.slice(offset));
  return children;
}

function renderTextWithBlanks(text, state, blanks) {
  const children = [];
  const rangeStart = state.offset;
  const rangeEnd = rangeStart + text.length;
  let cursor = rangeStart;

  while (cursor < rangeEnd) {
    if (state.skipUntil > cursor) {
      cursor = Math.min(state.skipUntil, rangeEnd);
      continue;
    }

    const blank = blanks[state.blankIndex];

    if (blank && blank.end <= cursor) {
      state.blankIndex += 1;
      continue;
    }

    if (blank && blank.start === cursor) {
      children.push(blank.vnode);
      state.blankIndex += 1;
      state.skipUntil = Math.max(state.skipUntil, blank.end);
      continue;
    }

    const nextBoundary = blank ? Math.min(blank.start, rangeEnd) : rangeEnd;

    if (nextBoundary > cursor) {
      children.push(text.slice(cursor - rangeStart, nextBoundary - rangeStart));
      cursor = nextBoundary;
      continue;
    }

    cursor = rangeEnd;
  }

  state.offset = rangeEnd;
  return children;
}

function readElementProps(node, state) {
  const props = {
    key: `pta-code-token-${state.key++}`,
  };

  for (const attr of node.attributes || []) {
    props[attr.name === "class" ? "class" : attr.name] = attr.value;
  }

  return props;
}

function renderDomNode(node, state, blanks) {
  if (node.nodeType === Node.TEXT_NODE) {
    return renderTextWithBlanks(node.nodeValue || "", state, blanks);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const children = renderDomNodes(Array.from(node.childNodes), state, blanks);
  if (children.length === 0) return [];
  return [h(node.tagName.toLowerCase(), readElementProps(node, state), children)];
}

function renderDomNodes(nodes, state, blanks) {
  return nodes.flatMap((node) => renderDomNode(node, state, blanks));
}

function renderHighlightedSource(source, blanks, language) {
  if (typeof document === "undefined" || typeof Node === "undefined") {
    return renderPlainSource(source, blanks);
  }

  const template = document.createElement("template");
  template.innerHTML = highlightSource(source, language);

  return renderDomNodes(Array.from(template.content.childNodes), {
    offset: 0,
    blankIndex: 0,
    skipUntil: 0,
    key: 0,
  }, blanks);
}

export default {
  name: "PTACodeContent",
  props: {
    lang: {
      type: String,
      default: FALLBACK_LANGUAGE,
    },
  },
  setup(props, { slots }) {
    const quizContext = inject(PTA_FILL_BLANK_KEY, null);
    const languageReady = ref(false);
    let languageLoadId = 0;

    async function ensureLanguage(languageValue) {
      const language = normalizeLanguage(languageValue);
      const loadId = ++languageLoadId;
      languageReady.value = false;

      if (!hljs.getLanguage(language)) {
        try {
          await injectLanguage(hljs, language);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn(`[PTACodeContent] Failed to load ${language}.`, error);
          }
        }
      }

      if (loadId === languageLoadId) languageReady.value = true;
    }

    watch(() => props.lang, ensureLanguage, { immediate: true });

    onMounted(() => {
      if (
        import.meta.env.DEV &&
        quizContext?.variant?.value &&
        quizContext.variant.value !== "programming"
      ) {
        console.warn(
          "[PTACodeContent] Use this component inside <PTAQuiz fill-in-the-blank-for-programming>.",
        );
      }
    });

    return () => {
      const language = normalizeLanguage(props.lang);
      const model = readCodeModel(slots.default);
      const children = languageReady.value
        ? renderHighlightedSource(model.source, model.blanks, language)
        : renderPlainSource(model.source, model.blanks);

      return h("pre", { class: "ptaquiz-code-content" }, [
        h("code", { class: ["hljs", `language-${language}`] }, children),
      ]);
    };
  },
};
</script>

<style src="./style.css"></style>
