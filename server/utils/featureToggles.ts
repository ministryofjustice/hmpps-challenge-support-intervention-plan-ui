import config from '../config'

const csipAssistEnabled = (activeCaseLoadId?: string): boolean => {
  if (!config.features.csipAssistEnabled) {
    return false
  }

  const enabledPrisons = config.features.csipAssistActivePrisons
  if (enabledPrisons.includes(config.features.csipAssistAllPrisonsToken)) {
    return true
  }

  if (!activeCaseLoadId || enabledPrisons.length === 0) {
    return false
  }

  return enabledPrisons.includes(activeCaseLoadId.toUpperCase())
}

export default csipAssistEnabled
