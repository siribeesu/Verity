import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  signinRedirect: vi.fn(),
  signoutRedirect: vi.fn(),
  addUserLoaded: vi.fn(),
  removeUserLoaded: vi.fn(),
  addUserUnloaded: vi.fn(),
  removeUserUnloaded: vi.fn(),
  addAccessTokenExpired: vi.fn(),
  removeAccessTokenExpired: vi.fn(),
  clearAllHistory: vi.fn(),
}))

vi.mock('./authClient', () => ({
  oidcManager: {
    getUser: authMocks.getUser,
    signinRedirect: authMocks.signinRedirect,
    signoutRedirect: authMocks.signoutRedirect,
    events: {
      addUserLoaded: authMocks.addUserLoaded,
      removeUserLoaded: authMocks.removeUserLoaded,
      addUserUnloaded: authMocks.addUserUnloaded,
      removeUserUnloaded: authMocks.removeUserUnloaded,
      addAccessTokenExpired: authMocks.addAccessTokenExpired,
      removeAccessTokenExpired: authMocks.removeAccessTokenExpired,
    },
  },
}))
vi.mock('../utils/historyStorage', () => ({ clearAllHistory: authMocks.clearAllHistory }))

import { AuthProvider, useAuth } from './AuthProvider'

function AuthStatus() {
  const { state, user, signIn, signOut } = useAuth()
  return (
    <div>
      <span data-testid="auth-state">{state}</span>
      <span data-testid="auth-user">{user?.profile?.sub || ''}</span>
      <button onClick={signIn}>Sign in</button>
      <button onClick={signOut}>Sign out</button>
    </div>
  )
}

beforeEach(() => {
  authMocks.getUser.mockReset()
  authMocks.signinRedirect.mockReset()
  authMocks.signoutRedirect.mockReset()
  authMocks.clearAllHistory.mockReset()
  authMocks.getUser.mockResolvedValue(null)
  authMocks.signinRedirect.mockResolvedValue(undefined)
  authMocks.signoutRedirect.mockResolvedValue(undefined)
  window.history.replaceState({}, '', '/')
})

afterEach(() => cleanup())

test('AuthProvider enters signed-out state and starts OIDC login', async () => {
  render(<AuthProvider><AuthStatus /></AuthProvider>)

  await waitFor(() => expect(screen.getByTestId('auth-state').textContent).toBe('unauthenticated'))
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  await waitFor(() => expect(authMocks.signinRedirect).toHaveBeenCalledOnce())
})

test('AuthProvider exposes the current account and clears local history on sign-out', async () => {
  authMocks.getUser.mockResolvedValue({
    expired: false,
    profile: { sub: 'user-42' },
    access_token: 'access-token',
  })
  render(<AuthProvider><AuthStatus /></AuthProvider>)

  await waitFor(() => expect(screen.getByTestId('auth-state').textContent).toBe('authenticated'))
  expect(screen.getByTestId('auth-user').textContent).toBe('user-42')
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

  await waitFor(() => expect(authMocks.signoutRedirect).toHaveBeenCalledOnce())
  expect(authMocks.clearAllHistory).toHaveBeenCalledOnce()
  expect(screen.getByTestId('auth-state').textContent).toBe('unauthenticated')
})