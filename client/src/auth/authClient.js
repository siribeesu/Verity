import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

const env = import.meta.env ?? {}
const authority = env.VITE_OIDC_AUTHORITY
const clientId = env.VITE_OIDC_CLIENT_ID
const resource = env.VITE_OIDC_RESOURCE
const scope = env.VITE_OIDC_SCOPE

export const oidcConfigured = Boolean(authority && clientId)

export const oidcManager = oidcConfigured && typeof window !== 'undefined'
  ? new UserManager({
    authority,
    client_id: clientId,
    redirect_uri: env.VITE_OIDC_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    post_logout_redirect_uri: env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI || window.location.origin,
    response_type: 'code',
    scope: scope || 'openid profile email',
    automaticSilentRenew: false,
    userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    ...(resource ? { extraQueryParams: { resource } } : {}),
  })
  : null

export async function getAccessToken() {
  if (!oidcManager) return null
  const user = await oidcManager.getUser()
  return user && !user.expired ? user.access_token : null
}