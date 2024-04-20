import { ability } from '@repo/auth'

const userCanInviteSomenoneElse = ability.can('invite', 'User')
const userCanDeleteSomeoneElse = ability.can('delete', 'User')

console.log({
  userCanInviteSomenoneElse,
  userCanDeleteSomeoneElse,
})
