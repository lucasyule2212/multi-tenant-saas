import { z } from 'zod'

export const organizationSubject = z.tuple([
  z.union([
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
    z.literal('manage'),
    z.literal('transfer_ownership'),
  ]),
  z.literal('Organization'),
])
export type OrganizationSubject = z.infer<typeof organizationSubject>
