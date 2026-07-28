// Initialise telemetry before loading instrumented libraries such as bunyan and express.
import './server/utils/azureAppInsights'

import app from './server/index'
import logger from './logger'

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})
