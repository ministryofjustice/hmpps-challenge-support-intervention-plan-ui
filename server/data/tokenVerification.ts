import superagent from 'superagent'
import type { ResponseError } from 'superagent'
import type { Request } from 'express'
import getSanitisedError from '../sanitisedError'
import config from '../config'
import logger from '../../logger'

function isResponseError(error: unknown): error is ResponseError {
  return typeof error === 'object' && error !== null && 'response' in error
}

async function getApiClientToken(token: string): Promise<boolean> {
  try {
    const response = await superagent
      .post(`${config.apis.tokenVerification.url}/token/verify`)
      .auth(token, { type: 'bearer' })
      .timeout(config.apis.tokenVerification.timeout)

    return Boolean(response.body && response.body.active)
  } catch (error: unknown) {
    if (isResponseError(error)) {
      logger.error(getSanitisedError(error), 'Error calling tokenVerificationApi')
    } else {
      logger.error('Unexpected error in tokenVerification', error)
    }
    return false
  }
}

export type TokenVerifier = (request: Request) => Promise<boolean | void>

const tokenVerifier: TokenVerifier = async request => {
  const { user, verified } = request

  if (!config.apis.tokenVerification.enabled) {
    logger.debug('Token verification disabled, returning token is valid')
    return true
  }

  if (verified) {
    return true
  }

  if (!user) {
    return false
  }

  logger.debug(`token request for user "${user.username}'`)

  const result = await getApiClientToken(user.token)

  if (result) {
    request.verified = true
  }

  return result
}

export default tokenVerifier
