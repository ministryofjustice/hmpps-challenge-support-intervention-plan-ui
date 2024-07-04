import { Request, RequestHandler } from 'express'

export type JourneyState = {
  id: number
  path: string
  getNext: (req: Request) => number | null
}

const matchPath = (statePath: string, reqPath: string) => {
  // TODO: add support for matching path with params, eg. /{:code}-comments
  return statePath === reqPath
}

export const validateJourneyState = (states: JourneyState[]): RequestHandler => {
  return async (req, res, next) => {
    const reqPath = req.path.replace(/\//, '')
    let currentState: JourneyState = states[0]!

    for (;;) {
      if (matchPath(currentState.path, reqPath)) {
        // proceed to next if the request's path is matched when iterating through the valid states
        return next()
      }
      const nextStateIdx = currentState.getNext(req)
      const nextState = nextStateIdx && states.find(state => state.id === nextStateIdx)
      if (nextState) {
        // loop with the next valid state
        currentState = nextState
      } else {
        if (process.env.NODE_ENV === 'test') {
          // eslint-disable-next-line no-console
          console.error(`Journey Data: ${JSON.stringify(req.journeyData)}`)
        }

        if (req.method === 'GET') {
          // when there is no next valid state, and the request's path has not been matched, then redirect to the last valid state's path
          return res.redirect(currentState.path)
        }

        // if it is not a GET request, then instead of redirect, an error is thrown
        throw Error(`Invalid journey state for ${req.method} /${reqPath}`)
      }
    }
  }
}
