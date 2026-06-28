'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui'
import type { ProficiencyLevel } from '@/types'

const LEVEL_DESCRIPTIONS: Record<
  ProficiencyLevel,
  { label: string; description: string; color: string; advice: string }
> = {
  A1: {
    label: 'Beginner',
    description: "You're just starting out — every word counts.",
    color: 'from-sky-400 to-blue-500',
    advice: 'Start with everyday vocabulary and basic greetings.',
  },
  A2: {
    label: 'Elementary',
    description: 'You can handle simple phrases and familiar topics.',
    color: 'from-teal-400 to-emerald-500',
    advice: 'Focus on building sentence structures and common verbs.',
  },
  B1: {
    label: 'Intermediate',
    description: 'You can manage most travel situations and everyday conversations.',
    color: 'from-violet-400 to-violet-600',
    advice: 'Grow your vocabulary and start consuming native content.',
  },
  B2: {
    label: 'Upper-intermediate',
    description: 'You express yourself fluently on a wide range of topics.',
    color: 'from-amber-400 to-orange-500',
    advice: 'Refine your grammar and tackle complex reading.',
  },
  C1: {
    label: 'Advanced',
    description: 'You communicate spontaneously and effectively in demanding situations.',
    color: 'from-rose-400 to-pink-500',
    advice: 'Push into nuance, idioms, and professional vocabulary.',
  },
  C2: {
    label: 'Mastery',
    description: 'You understand virtually everything with ease and precision.',
    color: 'from-yellow-400 to-amber-500',
    advice: 'Maintain your level and explore regional varieties.',
  },
}

const CEFR_LEVELS: ProficiencyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function ResultContent() {
  const searchParams = useSearchParams()
  const rawLevel = searchParams.get('level') as ProficiencyLevel | null
  const level: ProficiencyLevel = CEFR_LEVELS.includes(rawLevel as ProficiencyLevel)
    ? (rawLevel as ProficiencyLevel)
    : 'A1'

  const { user } = useAuthStore()
  const levelInfo = LEVEL_DESCRIPTIONS[level]
  const levelIndex = CEFR_LEVELS.indexOf(level)

  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {/* Hero */}
      <div
        className={`flex flex-col items-center gap-4 bg-gradient-to-br ${levelInfo.color} px-5 pb-12 pt-16 text-white`}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
          <span className="text-4xl font-bold text-white">{level}</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest opacity-80">Your level</p>
          <h1 className="mt-1 text-3xl font-semibold">{levelInfo.label}</h1>
        </div>
        <p className="max-w-xs text-center text-sm leading-relaxed opacity-90">
          {levelInfo.description}
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-6 px-5 pb-10 pt-6">
        {/* CEFR scale */}
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            CEFR scale
          </p>
          <div className="flex gap-1.5" role="list" aria-label="Your position on the CEFR scale">
            {CEFR_LEVELS.map((l, i) => (
              <div
                key={l}
                role="listitem"
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={`h-2 w-full rounded-full transition-colors ${
                    i <= levelIndex
                      ? `bg-gradient-to-br ${levelInfo.color}`
                      : 'bg-neutral-200 dark:bg-neutral-800'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    l === level
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-neutral-400'
                  }`}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Greeting */}
        {user && (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <span className="font-medium text-neutral-900 dark:text-white">
                Hey {user.name.split(' ')[0]},
              </span>{' '}
              {levelInfo.advice}
            </p>
          </div>
        )}

        {/* What's next */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            What happens next
          </p>
          {[
            {
              icon: '🎯',
              title: 'Personalised lessons',
              body: `Lessons pitched exactly at ${level} difficulty.`,
            },
            {
              icon: '📈',
              title: 'Adaptive difficulty',
              body: 'The app adjusts as you improve — no plateau.',
            },
            {
              icon: '🔥',
              title: 'Daily streak',
              body: 'Show up every day to keep your streak alive.',
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 text-xl" aria-hidden="true">
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {item.title}
                </p>
                <p className="text-sm text-neutral-500">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <Button fullWidth size="lg" asChild>
          <Link href="/dashboard">Start my first lesson →</Link>
        </Button>
      </div>
    </main>
  )
}

export default function AssessmentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
