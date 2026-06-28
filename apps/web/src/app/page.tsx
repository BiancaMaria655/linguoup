'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

/**
 * INT-01 — Splash / Loader Screen
 * Shows animated logo while deciding where to route the user.
 */
export default function SplashScreen() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        if (user.onboardingCompleted) {
          router.replace('/dashboard')
        } else {
          router.replace('/onboarding')
        }
      } else {
        router.replace('/welcome')
      }
    }, 1800)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-neutral-950"
      aria-label="Loading Lingo"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo mark */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Outer ring pulse */}
          <span
            className="absolute inset-0 animate-ping rounded-full bg-violet-400/20"
            aria-hidden="true"
          />
          <span
            className="absolute inset-2 animate-pulse rounded-full bg-violet-500/10"
            aria-hidden="true"
          />
          {/* Logo */}
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9"
              aria-hidden="true"
            >
              <path
                d="M8 10h16M8 16h12M8 22h8"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="25" cy="22" r="3.5" fill="white" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Lingo
          </span>
          <span className="text-sm text-neutral-400">Learn languages, fluently</span>
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
