import { Request } from 'express'
import { JourneyData } from '../../@types/express'

class TestRequestCaptured {
  private req = {} as Request

  setRequest(req: Request) {
    this.req = req
  }

  validationErrors() {
    return JSON.parse(this.req.flash('validationErrors')[0] || '{}')
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
        req.session.journeyDataMap ??= {}
        req.session.journeyDataMap[uuid] ??= injectJourneyData
      }
    },
  ]
}
