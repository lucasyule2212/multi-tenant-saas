import { z } from 'zod'

import { userSchema } from '../models/user'

export const userSubject = z.tuple([
  z.union([
    z.literal('get'),
    z.literal('update'),
    z.literal('delete'),
    z.literal('manage'),
    z.literal('invite'),
  ]),
  z.union([z.literal('User'), userSchema]),
])
export type UserSubject = z.infer<typeof userSubject>
