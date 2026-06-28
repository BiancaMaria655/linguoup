'use client'

import { useAuthStore } from '@/store/authStore'
import { ProgressBar } from '@/components/ui'

const ONBOARDING_STEPS = ['Your goal', 'Language', 'Schedule', 'Your plan']

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { onboardingStep } = useAuthStore()

  const displayStep = Math.min(onboardingStep, ONBOARDING_STEPS.length - 1)
  const stepLabel = ONBOARDING_STEPS[displayStep]

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {/* Fixed top progress bar */}
      <header className="sticky top-0 z-10 flex flex-col gap-3 bg-white/90 px-5 pb-3 pt-4 backdrop-blur-sm dark:bg-neutral-950/90">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-widest text-violet-500">
            Setup
          </span>
          <span className="text-xs text-neutral-400">
            {displayStep + 1} / {ONBOARDING_STEPS.length}
          </span>
        </div>
        <ProgressBar
          current={displayStep + 1}
          total={ONBOARDING_STEPS.length}
          label={stepLabel}
        />
      </header>

      <main className="flex flex-1 flex-col px-5 pb-10 pt-6">{children}</main>
    </div>
  )
}
