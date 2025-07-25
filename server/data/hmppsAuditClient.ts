import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import logger from '../../logger'

export type AuditAction = 'PAGE_VIEW_ACCESS_ATTEMPT' | 'PAGE_VIEW' | 'API_CALL_ATTEMPT' | 'API_CALL_SUCCESS'

export interface AuditEvent {
  what: AuditAction
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export interface SqsMessage {
  what: AuditAction
  who: string
  when: string
  service: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: string
}

export interface AuditClientConfig {
  queueUrl: string
  region: string
  serviceName: string
}

export default class HmppsAuditClient {
  private sqsClient: SQSClient

  private queueUrl: string

  private serviceName: string

  private enabled: boolean

  constructor(config: AuditClientConfig) {
    this.enabled = !!config.serviceName
    this.queueUrl = config.queueUrl
    this.serviceName = config.serviceName
    this.sqsClient = new SQSClient({ region: config.region })
  }

  async sendMessage(event: AuditEvent) {
    if (!this.enabled) return null

    const sqsMessage: SqsMessage = {
      ...event,
      details: JSON.stringify(event.details),
      service: this.serviceName!,
      when: new Date().toISOString(),
    }

    try {
      const messageResponse = await this.sqsClient.send(
        new SendMessageCommand({ MessageBody: JSON.stringify(sqsMessage), QueueUrl: this.queueUrl }),
      )

      logger.info(`HMPPS Audit SQS message sent (${messageResponse.MessageId})`)

      return messageResponse
    } catch (error) {
      if (process.env.NODE_ENV !== 'e2e-test') {
        logger.error('Error sending HMPPS Audit SQS message, ', error)
      }
    }
    return null
  }
}
