import { Comment, Fragment, Text, h } from "vue";

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const PTA_FILL_BLANK_KEY = Symbol("pta-fill-in-the-blank");

const INTERACTIVE_SELECTOR =
  "a,button,input,textarea,select,label,summary,[role='button'],[contenteditable='true']";

export function flattenSlotNodes(nodes, result = []) {
  for (const node of nodes || []) {
    if (!node) continue;
    if (Array.isArray(node)) {
      flattenSlotNodes(node, result);
      continue;
    }
    if (node.type === Fragment) {
      flattenSlotNodes(node.children || [], result);
      continue;
    }
    if (node.type === Comment) continue;
    if (node.type === Text && String(node.children || "").trim() === "") continue;
    result.push(node);
  }
  return result;
}

export function getQuizPart(vnode) {
  const type = vnode?.type;
  if (!type || typeof type === "string") return "";
  return type.__ptaQuizPart || "";
}

export function extractTextFromNodes(nodes) {
  return (nodes || [])
    .map((node) => {
      if (node === null || node === undefined || typeof node === "boolean") return "";
      if (typeof node === "string" || typeof node === "number") return String(node);
      if (Array.isArray(node)) return extractTextFromNodes(node);
      if (node.type === Text) return String(node.children || "");
      if (typeof node.children === "string") return node.children;
      if (Array.isArray(node.children)) return extractTextFromNodes(node.children);
      if (node.children && typeof node.children.default === "function") {
        return extractTextFromNodes(node.children.default());
      }
      return "";
    })
    .join("");
}

export function extractTextFromSlot(slotFn) {
  return extractTextFromNodes(slotFn?.() || []);
}

function formatMetaValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function formatMeta(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return "";
  return Object.entries(meta)
    .map(([key, value]) => `[${key}]: [${formatMetaValue(value)}]`)
    .join("\n");
}

export function renderQuizHeader(label, title, meta) {
  const tooltip = formatMeta(meta);
  return h(
    "header",
    {
      class: "ptaquiz-header",
      title: tooltip || null,
    },
    [
      h("div", { class: "ptaquiz-titleline" }, [
        h("span", { class: "ptaquiz-kicker" }, label),
        title ? h("strong", { class: "ptaquiz-title" }, title) : null,
      ]),
    ],
  );
}

export function readQuizParts(slotFn) {
  const parts = {
    question: null,
    choices: [],
    answer: null,
    explanation: null,
    stray: [],
  };

  for (const vnode of flattenSlotNodes(slotFn?.() || [])) {
    const part = getQuizPart(vnode);
    if (part === "question") {
      if (!parts.question) parts.question = vnode;
      else parts.stray.push(vnode);
    } else if (part === "choice") {
      parts.choices.push(vnode);
    } else if (part === "answer") {
      if (!parts.answer) parts.answer = vnode;
      else parts.stray.push(vnode);
    } else if (part === "explanation") {
      if (!parts.explanation) parts.explanation = vnode;
      else parts.stray.push(vnode);
    } else {
      parts.stray.push(vnode);
    }
  }

  if (import.meta.env.DEV && parts.stray.length > 0) {
    console.warn(
      "[PTAQuiz] Ignored child nodes. Use only <Q>, <C>, <A>, <Blank>, and <Explanation> as direct children.",
      parts.stray,
    );
  }

  return parts;
}

export function normalizeChoiceIndexes(value) {
  if (value === null || value === undefined || value === "") return [];

  const values = Array.isArray(value) ? value : [value];

  return values
    .map((item) => {
      if (typeof item === "number" && Number.isFinite(item)) return item;
      return null;
    })
    .filter((item) => Number.isInteger(item) && item >= 0);
}

export function normalizeBooleanAnswer(value) {
  if (typeof value === "boolean") return value;
  return null;
}

export function normalizeFillAnswer(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function sameIndexSet(left, right) {
  if (left.length !== right.length) return false;
  const expected = new Set(right);
  return left.every((item) => expected.has(item));
}

export function isFromInteractiveElement(event) {
  const target = event?.target;
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(target.closest(INTERACTIVE_SELECTOR));
}
