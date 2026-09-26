import { createContext, useContext, useEffect, useState } from 'react'
import { clearAllHistory } from '../utils/historyStorage'
import { oidcManager } from './authClient'

const AuthContext = createContext(null)
const callbackPath = '/auth/callback'
const productionBuild = Boolean(import.meta.env?.PROD)

export function AuthProvider({ children }) {
  const [state, setState] = useState(
    oidcManager ? 'loading' : productionBuild ? 'misconfigured' : 'disabled'
  )
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!oidcManager) return undefined

    let active = true
    const updateUser = (nextUser) => {
      if (!active) return
      if (nextUser && !nextUser.expired) {
        setUser(nextUser)
        setState('authenticated')
      } else {
        setUser(null)
        setState('unauthenticated')
      }
    }
    const handleExpiration = () => {
      clearAllHistory()
      updateUser(null)
    }

    oidcManager.events.addUserLoaded(updateUser)
    oidcManager.events.addUserUnloaded(handleExpiration)
    oidcManager.events.addAccessTokenExpired(handleExpiration)

    async function initialize() {
      try {
        let currentUser
        if (window.location.pathname === callbackPath) {
          currentUser = await oidcManager.signinRedirectCallback()
          window.history.replaceState({}, document.title, '/')
        } else {
          currentUser = await oidcManager.getUser()
        }
        updateUser(currentUser)
      } catch {
        if (active) setState('error')
      }
    }

    initialize()

    return () => {
      active = false
      oidcManager.events.removeUserLoaded(updateUser)
      oidcManager.events.removeUserUnloaded(handleExpiration)
      oidcManager.events.removeAccessTokenExpired(handleExpiration)
    }
  }, [])

  async function signIn() {
    if (!oidcManager) return
    try {
      await oidcManager.signinRedirect()
    } catch {
      setState('error')
    }
  }

  async function signOut() {
    clearAllHistory()
    setUser(null)
    setState('unauthenticated')
    if (oidcManager) {
      try {
        await oidcManager.signoutRedirect()
      } catch {
        setState('unauthenticated')
      }
    }
  }

  return (
    <AuthContext.Provider value={{ state, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}