import config from '../config'

const ALL_PRISONS_TOKEN = '***'

const csipAssistEnabled = (activeCaseLoadId?: string): boolean => {
  if (!config.features.csipAssistEnabled) {
    return false
  }

  const enabledPrisons = config.features.csipAssistActivePrisons
  if (enabledPrisons.includes(ALL_PRISONS_TOKEN)) {
    return true
  }

  if (!activeCaseLoadId || enabledPrisons.length === 0) {
    return false
  }

  return enabledPrisons.includes(activeCaseLoadId.toUpperCase())
}

export default csipAssistEnabled
