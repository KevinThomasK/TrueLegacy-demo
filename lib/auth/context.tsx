'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserProfile, UserRole } from './roles'

interface AuthUser {
  id: string
  email: string
  created_at?: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  role: UserRole | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      const data = await res.json()

      if (data.user && data.profile) {
        setUser(data.user)
        setProfile(data.profile)
        setRole(data.profile.role as UserRole)
      } else {
        setUser(null)
        setProfile(null)
        setRole(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
      setProfile(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()

    const handleAuthUpdate = () => {
      setLoading(true)
      fetchUser()
    }

    window.addEventListener('auth-update', handleAuthUpdate)
    return () => window.removeEventListener('auth-update', handleAuthUpdate)
  }, [])

  const signOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
    setUser(null)
    setProfile(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isAuthenticated: !!user,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
