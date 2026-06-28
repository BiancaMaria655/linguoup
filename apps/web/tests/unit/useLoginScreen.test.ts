import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLoginScreen } from '@/hooks/useLoginScreen'

// Mock useLogin from useApi
const mockMutateAsync = vi.fn()
vi.mock('@/hooks/useApi', () => ({
  useLogin: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  getErrorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('useLoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initialises with empty form and no errors', () => {
    const { result } = renderHook(() => useLoginScreen())

    expect(result.current.form.email).toBe('')
    expect(result.current.form.password).toBe('')
    expect(result.current.errors).toEqual({})
    expect(result.current.isLoading).toBe(false)
  })

  it('updates email field on change', () => {
    const { result } = renderHook(() => useLoginScreen())

    act(() => {
      result.current.handleChange('email')('user@example.com')
    })

    expect(result.current.form.email).toBe('user@example.com')
  })

  it('shows email error after blur when email is empty', () => {
    const { result } = renderHook(() => useLoginScreen())

    act(() => {
      result.current.handleBlur('email')()
    })

    expect(result.current.errors.email).toBe('Email is required')
  })

  it('shows email format error for invalid email', () => {
    const { result } = renderHook(() => useLoginScreen())

    act(() => {
      result.current.handleChange('email')('not-an-email')
    })
    act(() => {
      result.current.handleBlur('email')()
    })

    expect(result.current.errors.email).toBe('Enter a valid email')
  })

  it('clears email error when valid email is entered after blur', () => {
    const { result } = renderHook(() => useLoginScreen())

    act(() => {
      result.current.handleBlur('email')()
    })
    expect(result.current.errors.email).toBeTruthy()

    act(() => {
      result.current.handleChange('email')('user@example.com')
    })
    expect(result.current.errors.email).toBeUndefined()
  })

  it('does not submit when form is invalid', async () => {
    const { result } = renderHook(() => useLoginScreen())

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockMutateAsync).not.toHaveBeenCalled()
    expect(result.current.errors.email).toBeTruthy()
    expect(result.current.errors.password).toBeTruthy()
  })

  it('calls mutateAsync with correct credentials when form is valid', async () => {
    mockMutateAsync.mockResolvedValueOnce({})
    const { result } = renderHook(() => useLoginScreen())

    act(() => {
      result.current.handleChange('email')('user@example.com')
      result.current.handleChange('password')('secret123')
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    })
  })

  it('sets general error when login fails', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Invalid credentials'))
    const { result } = renderHook(() => useLoginScreen())

    act(() => {
      result.current.handleChange('email')('user@example.com')
      result.current.handleChange('password')('wrongpass')
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(result.current.errors.general).toBe('Invalid credentials')
  })

  it('toggles password visibility', () => {
    const { result } = renderHook(() => useLoginScreen())

    expect(result.current.showPassword).toBe(false)

    act(() => {
      result.current.togglePassword()
    })

    expect(result.current.showPassword).toBe(true)

    act(() => {
      result.current.togglePassword()
    })

    expect(result.current.showPassword).toBe(false)
  })
})
