import { defineAbilityFor } from '@repo/auth'

const ability = defineAbilityFor({ role: 'MEMBER' })

const userCanInviteSomenoneElse = ability.can('invite', 'User')
const userCanDeleteSomeoneElse = ability.can('delete', 'User')

console.log({
  userCanInviteSomenoneElse,
  userCanDeleteSomeoneElse,
})
