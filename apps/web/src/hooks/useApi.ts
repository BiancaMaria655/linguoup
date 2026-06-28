import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi, onboardingApi, assessmentApi, ApiError } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type {
  LoginRequest,
  RegisterRequest,
  OnboardingData,
  AssessmentAnswer,
} from '@/types'

// ── Auth mutations ──────────────────────────────────────────────────────────

export function useRegister() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: ({ user, tokens }) => {
      setAuth(user, tokens)
      router.push('/onboarding')
    },
  })
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: ({ user, tokens }) => {
      setAuth(user, tokens)
      if (user.onboardingCompleted) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    },
  })
}

export function useLogout() {
  const { tokens, clearAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: () => {
      if (tokens?.accessToken) {
        return authApi.logout(tokens.accessToken)
      }
      return Promise.resolve()
    },
    onSettled: () => {
      clearAuth()
      router.push('/login')
    },
  })
}

// ── Onboarding mutation ─────────────────────────────────────────────────────

export function useOnboarding() {
  const { tokens, updateUser, setOnboardingStep } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: OnboardingData) => {
      if (!tokens?.accessToken) throw new Error('Not authenticated')
      return onboardingApi.submit(data, tokens.accessToken)
    },
    onSuccess: ({ user }) => {
      updateUser(user)
      setOnboardingStep(4) // moves to assessment step
      router.push('/assessment')
    },
  })
}

// ── Assessment queries/mutations ─────────────────────────────────────────────

export function useStartAssessment() {
  const { tokens } = useAuthStore()

  return useQuery({
    queryKey: ['assessment', 'session'],
    queryFn: () => {
      if (!tokens?.accessToken) throw new Error('Not authenticated')
      return assessmentApi.start(tokens.accessToken)
    },
    staleTime: Infinity, // session data doesn't change mid-flow
  })
}

export function useSubmitAssessment() {
  const { tokens, updateUser } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: ({
      sessionId,
      answers,
    }: {
      sessionId: string
      answers: AssessmentAnswer[]
    }) => {
      if (!tokens?.accessToken) throw new Error('Not authenticated')
      return assessmentApi.submit(sessionId, answers, tokens.accessToken)
    },
    onSuccess: (result) => {
      updateUser({ level: result.level, assessmentCompleted: true })
      router.push(`/assessment/result?level=${result.level}`)
    },
  })
}

// ── Error helpers ────────────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Try again.'
}
