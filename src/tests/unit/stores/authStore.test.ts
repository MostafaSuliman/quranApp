import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../../../stores/authStore'

const resetAuthStore = async () => {
  await useAuthStore.getState().signOut()
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    verificationStatus: 'idle',
    verificationEmail: null,
    verificationError: null,
    verificationResendAvailableAt: null,
    socialAccounts: {
      google: { linked: false },
      apple: { linked: false }
    },
    socialLinkStatus: {
      google: 'idle',
      apple: 'idle'
    },
    verificationCodePreview: undefined
  })
  await useAuthStore.persist?.clearStorage?.()
}

describe('useAuthStore verification & social linking', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    await resetAuthStore()
  })

  afterEach(async () => {
    await resetAuthStore()
    vi.useRealTimers()
  })

  it('rejects invalid email addresses for verification', async () => {
    await useAuthStore.getState().startEmailVerification('invalid-email')
    const { verificationStatus, verificationError } = useAuthStore.getState()
    expect(verificationStatus).toBe('error')
    expect(verificationError).toBeTruthy()
  })

  it('sends and verifies email codes', async () => {
    const sendPromise = useAuthStore.getState().startEmailVerification('user@example.com')
    await vi.advanceTimersByTimeAsync(400)
    await sendPromise

    let state = useAuthStore.getState()
    expect(state.verificationStatus).toBe('code-sent')
    expect(state.verificationEmail).toBe('user@example.com')
    expect(state.verificationCodePreview).toBeDefined()

    const wrongCodePromise = useAuthStore.getState().verifyEmailCode('000000')
    await vi.advanceTimersByTimeAsync(320)
    await wrongCodePromise

    state = useAuthStore.getState()
    expect(state.verificationStatus).toBe('error')

    const code = state.verificationCodePreview
    expect(code).toBeDefined()

    const correctPromise = useAuthStore.getState().verifyEmailCode(code ?? '')
    await vi.advanceTimersByTimeAsync(320)
    await correctPromise

    state = useAuthStore.getState()
    expect(state.verificationStatus).toBe('verified')
    expect(state.user?.emailVerified).toBe(true)
    expect(state.user?.email).toBe('user@example.com')
  })

  it('links social providers and updates user state', async () => {
    const linkPromise = useAuthStore.getState().linkSocialAccount('google')
    await vi.advanceTimersByTimeAsync(340)
    await linkPromise

    const state = useAuthStore.getState()
    expect(state.socialAccounts.google.linked).toBe(true)
    expect(state.user?.authProvider).toBe('google')
    expect(state.isAuthenticated).toBe(true)
  })
})
