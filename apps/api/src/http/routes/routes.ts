import { app } from '../app'
import { authenticateWithGithub } from './auth/authenticate-with-github'
import { authenticateWithPassword } from './auth/authenticate-with-password'
import { createAccount } from './auth/create-account'
import { getUserProfile } from './auth/get-user-profile'
import { requestPasswordRecover } from './auth/request-password-recover'
import { resetUserPassword } from './auth/reset-user-password'
import { getOrganizationBilling } from './billing/get-organization-billing'
import { acceptInvite } from './invites/accept-invite'
import { createInvite } from './invites/create-invite'
import { getInvite } from './invites/get-invite'
import { getInvites } from './invites/get-invites'
import { getPendingInvites } from './invites/get-pending-invites'
import { rejectInvite } from './invites/reject-invite'
import { revokeInvite } from './invites/revoke-invite'
import { getMembers } from './members/get-members'
import { removeMember } from './members/remove-member'
import { updateMember } from './members/update-members'
import { createOrganization } from './orgs/create-organization'
import { getUserMembership } from './orgs/get-membership'
import { getOrganization } from './orgs/get-organization'
import { getOrganizations } from './orgs/get-organizations'
import { shutdownOrganization } from './orgs/shutdown-organization'
import { transferOrganization } from './orgs/transfer-organization'
import { updateOrganization } from './orgs/update-organization'
import { createProject } from './projects/create-project'
import { deleteProject } from './projects/delete-project'
import { getProject } from './projects/get-project'
import { getProjectsList } from './projects/get-projects-list'
import { updateProject } from './projects/update-project'
// ? Import the routes

// Create account
app.register(createAccount)

// Auth routes
app.register(authenticateWithPassword)
app.register(authenticateWithGithub)

// User profile
app.register(getUserProfile)

// User password
app.register(requestPasswordRecover)
app.register(resetUserPassword)

// Organizations
app.register(createOrganization)
app.register(getUserMembership)
app.register(getOrganization)
app.register(getOrganizations)
app.register(updateOrganization)
app.register(shutdownOrganization)
app.register(transferOrganization)

// Projects
app.register(createProject)
app.register(deleteProject)
app.register(getProject)
app.register(getProjectsList)
app.register(updateProject)

// Members
app.register(getMembers)
app.register(updateMember)
app.register(removeMember)

// Invites
app.register(createInvite)
app.register(getInvite)
app.register(getInvites)
app.register(acceptInvite)
app.register(rejectInvite)
app.register(revokeInvite)
app.register(getPendingInvites)

// Billing
app.register(getOrganizationBilling)
