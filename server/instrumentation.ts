import applicationInfoSupplier from './applicationInfo'
import { initialiseAppInsights } from './utils/azureAppInsights'

initialiseAppInsights(applicationInfoSupplier())
