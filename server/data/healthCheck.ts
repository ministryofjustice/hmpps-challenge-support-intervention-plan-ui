import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import logger from '../../logger'
import { AgentConfig } from '../config'

export type ServiceCheck = () => Promise<string>

export class ServiceTimeout {
  response = 1500

  deadline = 2000
}

export function serviceCheckFactory(
  name: string,
  url: string,
  agentOptions: AgentConfig,
  serviceTimeout: ServiceTimeout = new ServiceTimeout(),
): ServiceCheck {
  return async () => {
    const keepaliveAgent = url.startsWith('https') ? new HttpsAgent(agentOptions) : new Agent(agentOptions)
    try {
      let request = superagent.get(url)

      if (!process.env['JEST_WORKER_ID']) {
        request = request.agent(keepaliveAgent)
      }

      request = request
        .retry(2, err => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message} when calling ${name}`)
          return undefined
        })
        .timeout(serviceTimeout)

      if (process.env['JEST_WORKER_ID']) {
        request = request.set('Connection', 'close')
      }

      const result = await request
      if (result.status === 200) {
        return 'UP'
      }
      throw result.status
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.stack, `Error calling ${name}`)
      }
      throw error
    } finally {
      keepaliveAgent.destroy()
    }
  }
}
