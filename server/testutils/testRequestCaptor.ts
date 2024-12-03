import { Request } from 'express'
import { JourneyData } from '../@types/express'
import { FLASH_KEY__VALIDATION_ERRORS } from '../utils/constants'

export class TestRequestCaptured {
  private req = {} as Request

  setRequest(req: Request) {
    this.req = req
  }

  validationErrors() {
    return JSON.parse(this.req.flash(FLASH_KEY__VALIDATION_ERRORS)[0] || '{}')
  }

  journeyData() {
    return this.req.journeyData
  }
}

type RequestCaptorReturnType = [TestRequestCaptured, (req: Request) => void]

export default function testRequestCaptor(injectJourneyData?: JourneyData, uuid?: string): RequestCaptorReturnType {
  if (injectJourneyData && !uuid) {
    throw new Error('uuid must be provided to inject journeyData')
  }

  const captured = new TestRequestCaptured()
  return [
    captured,
    (req: Request) => {
      captured.setRequest(req)
      if (injectJourneyData && uuid) {
        req.journeyData ??= injectJourneyData
      }
    },
  ]
}
