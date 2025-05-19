import katex from "katex";
import renderMathInElement from "katex/contrib/auto-render";

export const handleKatexRender = () => {
  if (!document.getElementById("markdown-body")) return;

  document.getElementById("markdown-body").querySelectorAll(".language-math").forEach((el) => {
    const math = el.innerText;
    const display = el.classList.contains("display-math");
    const html = katex.renderToString(math, {
      displayMode: display,
      throwOnError: false,
    });
    el.outerHTML = html;
  });
  // renderMathInElement(document.getElementById("markdown-body"), {
  //   // customised options
  //   // • auto-render specific keys, e.g.:
  //   delimiters: [
  //     { left: "$$", right: "$$", display: true },
  //     { left: "$", right: "$", display: false },
  //     // {left: '\\(', right: '\\)', display: false},
  //     // {left: '\\[', right: '\\]', display: true}
  //   ],
  //   // • rendering keys, e.g.:
  //   throwOnError: false,
  // });
};
