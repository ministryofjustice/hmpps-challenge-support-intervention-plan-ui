import z from 'zod'
import { createSchema, validateTransformFutureDate } from '../../../../middleware/validationMiddleware'

const NEXT_REVIEW_DATE_REQUIRED_MSG = 'Enter a date for the next review'
const NEXT_REVIEW_DATE_INVALID_ERROR_MSG = 'Next review date must be a real date'
const NEXT_REVIEW_DATE_PAST_ERROR_MSG = 'Next review date must be today or in the future'

export const schema = createSchema({
  nextReviewDate: validateTransformFutureDate(
    NEXT_REVIEW_DATE_REQUIRED_MSG,
    NEXT_REVIEW_DATE_INVALID_ERROR_MSG,
    NEXT_REVIEW_DATE_PAST_ERROR_MSG,
  ),
})

export type SchemaType = z.infer<typeof schema>
