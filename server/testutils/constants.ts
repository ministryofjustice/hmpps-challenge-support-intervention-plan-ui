export const MOCK_INPUT = {
  DATE: '2024-12-25',
  TIME: '23:59',
  RADIO: { code: 'AAA', description: 'Text for option' },
  TEXT_SINGLE: '<script>alert("Test User")</script>',
  TEXT_MULTI: `Text

    • Bullet 1
    • Bullet 2
    • Bullet 3
    
    Paragraph
    
    <script>alert('concerns');</script>
    
    <button>this button should be escaped</button>`,
  TEXT_MULTI_EXPECTED: `Text<br>\n      <br>\n          • Bullet 1<br>\n          • Bullet 2<br>\n          • Bullet 3<br>\n          <br>\n          Paragraph<br>\n          <br>\n          &lt;script&gt;alert('concerns');&lt;/script&gt;<br>\n          <br>\n          &lt;button&gt;this button should be escaped&lt;/button&gt;`,
}
