import { boldAppendStamp, convertToTitleCase, initialiseName } from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_, input, expected) => {
    expect(convertToTitleCase(input)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_, input, expected) => {
    expect(initialiseName(input)).toEqual(expected)
  })
})

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
