export const meta = {
  type: 'trigger.button',
  category: 'trigger',
  label: 'Tap Button',
  description: 'A simple tap/click target. Useful as the opening "start" step, or anywhere a gesture isn\'t wanted.',
  fields: [
    { key: 'label', label: 'Button label', type: 'text', default: 'Start' },
  ],
}

// Non-gesture activation/action step: a simple tap/click target. Useful as
// the opening "start" step, or mixed anywhere a gesture isn't wanted.
export function render(container, config) {
  const { label = 'Start' } = config

  container.innerHTML = `
    <div class="step step-trigger-button">
      <button type="button" class="gimmick-button">${label}</button>
    </div>
  `
  const button = container.querySelector('.gimmick-button')

  return {
    start(onComplete) {
      button.addEventListener('click', onComplete, { once: true })
    },
    destroy() {
      container.innerHTML = ''
    },
  }
}
