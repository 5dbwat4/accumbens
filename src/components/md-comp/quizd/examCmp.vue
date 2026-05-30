<script>
import { ref, nextTick, h } from 'vue';

export default {
  props: {
    type: { type: String, default: 'choice' },
    choice: { type: Number, default: -1 },
  },
  setup(props, { slots }) {
    const submitted = ref(false);
    const selectedChoice = ref(-1);
    const showAnalysis = ref(false);
    const overallCorrect = ref(false);
    const wrapperRef = ref(null);

    const markers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const typeLabel = props.type === 'blank' ? 'Fill in the blank' : 'Multiple Choice';

    function selectChoice(idx) {
      if (submitted.value) return;
      selectedChoice.value = idx;
    }

    function handleSubmit() {
      if (submitted.value) return;
      submitted.value = true;
      if (props.type === 'choice') {
        overallCorrect.value = selectedChoice.value === props.choice;
        showAnalysis.value = overallCorrect.value;
      } else {
        nextTick(validateBlanks);
      }
    }

    function validateBlanks() {
      const el = wrapperRef.value;
      if (!el) return;
      const inputs = el.querySelectorAll('.exam-blank-input');
      let allOk = true;
      inputs.forEach((inp) => {
        const expected = (inp.dataset.expected ?? '').trim().toLowerCase();
        const actual = inp.value.trim().toLowerCase();
        inp.disabled = true;
        if (expected && actual === expected) {
          inp.classList.add('exam-blank-input--correct');
        } else {
          inp.classList.add('exam-blank-input--wrong');
          allOk = false;
        }
      });
      overallCorrect.value = allOk;
      showAnalysis.value = allOk;
    }

    function reset() {
      submitted.value = false;
      showAnalysis.value = false;
      selectedChoice.value = -1;
      overallCorrect.value = false;
      nextTick(() => {
        const el = wrapperRef.value;
        if (!el) return;
        el.querySelectorAll('.exam-blank-input').forEach((inp) => {
          inp.value = '';
          inp.disabled = false;
          inp.classList.remove('exam-blank-input--correct', 'exam-blank-input--wrong');
        });
      });
    }

    function renderBtn(text, opts) {
      return h('button', {
        class: 'exam-btn ' + (opts.cls ?? ''),
        disabled: !!opts.disabled,
        onClick: opts.onClick,
      }, text);
    }

    return () => {
      const defaultVNodes = slots.default?.() ?? [];
      let qVNode, choiceVNodes = [], analysisVNode;

      if (props.type === 'choice') {
        qVNode = defaultVNodes[0];
        if (defaultVNodes.length > 2) {
          analysisVNode = defaultVNodes[defaultVNodes.length - 1];
          choiceVNodes = defaultVNodes.slice(1, -1);
        } else if (defaultVNodes.length === 2) {
          analysisVNode = defaultVNodes[1];
        } else {
          qVNode = defaultVNodes[0];
        }
      } else {
        qVNode = defaultVNodes[0];
        analysisVNode = defaultVNodes[1];
      }

      const body = [];

      if (qVNode) {
        body.push(h(qVNode.type, qVNode.props, qVNode.children));
      }

      choiceVNodes.forEach((vnode, i) => {
        const sel = selectedChoice.value === i;
        const ok = i === props.choice;
        body.push(
          h('div', {
            class: 'exam-choice' +
              (!submitted.value && sel ? ' exam-choice--selected' : '') +
              (submitted.value && ok ? ' exam-choice--correct' : '') +
              (submitted.value && sel && !ok ? ' exam-choice--wrong' : '') +
              (submitted.value && !sel && !ok ? ' exam-choice--dimmed' : '') +
              (submitted.value ? ' exam-choice--disabled' : ''),
            onClick: () => selectChoice(i),
          }, [
            h('span', { class: 'exam-choice-marker' }, markers[i] ?? String(i + 1)),
            h('span', { class: 'exam-choice-content' }, [
              h(vnode.type,
                { ...(vnode.props || {}), ...(vnode.children || {}) },
              ),
            ]),
          ])
        );
      });

      if (showAnalysis.value && analysisVNode) {
        body.push(
          h('div', { class: 'exam-analysis' }, [
            h('div', { class: 'exam-analysis-head' }, [
              h('span', { class: 'exam-analysis-dot' }),
              h('span', { class: 'exam-analysis-label' }, 'Analysis'),
            ]),
            h('div', { class: 'exam-analysis-body' }, [
              h(analysisVNode.type,
                { ...(analysisVNode.props || {}), ...(analysisVNode.children || {}) },
              ),
            ]),
          ])
        );
      }

      const footerBtns = [
        renderBtn(submitted.value ? 'Submitted' : 'Submit', {
          cls: submitted.value ? 'exam-btn--disabled' : 'exam-btn--primary',
          disabled: submitted.value,
          onClick: handleSubmit,
        }),
      ];
      if (submitted.value) {
        footerBtns.push(renderBtn(showAnalysis.value ? 'Hide Analysis' : 'Show Analysis', {
          cls: 'exam-btn--ghost',
          onClick: () => { showAnalysis.value = !showAnalysis.value; },
        }));
      }
      if (submitted.value && !overallCorrect.value) {
        footerBtns.push(renderBtn('Retry', {
          cls: 'exam-btn--ghost exam-btn--warn',
          onClick: reset,
        }));
      }

      const wrapperClass = 'exam-wrapper' + (submitted.value ? ' is-submitted' : '');

      return h('div', { ref: wrapperRef, class: wrapperClass }, [
        h('div', { class: 'exam-header' }, [
          h('span', { class: 'exam-type-badge' }, typeLabel),
        ]),
        h('div', { class: 'exam-body' }, body),
        h('div', { class: 'exam-footer' }, footerBtns),
        submitted.value ? h('div', {
          class: overallCorrect.value ? 'exam-result exam-result--ok' : 'exam-result exam-result--fail',
        }, overallCorrect.value ? 'Correct!' : 'Incorrect, try again.') : null,
      ].filter(Boolean));
    };
  },
};
</script>

<style>
.exam-wrapper {
  max-width: 720px;
  margin: 24px auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

.exam-header {
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.exam-type-badge {
  font-size: 11px;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: .6px;
}

.exam-body {
  padding: 20px;
}

.exam-choice {
  display: flex;
  align-items: flex-start;
  padding: 12px 15px;
  margin-bottom: 8px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all .15s ease;
  background: #fff;
}

.exam-choice:hover:not(.exam-choice--disabled) {
  border-color: #818cf8;
  background: #eef2ff;
}

.exam-choice--selected {
  border-color: #6366f1;
  background: #eef2ff;
  box-shadow: inset 0 0 0 1px #6366f1;
}

.exam-choice--correct {
  border-color: #22c55e;
  background: #f0fdf4;
}

.exam-choice--wrong {
  border-color: #ef4444;
  background: #fef2f2;
}

.exam-choice--dimmed {
  opacity: .45;
}

.exam-choice--disabled {
  cursor: default;
}

.exam-choice-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
  transition: all .15s ease;
}

.exam-choice--selected .exam-choice-marker {
  background: #6366f1;
  color: #fff;
}

.exam-choice--correct .exam-choice-marker {
  background: #22c55e;
  color: #fff;
}

.exam-choice--wrong .exam-choice-marker {
  background: #ef4444;
  color: #fff;
}

.exam-choice-content {
  font-size: 15px;
  line-height: 1.65;
  color: #1e293b;
  padding-top: 3px;
}

.exam-analysis {
  margin-top: 20px;
  padding: 16px 18px;
  border-left: 3px solid #6366f1;
  background: #f5f6ff;
  border-radius: 0 8px 8px 0;
}

.exam-analysis-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
}

.exam-analysis-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
  flex-shrink: 0;
}

.exam-analysis-label {
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.exam-analysis-body {
  font-size: 15px;
  line-height: 1.7;
  color: #334155;
}

.exam-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #e2e8f0;
  background: #fafafa;
}

.exam-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .12s ease;
  line-height: 1.5;
  font-family: inherit;
}

.exam-btn:hover:not(:disabled) {
  border-color: #9ca3af;
  background: #f9fafb;
}

.exam-btn:disabled {
  opacity: .5;
  cursor: default;
}

.exam-btn--primary {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
}

.exam-btn--primary:hover:not(:disabled) {
  background: #4f46e5;
  border-color: #4f46e5;
}

.exam-btn--ghost {
  border-color: transparent;
  background: transparent;
  color: #6b7280;
}

.exam-btn--ghost:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.exam-btn--warn {
  color: #f59e0b;
}

.exam-btn--warn:hover:not(:disabled) {
  color: #d97706;
  background: #fffbeb;
}

.exam-btn--disabled {
  cursor: default;
}

.exam-result {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-top: 1px solid #e2e8f0;
}

.exam-result--ok {
  color: #16a34a;
  background: #f0fdf4;
}

.exam-result--fail {
  color: #dc2626;
  background: #fef2f2;
}

.exam-blank-answer {
  display: none;
}

.is-submitted .exam-blank-input--wrong ~ .exam-blank-answer {
  display: inline;
}
</style>
