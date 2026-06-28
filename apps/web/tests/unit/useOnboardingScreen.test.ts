import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOnboardingScreen } from '@/hooks/useOnboardingScreen'

const mockMutateAsync = vi.fn()
const mockSetOnboardingData = vi.fn()
const mockSetOnboardingStep = vi.fn()
const mockRouterPush = vi.fn()

let mockStep = 0
let mockData = {}

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    onboardingData: mockData,
    onboardingStep: mockStep,
    setOnboardingData: mockSetOnboardingData,
    setOnboardingStep: mockSetOnboardingStep,
  }),
}))

vi.mock('@/hooks/useApi', () => ({
  useOnboarding: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  }),
  getErrorMessage: (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong.',
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

describe('useOnboardingScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStep = 0
    mockData = {}
  })

  it('starts at goal step', () => {
    const { result } = renderHook(() => useOnboardingScreen())
    expect(result.current.currentStep).toBe('goal')
    expect(result.current.isFirstStep).toBe(true)
    expect(result.current.isLastStep).toBe(false)
  })

  it('selectGoal saves data and advances to language step', () => {
    const { result } = renderHook(() => useOnboardingScreen())

    act(() => {
      result.current.selectGoal('travel')
    })

    expect(mockSetOnboardingData).toHaveBeenCalledWith({ learningGoal: 'travel' })
    expect(mockSetOnboardingStep).toHaveBeenCalledWith(1)
  })

  it('selectLanguage saves data and advances to availability step', () => {
    mockStep = 1
    const { result } = renderHook(() => useOnboardingScreen())

    act(() => {
      result.current.selectLanguage('spanish')
    })

    expect(mockSetOnboardingData).toHaveBeenCalledWith({ targetLanguage: 'spanish' })
    expect(mockSetOnboardingStep).toHaveBeenCalledWith(2)
  })

  it('selectAvailability saves data and advances to plan step', () => {
    mockStep = 2
    const { result } = renderHook(() => useOnboardingScreen())

    act(() => {
      result.current.selectAvailability(15)
    })

    expect(mockSetOnboardingData).toHaveBeenCalledWith({ dailyMinutes: 15 })
    expect(mockSetOnboardingStep).toHaveBeenCalledWith(3)
  })

  it('goBack from goal navigates to register', () => {
    mockStep = 0
    const { result } = renderHook(() => useOnboardingScreen())

    act(() => {
      result.current.goBack()
    })

    expect(mockRouterPush).toHaveBeenCalledWith('/register')
  })

  it('goBack from language goes back to goal', () => {
    mockStep = 1
    const { result } = renderHook(() => useOnboardingScreen())

    act(() => {
      result.current.goBack()
    })

    expect(mockSetOnboardingStep).toHaveBeenCalledWith(0)
  })

  it('confirmPlan does not submit if data is incomplete', async () => {
    mockStep = 3
    mockData = { learningGoal: 'travel' } // missing targetLanguage and dailyMinutes
    const { result } = renderHook(() => useOnboardingScreen())

    await act(async () => {
      await result.current.confirmPlan()
    })

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('confirmPlan submits with complete data', async () => {
    mockStep = 3
    mockData = {
      learningGoal: 'travel',
      targetLanguage: 'spanish',
      dailyMinutes: 15,
    }
    mockMutateAsync.mockResolvedValueOnce({})
    const { result } = renderHook(() => useOnboardingScreen())

    await act(async () => {
      await result.current.confirmPlan()
    })

    expect(mockMutateAsync).toHaveBeenCalledWith({
      learningGoal: 'travel',
      targetLanguage: 'spanish',
      dailyMinutes: 15,
    })
  })

  it('isLastStep is true at plan step (index 3)', () => {
    mockStep = 3
    const { result } = renderHook(() => useOnboardingScreen())
    expect(result.current.isLastStep).toBe(true)
  })
})
