'use client'

import { useOnboardingScreen } from '@/hooks/useOnboardingScreen'
import { Button, OptionCard, ErrorBanner } from '@/components/ui'
import type { LearningGoal, Language, DailyMinutes } from '@/types'

// ── Data ─────────────────────────────────────────────────────────────────────

const LEARNING_GOALS: { value: LearningGoal; label: string; description: string; icon: string }[] =
  [
    { value: 'travel', label: 'Travel', description: 'Get by confidently on trips', icon: '✈️' },
    { value: 'work', label: 'Work', description: 'Communicate in professional settings', icon: '💼' },
    { value: 'study', label: 'Study', description: 'Prepare for exams or university', icon: '📚' },
    { value: 'culture', label: 'Culture', description: 'Enjoy films, music, and books', icon: '🎭' },
    { value: 'family', label: 'Family', description: 'Talk with family or a partner', icon: '💛' },
    { value: 'other', label: 'Other reason', description: 'Something else entirely', icon: '✨' },
  ]

const LANGUAGES: { value: Language; label: string; nativeName: string; flag: string }[] = [
  { value: 'english', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { value: 'spanish', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { value: 'portuguese', label: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { value: 'french', label: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { value: 'german', label: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { value: 'italian', label: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { value: 'mandarin', label: 'Mandarin', nativeName: '普通话', flag: '🇨🇳' },
  { value: 'japanese', label: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { value: 'korean', label: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { value: 'arabic', label: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
]

const AVAILABILITY_OPTIONS: { value: DailyMinutes; label: string; description: string; badge?: string }[] =
  [
    { value: 5, label: '5 min / day', description: 'Just a quick daily habit', badge: 'Lightest' },
    { value: 10, label: '10 min / day', description: 'Steady progress without pressure' },
    { value: 15, label: '15 min / day', description: 'Solid results in a few months', badge: 'Most popular' },
    { value: 20, label: '20 min / day', description: 'Reach conversational level faster' },
    { value: 30, label: '30 min / day', description: 'Maximum progress', badge: 'Fastest' },
  ]

// ── Steps ─────────────────────────────────────────────────────────────────────

function GoalStep({
  selected,
  onSelect,
}: {
  selected?: LearningGoal
  onSelect: (goal: LearningGoal) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          What's your main goal?
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          We'll tailor your learning plan around it.
        </p>
      </div>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Learning goal">
        {LEARNING_GOALS.map((g) => (
          <OptionCard
            key={g.value}
            label={g.label}
            description={g.description}
            icon={g.icon}
            selected={selected === g.value}
            onClick={() => onSelect(g.value)}
          />
        ))}
      </div>
    </div>
  )
}

function LanguageStep({
  selected,
  onSelect,
  onBack,
}: {
  selected?: Language
  onSelect: (lang: Language) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Which language?
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          You can always add more languages later.
        </p>
      </div>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Target language">
        {LANGUAGES.map((l) => (
          <OptionCard
            key={l.value}
            label={l.label}
            description={l.nativeName}
            icon={l.flag}
            selected={selected === l.value}
            onClick={() => onSelect(l.value)}
          />
        ))}
      </div>
    </div>
  )
}

function AvailabilityStep({
  selected,
  onSelect,
  onBack,
}: {
  selected?: DailyMinutes
  onSelect: (mins: DailyMinutes) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          How much time each day?
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Even 5 minutes a day adds up over time.
        </p>
      </div>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Daily study time">
        {AVAILABILITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={selected === opt.value}
            onClick={() => onSelect(opt.value)}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              selected === opt.value
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                : 'border-neutral-200 bg-white hover:border-violet-300 hover:bg-violet-50/40 dark:border-neutral-700 dark:bg-neutral-900'
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span
                className={`text-sm font-medium ${
                  selected === opt.value ? 'text-violet-700 dark:text-violet-300' : 'text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {opt.label}
              </span>
              <span className="text-xs text-neutral-500">{opt.description}</span>
            </div>
            <div className="flex items-center gap-2">
              {opt.badge && (
                <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  {opt.badge}
                </span>
              )}
              {selected === opt.value && (
                <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function PlanStep({
  onboardingData,
  onConfirm,
  onBack,
  isSubmitting,
  error,
}: {
  onboardingData: ReturnType<typeof useOnboardingScreen>['onboardingData']
  onConfirm: () => void
  onBack: () => void
  isSubmitting: boolean
  error: string | null
}) {
  const lang = LANGUAGES.find((l) => l.value === onboardingData.targetLanguage)
  const goal = LEARNING_GOALS.find((g) => g.value === onboardingData.learningGoal)
  const mins = onboardingData.dailyMinutes ?? 10
  const weeksToConversational = Math.ceil((120 - mins) / 10) + 8 // rough estimate

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Your plan is ready
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Personalised just for you. Here's what to expect.
        </p>
      </div>

      {/* Plan summary card */}
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 dark:border-violet-800 dark:from-violet-950/30 dark:to-indigo-950/20">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{lang?.flag}</span>
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white">
              {lang?.label} for {goal?.label.toLowerCase()}
            </p>
            <p className="text-sm text-neutral-500">{onboardingData.dailyMinutes} min/day</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Daily lessons', value: '1–2' },
            { label: 'Weekly minutes', value: `${(onboardingData.dailyMinutes ?? 10) * 7}` },
            {
              label: 'First milestone',
              value: `${Math.ceil(weeksToConversational / 2)}w`,
            },
            {
              label: 'Est. conversational',
              value: `${weeksToConversational}w`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white/60 p-3 dark:bg-neutral-900/40"
            >
              <p className="text-xs text-neutral-500">{stat.label}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
        <span className="font-medium">Before you start —</span> a quick level check helps us pitch lessons at the right difficulty.
      </div>

      {error && <ErrorBanner message={error} />}

      <Button fullWidth size="lg" isLoading={isSubmitting} onClick={onConfirm}>
        Take the level assessment →
      </Button>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const {
    currentStep,
    onboardingData,
    isSubmitting,
    error,
    goBack,
    selectGoal,
    selectLanguage,
    selectAvailability,
    confirmPlan,
  } = useOnboardingScreen()

  if (currentStep === 'goal') {
    return (
      <GoalStep
        selected={onboardingData.learningGoal}
        onSelect={selectGoal}
      />
    )
  }

  if (currentStep === 'language') {
    return (
      <LanguageStep
        selected={onboardingData.targetLanguage}
        onSelect={selectLanguage}
        onBack={goBack}
      />
    )
  }

  if (currentStep === 'availability') {
    return (
      <AvailabilityStep
        selected={onboardingData.dailyMinutes}
        onSelect={selectAvailability}
        onBack={goBack}
      />
    )
  }

  return (
    <PlanStep
      onboardingData={onboardingData}
      onConfirm={confirmPlan}
      onBack={goBack}
      isSubmitting={isSubmitting}
      error={error}
    />
  )
}
