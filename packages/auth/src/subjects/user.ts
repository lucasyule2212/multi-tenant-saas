import { z } from 'zod'

export const projectSubject = z.tuple([
  z.union([
    z.literal('get'),
    z.literal('update'),
    z.literal('delete'),
    z.literal('manage'),
    z.literal('invite'),
  ]),
  z.literal('User'),
])
export type UserSubject = z.infer<typeof projectSubject>
