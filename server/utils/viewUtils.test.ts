import { boldAppendStamp } from './viewUtils'

describe('boldAppendStamp', () => {
  it('add <strong></strong> to stamp on a separate line in the middle of text', () => {
    const result = boldAppendStamp('old-text\n\n[stamp]\n\nnew-text')
    expect(result).toEqual('old-text\n\n<strong>[stamp]</strong>\n\nnew-text')
  })

  it('add <strong></strong> to stamp on a separate at the beginning', () => {
    const result = boldAppendStamp('[stamp]\n\nnew-text')
    expect(result).toEqual('<strong>[stamp]</strong>\n\nnew-text')
  })

  it('ignore [] not on a separate line', () => {
    const result = boldAppendStamp('some-[text]-with-brackets')
    expect(result).toEqual('some-[text]-with-brackets')
  })
})
