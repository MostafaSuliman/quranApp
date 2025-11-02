import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AuthProvider = 'guest' | 'email' | 'google' | 'apple'
export type SocialProvider = 'google' | 'apple'
export type VerificationStatus = 'idle' | 'sending' | 'code-sent' | 'verifying' | 'verified' | 'error'

export interface User {
  id: string
  email?: string
  displayName: string
  hasCompletedOnboarding: boolean
  createdAt: string
  lastLoginAt: string
  isGuest: boolean
  emailVerified?: boolean
  authProvider?: AuthProvider
  avatarUrl?: string
  linkedProviders?: SocialProvider[]
}

export interface SocialAccountLink {
  linked: boolean
  linkedAt?: string
  providerId?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  verificationStatus: VerificationStatus
  verificationEmail: string | null
  verificationError: string | null
  verificationResendAvailableAt: number | null
  socialAccounts: Record<SocialProvider, SocialAccountLink>
  socialLinkStatus: Record<SocialProvider, 'idle' | 'linking' | 'unlinking' | 'error'>
  verificationCodePreview?: string
  
  // Actions
  initialize: () => Promise<void>
  signInAsGuest: (displayName: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  completeOnboarding: () => void
  setError: (error: string | null) => void
  clearError: () => void
  startEmailVerification: (email: string) => Promise<void>
  verifyEmailCode: (code: string) => Promise<void>
  resendVerification: () => Promise<void>
  signInWithProvider: (provider: SocialProvider) => Promise<void>
  linkSocialAccount: (provider: SocialProvider) => Promise<void>
  unlinkSocialAccount: (provider: SocialProvider) => Promise<void>
}

const VERIFICATION_TTL = 1000 * 60 * 10 // 10 minutes
const VERIFICATION_COOLDOWN = 1000 * 60 // 1 minute

const createDefaultSocialAccounts = (): Record<SocialProvider, SocialAccountLink> => ({
  google: { linked: false },
  apple: { linked: false }
})

const createDefaultSocialLinkStatus = (): Record<SocialProvider, 'idle' | 'linking' | 'unlinking' | 'error'> => ({
  google: 'idle',
  apple: 'idle'
})

let activeVerificationCode: string | null = null
let activeVerificationExpiresAt: number | null = null

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      verificationStatus: 'idle',
      verificationEmail: null,
      verificationError: null,
      verificationResendAvailableAt: null,
      socialAccounts: createDefaultSocialAccounts(),
      socialLinkStatus: createDefaultSocialLinkStatus(),
      verificationCodePreview: undefined,

      // Initialize authentication state
      initialize: async () => {
        set({ isLoading: true })
        
        try {
          // Check if user was previously signed in
          const state = get()
          if (state.user) {
            set({ 
              isAuthenticated: true,
              user: {
                ...state.user,
                lastLoginAt: new Date().toISOString()
              }
            })
          } else {
            set({
              socialAccounts: createDefaultSocialAccounts(),
              socialLinkStatus: createDefaultSocialLinkStatus(),
              verificationStatus: 'idle',
              verificationEmail: null,
              verificationError: null,
              verificationResendAvailableAt: null,
              verificationCodePreview: undefined
            })
          }
        } catch (error) {
          console.error('Auth initialization failed:', error)
          set({ error: 'Failed to restore session' })
        } finally {
          set({ isLoading: false })
        }
      },

      // Sign in as guest (no email required)
      signInAsGuest: async (displayName: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const user: User = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            displayName: displayName.trim(),
            hasCompletedOnboarding: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            isGuest: true,
            emailVerified: false,
            authProvider: 'guest',
            linkedProviders: []
          }
          
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false,
            verificationStatus: 'idle',
            verificationEmail: null,
            verificationError: null
          })
          
        } catch (error) {
          console.error('Guest sign in failed:', error)
          set({ 
            error: 'Failed to sign in as guest',
            isLoading: false
          })
        }
      },

      // Sign in with email (future implementation)
      signInWithEmail: async (email: string, _password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // TODO: Implement actual email authentication
          // For now, create a mock user
          const user: User = {
            id: `user_${Date.now()}`,
            email,
            displayName: email.split('@')[0],
            hasCompletedOnboarding: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            isGuest: false,
            emailVerified: true,
            authProvider: 'email',
            linkedProviders: []
          }
          
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false,
            verificationStatus: 'verified',
            verificationEmail: email,
            verificationError: null
          })
          
        } catch (error) {
          console.error('Email sign in failed:', error)
          set({ 
            error: 'Failed to sign in with email',
            isLoading: false
          })
        }
      },

      // Sign up with email (future implementation)
      signUp: async (email: string, _password: string, displayName: string) => {
        set({ isLoading: true, error: null })
        
        try {
          // TODO: Implement actual email signup
          // For now, create a mock user
          const user: User = {
            id: `user_${Date.now()}`,
            email,
            displayName: displayName.trim(),
            hasCompletedOnboarding: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            isGuest: false,
            emailVerified: false,
            authProvider: 'email',
            linkedProviders: []
          }
          
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false,
            verificationStatus: 'idle',
            verificationEmail: email,
            verificationError: null
          })
          
        } catch (error) {
          console.error('Sign up failed:', error)
          set({ 
            error: 'Failed to create account',
            isLoading: false
          })
        }
      },

      startEmailVerification: async (rawEmail: string) => {
        const email = rawEmail.trim().toLowerCase()
        const now = Date.now()
        const { verificationResendAvailableAt, user } = get()

        if (!emailRegex.test(email)) {
          set({
            verificationStatus: 'error',
            verificationError: 'Please provide a valid email address.'
          })
          return
        }

        if (verificationResendAvailableAt && verificationResendAvailableAt > now) {
          const secondsLeft = Math.ceil((verificationResendAvailableAt - now) / 1000)
          set({
            verificationStatus: 'error',
            verificationError: `Please wait ${secondsLeft}s before requesting a new code.`
          })
          return
        }

        set({
          isLoading: true,
          verificationStatus: 'sending',
          verificationError: null
        })

        await new Promise((resolve) => setTimeout(resolve, 350))

        activeVerificationCode = generateVerificationCode()
        activeVerificationExpiresAt = Date.now() + VERIFICATION_TTL

        set((state) => ({
          isLoading: false,
          verificationStatus: 'code-sent',
          verificationEmail: email,
          verificationError: null,
          verificationResendAvailableAt: Date.now() + VERIFICATION_COOLDOWN,
          verificationCodePreview: activeVerificationCode ?? undefined,
          user: state.user
            ? {
                ...state.user,
                email,
                emailVerified: state.user.emailVerified ?? false
              }
            : state.user
        }))

        // Persist email to guest user if none exists
        if (!user) {
          set({
            user: {
              id: `user_${Date.now()}`,
              email,
              displayName: email.split('@')[0],
              hasCompletedOnboarding: false,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              isGuest: false,
              emailVerified: false,
              authProvider: 'email',
              linkedProviders: []
            },
            isAuthenticated: true
          })
        }
      },

      verifyEmailCode: async (rawCode: string) => {
        const code = rawCode.trim()
        if (!activeVerificationCode || !activeVerificationExpiresAt || Date.now() > activeVerificationExpiresAt) {
          set({
            verificationStatus: 'error',
            verificationError: 'Verification code expired. Please request a new one.'
          })
          activeVerificationCode = null
          activeVerificationExpiresAt = null
          return
        }

        set({
          isLoading: true,
          verificationStatus: 'verifying',
          verificationError: null
        })

        await new Promise((resolve) => setTimeout(resolve, 300))

        if (code !== activeVerificationCode) {
          set({
            isLoading: false,
            verificationStatus: 'error',
            verificationError: 'That verification code is incorrect. Please try again.',
            verificationCodePreview: activeVerificationCode ?? undefined
          })
          return
        }

        const state = get()
        const email = state.verificationEmail ?? state.user?.email
        const timestamp = new Date().toISOString()
        const existingUser = state.user

        const nextUser: User = existingUser
          ? {
              ...existingUser,
              email,
              emailVerified: true,
              isGuest: false,
              lastLoginAt: timestamp,
              authProvider: existingUser.authProvider === 'guest' ? 'email' : existingUser.authProvider ?? 'email'
            }
          : {
              id: `user_${Date.now()}`,
              email,
              displayName: email?.split('@')[0] ?? 'Quran Student',
              hasCompletedOnboarding: false,
              createdAt: timestamp,
              lastLoginAt: timestamp,
              isGuest: false,
              emailVerified: true,
              authProvider: 'email',
              linkedProviders: []
            }

        activeVerificationCode = null
        activeVerificationExpiresAt = null

        set({
          user: nextUser,
          isAuthenticated: true,
          isLoading: false,
          verificationStatus: 'verified',
          verificationError: null,
          verificationCodePreview: undefined
        })
      },

      resendVerification: async () => {
        const { verificationEmail } = get()
        if (!verificationEmail) {
          set({
            verificationStatus: 'error',
            verificationError: 'No email available for verification. Please enter your email address.'
          })
          return
        }
        await get().startEmailVerification(verificationEmail)
      },

      signInWithProvider: async (provider: SocialProvider) => {
        await get().linkSocialAccount(provider)
      },

      linkSocialAccount: async (provider: SocialProvider) => {
        const state = get()
        if (state.socialAccounts[provider]?.linked) {
          return
        }

        set({
          socialLinkStatus: {
            ...state.socialLinkStatus,
            [provider]: 'linking'
          },
          error: null
        })

        await new Promise((resolve) => setTimeout(resolve, 320))

        const currentState = get()
        const timestamp = new Date().toISOString()
        const existingUser = currentState.user

        const updatedUser: User = existingUser
          ? {
              ...existingUser,
              isGuest: false,
              emailVerified: true,
              lastLoginAt: timestamp,
              authProvider:
                existingUser.authProvider && existingUser.authProvider !== 'guest'
                  ? existingUser.authProvider
                  : provider,
              linkedProviders: Array.from(
                new Set([...(existingUser.linkedProviders ?? []), provider])
              )
            }
          : {
              id: `${provider}_${Date.now()}`,
              displayName: provider === 'google' ? 'Google User' : 'Apple User',
              hasCompletedOnboarding: false,
              createdAt: timestamp,
              lastLoginAt: timestamp,
              isGuest: false,
              emailVerified: true,
              authProvider: provider,
              linkedProviders: [provider]
            }

        const updatedSocialAccounts = {
          ...currentState.socialAccounts,
          [provider]: {
            linked: true,
            linkedAt: timestamp
          }
        }

        set({
          user: updatedUser,
          isAuthenticated: true,
          socialAccounts: updatedSocialAccounts,
          socialLinkStatus: {
            ...currentState.socialLinkStatus,
            [provider]: 'idle'
          },
          verificationStatus: currentState.verificationStatus === 'code-sent' ? 'code-sent' : currentState.verificationStatus
        })
      },

      unlinkSocialAccount: async (provider: SocialProvider) => {
        const state = get()
        if (!state.socialAccounts[provider]?.linked) {
          return
        }
        if (!state.user) {
          return
        }

        set({
          socialLinkStatus: {
            ...state.socialLinkStatus,
            [provider]: 'unlinking'
          }
        })

        await new Promise((resolve) => setTimeout(resolve, 250))

        const currentState = get()
        const user = currentState.user
        if (!user) {
          set({
            socialLinkStatus: {
              ...currentState.socialLinkStatus,
              [provider]: 'idle'
            }
          })
          return
        }

        const remainingProviders = (user.linkedProviders ?? []).filter((p) => p !== provider)
        const updatedSocialAccounts: Record<SocialProvider, SocialAccountLink> = {
          ...currentState.socialAccounts,
          [provider]: { linked: false }
        }

        let nextProvider: AuthProvider = user.authProvider ?? 'guest'
        let isGuest = user.isGuest

        if (remainingProviders.length > 0) {
          nextProvider = remainingProviders[0]
          isGuest = nextProvider === 'guest'
        } else if (user.email && user.emailVerified) {
          nextProvider = 'email'
          isGuest = false
        } else {
          nextProvider = 'guest'
          isGuest = true
        }

        set({
          user: {
            ...user,
            linkedProviders: remainingProviders,
            authProvider: nextProvider,
            isGuest
          },
          socialAccounts: updatedSocialAccounts,
          socialLinkStatus: {
            ...currentState.socialLinkStatus,
            [provider]: 'idle'
          }
        })
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true })
        
        try {
          // Clear user data
          set({ 
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
            verificationStatus: 'idle',
            verificationEmail: null,
            verificationError: null,
            verificationResendAvailableAt: null,
            socialAccounts: createDefaultSocialAccounts(),
            socialLinkStatus: createDefaultSocialLinkStatus(),
            verificationCodePreview: undefined
          })

          activeVerificationCode = null
          activeVerificationExpiresAt = null

          // Clear other stores if needed
          localStorage.removeItem('progress-store')
          localStorage.removeItem('preferences-store')
          
        } catch (error) {
          console.error('Sign out failed:', error)
          set({ 
            error: 'Failed to sign out',
            isLoading: false
          })
        }
      },

      // Update user profile
      updateProfile: async (updates: Partial<User>) => {
        const { user } = get()
        if (!user) {
          set({ error: 'No user to update' })
          return
        }
        
        set({ isLoading: true, error: null })
        
        try {
          const updatedUser: User = {
            ...user,
            ...updates,
            lastLoginAt: new Date().toISOString()
          }
          
          set({ 
            user: updatedUser,
            isLoading: false
          })
          
        } catch (error) {
          console.error('Profile update failed:', error)
          set({ 
            error: 'Failed to update profile',
            isLoading: false
          })
        }
      },

      // Logout alias for signOut
      logout: async () => {
        return get().signOut()
      },

      // Set user directly
      setUser: (user: User | null) => {
        set({ 
          user: user
            ? {
                ...user,
                authProvider: user.authProvider ?? (user.isGuest ? 'guest' : 'email'),
                linkedProviders: user.linkedProviders ?? (user.authProvider && user.authProvider !== 'guest' ? [user.authProvider] : [])
              }
            : null,
          isAuthenticated: !!user
        })
      },

      // Mark onboarding as complete
      completeOnboarding: () => {
        const { user } = get()
        if (user) {
          set({ 
            user: {
              ...user,
              hasCompletedOnboarding: true
            }
          })
        }
      },

      // Error handling
      setError: (error: string | null) => set({ error }),
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      // Persist user data and auth state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        socialAccounts: state.socialAccounts
      })
    }
  )
)
