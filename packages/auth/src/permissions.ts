import { AbilityBuilder } from '@casl/ability'
import { z } from 'zod'

import { AppAbility } from '.'
import { User } from './models/user'
import { roleSchema } from './roles'

export type Role = z.infer<typeof roleSchema>

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN: (_, { can }) => {
    can('manage', 'all')
  },
  MEMBER: (user, { can }) => {
    can('invite', 'User')
    can('manage', 'Project')
    can(['update', 'delete'], 'Project', { ownerId: { $eq: user.id } })
  },
  BILLING: () => {},
}
