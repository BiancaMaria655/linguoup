import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useOnboarding, getErrorMessage } from '@/hooks/useApi'
import type { LearningGoal, Language, DailyMinutes } from '@/types'

export type OnboardingStepId =
  | 'goal'
  | 'language'
  | 'availability'
  | 'plan'

const STEP_ORDER: OnboardingStepId[] = [
  'goal',
  'language',
  'availability',
  'plan',
]

export function useOnboardingScreen() {
  const {
    onboardingData,
    onboardingStep,
    setOnboardingData,
    setOnboardingStep,
  } = useAuthStore()

  const router = useRouter()
  const onboardingMutation = useOnboarding()

  const currentStep = STEP_ORDER[onboardingStep] ?? 'goal'
  const isFirstStep = onboardingStep === 0
  const isLastStep = onboardingStep === STEP_ORDER.length - 1

  const goBack = useCallback(() => {
    if (isFirstStep) {
      router.push('/register')
      return
    }
    setOnboardingStep(onboardingStep - 1)
  }, [isFirstStep, onboardingStep, setOnboardingStep, router])

  const selectGoal = useCallback(
    (goal: LearningGoal) => {
      setOnboardingData({ learningGoal: goal })
      setOnboardingStep(1)
    },
    [setOnboardingData, setOnboardingStep]
  )

  const selectLanguage = useCallback(
    (language: Language) => {
      setOnboardingData({ targetLanguage: language })
      setOnboardingStep(2)
    },
    [setOnboardingData, setOnboardingStep]
  )

  const selectAvailability = useCallback(
    (minutes: DailyMinutes) => {
      setOnboardingData({ dailyMinutes: minutes })
      setOnboardingStep(3)
    },
    [setOnboardingData, setOnboardingStep]
  )

  const confirmPlan = useCallback(async () => {
    if (
      !onboardingData.learningGoal ||
      !onboardingData.targetLanguage ||
      !onboardingData.dailyMinutes
    ) {
      return
    }

    await onboardingMutation.mutateAsync({
      learningGoal: onboardingData.learningGoal,
      targetLanguage: onboardingData.targetLanguage,
      dailyMinutes: onboardingData.dailyMinutes,
    })
  }, [onboardingData, onboardingMutation])

  return {
    currentStep,
    onboardingData,
    onboardingStep,
    isFirstStep,
    isLastStep,
    isSubmitting: onboardingMutation.isPending,
    error: onboardingMutation.error
      ? getErrorMessage(onboardingMutation.error)
      : null,
    goBack,
    selectGoal,
    selectLanguage,
    selectAvailability,
    confirmPlan,
  }
}
