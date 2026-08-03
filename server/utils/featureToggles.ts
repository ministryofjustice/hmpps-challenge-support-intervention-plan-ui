import config from '../config'

const csipAssistEnabled = (activeCaseLoadId?: string): boolean => {
  if (!config.features.csipAssistEnabled || !activeCaseLoadId || !config.features.csipAssistActivePrisons) {
    return false
  }

  if (config.features.csipAssistActivePrisons === '***') {
    return true
  }

  return config.features.csipAssistActivePrisons
    .split(',')
    .map(it => it.trim().toUpperCase())
    .filter(Boolean)
    .includes(activeCaseLoadId.toUpperCase())
}

export default csipAssistEnabled
