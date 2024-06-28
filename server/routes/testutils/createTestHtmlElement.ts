export default function createTestHtmlElement(text: string) {
  const div = document.createElement('div')
  div.innerHTML = text
  document.body.innerHTML = ''
  document.body.appendChild(div)
  return document.documentElement
}
