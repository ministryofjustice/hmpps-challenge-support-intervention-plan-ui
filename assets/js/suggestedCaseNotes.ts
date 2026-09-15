const TRUNCATION_THRESHOLD = 100
const WORDS_BEFORE_HIGHLIGHT = 10

const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length

const truncateBeforeHighlight = (content: HTMLElement): boolean => {
  const fragments = Array.from(content.querySelectorAll<HTMLElement>('[data-truncatable-fragment]'))
  const firstHighlightIndex = fragments.findIndex(fragment => fragment.dataset['truncatableFragment'] === 'highlight')
  if (firstHighlightIndex < 0) return false

  const wordsBeforeHighlight = fragments
    .slice(0, firstHighlightIndex)
    .reduce((count, fragment) => count + countWords(fragment.textContent ?? ''), 0)
  if (wordsBeforeHighlight <= WORDS_BEFORE_HIGHLIGHT) return false

  let wordsToRemove = wordsBeforeHighlight - WORDS_BEFORE_HIGHLIGHT
  const visibleFragments = fragments.slice(firstHighlightIndex)
  const precedingFragments = fragments.slice(0, firstHighlightIndex)

  for (let index = precedingFragments.length - 1; index >= 0 && wordsToRemove > 0; index -= 1) {
    const fragment = precedingFragments[index]!
    const words = (fragment.textContent ?? '').trim().split(/\s+/).filter(Boolean)
    if (words.length <= wordsToRemove) {
      wordsToRemove -= words.length
      continue
    }

    const shortenedFragment = fragment.cloneNode(true) as HTMLElement
    shortenedFragment.textContent = words.slice(words.length - wordsToRemove).join(' ')
    visibleFragments.unshift(shortenedFragment)
    wordsToRemove = 0
  }

  content.replaceChildren('… ')
  visibleFragments.forEach((fragment, index) => {
    if (index > 0) content.append(' ')
    content.append(fragment)
  })
  return true
}

const cardExceedsThreshold = (card: HTMLElement): boolean => {
  let exceedsThreshold = false

  card.querySelectorAll<HTMLElement>('[data-truncatable-content]').forEach(content => {
    if (countWords(content.textContent ?? '') <= TRUNCATION_THRESHOLD) return

    exceedsThreshold = true
    const wrapper = content.closest<HTMLElement>('[data-truncatable-text]')
    if (!wrapper) return

    wrapper.dataset['fullHtml'] = content.innerHTML
    wrapper.classList.add('case-note-card__text-wrapper--truncated')
    truncateBeforeHighlight(content)
  })

  return exceedsThreshold
}

const setCardExpanded = (card: HTMLElement, expanded: boolean) => {
  card.querySelectorAll<HTMLElement>('[data-truncatable-text]').forEach(wrapper => {
    const content = wrapper.querySelector<HTMLElement>('[data-truncatable-content]')
    const fullHtml = wrapper.dataset['fullHtml']
    if (!content || !fullHtml) return

    content.innerHTML = fullHtml
    if (expanded) {
      wrapper.classList.remove('case-note-card__text-wrapper--truncated')
    } else {
      wrapper.classList.add('case-note-card__text-wrapper--truncated')
      truncateBeforeHighlight(content)
    }
  })

  const button = card.querySelector<HTMLButtonElement>('.case-note-card__show-all-btn')
  if (!button) return

  button.textContent = expanded ? 'Minimise case note' : 'Expand case note'
  button.setAttribute('aria-expanded', String(expanded))
}

export const initSuggestedCaseNotes = () => {
  document.querySelectorAll<HTMLElement>('[data-qa="suggested-case-notes-card"]').forEach(card => {
    const button = card.querySelector<HTMLButtonElement>('.case-note-card__show-all-btn')
    if (!button || !cardExceedsThreshold(card)) return

    button.hidden = false
    button.addEventListener('click', () => {
      setCardExpanded(card, button.getAttribute('aria-expanded') !== 'true')
    })
  })
}
