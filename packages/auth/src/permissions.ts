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
  ADMIN: (user, { can, cannot }) => {
    can('manage', 'all')
    cannot(['update', 'transfer_ownership'], 'Organization')
    can(['update', 'transfer_ownership'], 'Organization', {
      ownerId: { $eq: user.id },
    })
  },
  MEMBER: (user, { can }) => {
    can('get', 'User')
    can(['create', 'get'], 'Project')
    can(['update', 'delete'], 'Project', { ownerId: { $eq: user.id } })
  },
  BILLING: (_, { can }) => {
    can('manage', 'Billing')
  },
}
