export const getWidget = (): HTMLElement | null =>
  document.querySelector<HTMLElement>('[data-qa="suggested-case-notes-widget"]')

export const replaceLinkWithButton = (link: HTMLAnchorElement): HTMLButtonElement => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = link.className
  button.classList.add('app-link-button')
  Object.entries(link.dataset).forEach(([key, value]) => {
    if (value !== undefined) button.dataset[key] = value
  })
  button.textContent = link.textContent
  link.replaceWith(button)
  return button
}

export const setQueryParam = (name: string, value: string) => {
  const url = new URL(window.location.href)
  url.searchParams.set(name, value)
  window.history.replaceState(window.history.state, '', url)
}

export const announce = (widget: HTMLElement, message: string) => {
  const status = widget.querySelector<HTMLElement>('[data-qa="suggested-case-notes-status"]')
  if (!status) return

  status.textContent = ''
  window.setTimeout(() => {
    status.textContent = message
  }, 100)
}
