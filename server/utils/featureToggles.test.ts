import config from '../config'
import csipAssistEnabled from './featureToggles'

describe('csipAssistEnabled', () => {
  beforeEach(() => {
    config.features.csipAssistEnabled = false
    config.features.csipAssistActivePrisons = ''
  })

  it('returns false when feature flag is disabled', () => {
    expect(csipAssistEnabled('LEI')).toBe(false)
  })

  it('returns false when no active case load id is provided and wildcard is not configured', () => {
    config.features.csipAssistEnabled = true
    config.features.csipAssistActivePrisons = 'LEI'

    expect(csipAssistEnabled()).toBe(false)
  })

  it('returns true when active case load id is listed', () => {
    config.features.csipAssistEnabled = true
    config.features.csipAssistActivePrisons = 'LEI,MDI'

    expect(csipAssistEnabled('LEI')).toBe(true)
  })

  it('returns true for any case load when all-prisons token is present', () => {
    config.features.csipAssistEnabled = true
    config.features.csipAssistActivePrisons = '***'

    expect(csipAssistEnabled('BWI')).toBe(true)
  })

  it('matches case-insensitively for active case load id values', () => {
    config.features.csipAssistEnabled = true
    config.features.csipAssistActivePrisons = 'LEI'

    expect(csipAssistEnabled('lei')).toBe(true)
  })

  it('trims whitespace around prison values in the list', () => {
    config.features.csipAssistEnabled = true
    config.features.csipAssistActivePrisons = ' LEI , MDI '

    expect(csipAssistEnabled('MDI')).toBe(true)
  })
})
