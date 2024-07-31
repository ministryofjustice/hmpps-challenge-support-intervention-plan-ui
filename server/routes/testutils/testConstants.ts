import type Prisoner from '../../services/prisonerSearch/prisoner'

export const TEST_PRISONER = {
  cellLocation: '',
  firstName: 'Test',
  lastName: 'Person',
  prisonerNumber: 'ABC123',
} as Prisoner

export const TEST_DPS_HOMEPAGE = 'http://localhost:3001/'

const tomorrowDate = new Date()
tomorrowDate.setDate(tomorrowDate.getDate() + 1)

const DATE_FORMAT_GB = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const TOMORROW_GB_FORMAT = DATE_FORMAT_GB.format(tomorrowDate)
export const TOMORROW_ISO_FORMAT = tomorrowDate.toISOString().substring(0, 10)

export const MOCK_INPUT_DATE = '2024-12-25'
export const MOCK_INPUT_TIME = '23:59'
export const MOCK_INPUT_RADIO = { code: 'AAA', description: 'Text for option' }
export const MOCK_INPUT_TEXT_SINGLE = '<script>alert("Test User")</script>'
export const MOCK_INPUT_TEXT_MULTI = `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('concerns');</script>
    
    <button>this button should be escaped</button>`
export const MOCK_INPUT_TEXT_MULTI_EXPECTED = `Text<br>\n      <br>\n          • Bullet 1<br>\n          • Bullet 2<br>\n          • Bullet 3<br>\n          <br>\n          Paragraph<br>\n          <br>\n          &lt;script&gt;alert('concerns');&lt;/script&gt;<br>\n          <br>\n          &lt;button&gt;this button should be escaped&lt;/button&gt;`
