/* eslint-disable import/first */
import { buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
const appInsightsClient = buildAppInsightsClient()

import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import PrisonerSearchRestClient from '../services/prisonerSearch/prisonerSearchClient'
import PrisonApiRestClient from '../services/prisonApi/prisonApiClient'
import CsipApiClient from '../services/csipApi/csipApiClient'

type RestClientBuilder<T> = (token: string) => T

const tokenStore = config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore()

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(tokenStore),
  hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
  csipApiClient: (token: string) => new CsipApiClient(token),
  prisonerSearchApiClient: (token: string) => new PrisonerSearchRestClient(token),
  prisonerImageClient: (token: string) => new PrisonApiRestClient(token),
  tokenStore,
  appInsightsClient,
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, RestClientBuilder, HmppsAuditClient }
