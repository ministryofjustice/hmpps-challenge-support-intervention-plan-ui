import z from 'zod'

const ERROR_MESSAGE = 'Select if this referral is proactive or reactive'

const isProactiveReferralMap = new Map([
  ['proactive', true],
  ['reactive', false],
])

export const schema = z.object({
  isProactiveReferral: z
    .string({ message: ERROR_MESSAGE })
    .refine(val => isProactiveReferralMap.has(val), ERROR_MESSAGE)
    .transform(val => isProactiveReferralMap.get(val)),
})
