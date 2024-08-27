import z from 'zod'
import { createSchema, validateDate } from '../../../../middleware/validationMiddleware'

const DATE_MSG = 'Enter the date for the next review'

const DATE_FUTURE_MSG = 'Next review date must be today or in the future'

const DATE_INVALID_MSG = 'Next review date must be a real date'

export const schema = createSchema({
  firstCaseReviewDate: validateDate(DATE_MSG, DATE_INVALID_MSG, DATE_FUTURE_MSG, 'FUTURE'),
})

export type SchemaType = z.infer<typeof schema>
