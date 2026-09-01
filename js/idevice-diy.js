document.addEventListener('DOMContentLoaded', () => {
  initRevealButtons();
  initChoiceItems();
  initSelectChecks();
  initChecklists();
  initCanvasGenerators();
});

function initRevealButtons() {
  document.querySelectorAll('.diy-reveal-btn').forEach((btn) => {
    const target = document.querySelector(btn.dataset.diyReveal);
    if (!target) return;
    const showLabel = btn.textContent;
    const hideLabel = btn.dataset.diyHideLabel || "Amaga l'exemple";
    btn.addEventListener('click', () => {
      const isHidden = target.hasAttribute('hidden');
      if (isHidden) {
        target.removeAttribute('hidden');
        btn.textContent = hideLabel;
      } else {
        target.setAttribute('hidden', '');
        btn.textContent = showLabel;
      }
    });
  });
}

function initChoiceItems() {
  document.querySelectorAll('.diy-choice-item').forEach((item) => {
    const correct = item.dataset.diyCorrect;
    const feedbackCorrect = item.dataset.diyFeedbackCorrect || 'Correcte!';
    const feedbackIncorrect = item.dataset.diyFeedbackIncorrect || 'No és la millor opció.';
    const feedbackEl = item.querySelector('.diy-feedback');
    const buttons = Array.from(item.querySelectorAll('.diy-choice'));

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.value === correct;

        buttons.forEach((b) => {
          b.disabled = true;
          if (b.dataset.value === correct) b.classList.add('is-correct');
        });
        if (!isCorrect) btn.classList.add('is-incorrect');

        if (feedbackEl) {
          feedbackEl.textContent = isCorrect ? feedbackCorrect : feedbackIncorrect;
          feedbackEl.classList.remove('is-correct', 'is-incorrect');
          feedbackEl.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
          feedbackEl.hidden = false;
        }
      });
    });
  });
}

function initSelectChecks() {
  document.querySelectorAll('.diy-select-item').forEach((item) => {
    const correct = item.dataset.diyCorrect;
    const select = item.querySelector('.diy-select');
    const checkBtn = item.querySelector('.diy-check-btn');
    const feedbackEl = item.querySelector('.diy-feedback');
    const feedbackCorrect = item.dataset.diyFeedbackCorrect || 'Correcte!';
    const feedbackIncorrect = item.dataset.diyFeedbackIncorrect || 'Torna-ho a pensar.';
    if (!checkBtn || !select) return;

    checkBtn.addEventListener('click', () => {
      if (!select.value) return;
      const isCorrect = select.value === correct;
      if (feedbackEl) {
        feedbackEl.textContent = isCorrect ? feedbackCorrect : feedbackIncorrect;
        feedbackEl.classList.remove('is-correct', 'is-incorrect');
        feedbackEl.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
        feedbackEl.hidden = false;
      }
    });
  });
}

function initChecklists() {
  document.querySelectorAll('.diy-checklist').forEach((list) => {
    const correctValues = (list.dataset.diyCorrect || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    const checkBtn = list.querySelector('.diy-check-btn');
    const feedbackEl = list.querySelector('.diy-feedback');
    if (!checkBtn) return;

    checkBtn.addEventListener('click', () => {
      const checkboxes = Array.from(list.querySelectorAll('input[type="checkbox"]'));
      const selected = checkboxes.filter((cb) => cb.checked).map((cb) => cb.value);
      const missing = correctValues.filter((v) => !selected.includes(v));
      const extra = selected.filter((v) => !correctValues.includes(v));
      const allCorrect = missing.length === 0 && extra.length === 0;

      checkboxes.forEach((cb) => {
        const label = cb.closest('label');
        if (!label) return;
        label.classList.remove('is-correct', 'is-incorrect');
        if (correctValues.includes(cb.value) && cb.checked) label.classList.add('is-correct');
        if (!correctValues.includes(cb.value) && cb.checked) label.classList.add('is-incorrect');
        if (correctValues.includes(cb.value) && !cb.checked) label.classList.add('is-incorrect');
      });

      if (feedbackEl) {
        feedbackEl.textContent = allCorrect
          ? 'Correcte! Has identificat totes les dades sensibles.'
          : 'Revisa les opcions marcades en roig: en falten o en sobren.';
        feedbackEl.classList.remove('is-correct', 'is-incorrect');
        feedbackEl.classList.add(allCorrect ? 'is-correct' : 'is-incorrect');
        feedbackEl.hidden = false;
      }
    });
  });
}

function initCanvasGenerators() {
  document.querySelectorAll('.diy-generate-btn').forEach((btn) => {
    const canvas = btn.closest('.diy-canvas');
    if (!canvas) return;
    const targetSel = btn.dataset.diySummaryTarget;
    const target = targetSel ? document.querySelector(targetSel) : null;
    const template = btn.dataset.diyTemplate || '';

    btn.addEventListener('click', () => {
      const fields = {};
      canvas.querySelectorAll('[data-diy-field]').forEach((input) => {
        fields[input.dataset.diyField] = input.value.trim();
      });

      let output = template;
      Object.keys(fields).forEach((key) => {
        const value = fields[key] || `[${key}]`;
        output = output.split(`{${key}}`).join(value);
      });

      if (target) {
        target.textContent = output;
        target.hidden = false;
      }
    });
  });
}
