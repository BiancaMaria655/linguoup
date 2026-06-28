'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'

/**
 * INT-02 — Boas-vindas (Welcome)
 * First screen seen by new users. Max 2 taps to start.
 */
export default function WelcomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {/* Hero illustration area */}
      <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-violet-50 via-violet-100 to-indigo-100 dark:from-violet-950/40 dark:via-violet-900/20 dark:to-neutral-950">
        {/* Decorative floating bubbles representing languages */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {[
            { label: '¡Hola!', top: '12%', left: '8%', delay: '0s', size: 'text-sm' },
            { label: 'Bonjour', top: '22%', right: '10%', delay: '0.4s', size: 'text-xs' },
            { label: '你好', top: '40%', left: '15%', delay: '0.8s', size: 'text-base' },
            { label: 'こんにちは', top: '55%', right: '8%', delay: '0.2s', size: 'text-xs' },
            { label: 'Ciao!', top: '70%', left: '20%', delay: '0.6s', size: 'text-sm' },
          ].map((b) => (
            <span
              key={b.label}
              className={`absolute animate-float rounded-2xl bg-white/70 px-3 py-1.5 font-medium text-violet-700 shadow-sm backdrop-blur-sm dark:bg-neutral-900/60 dark:text-violet-300 ${b.size}`}
              style={{
                top: b.top,
                left: (b as { left?: string }).left,
                right: (b as { right?: string }).right,
                animationDelay: b.delay,
              }}
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white shadow-xl dark:bg-neutral-900">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
              <path
                d="M8 10h16M8 16h12M8 22h8"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="25" cy="22" r="3.5" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom content card */}
      <div className="flex flex-col gap-6 rounded-t-3xl bg-white px-6 pb-10 pt-8 dark:bg-neutral-950">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Learn a language,
            <br />
            not just vocabulary
          </h1>
          <p className="text-base leading-relaxed text-neutral-500">
            Lingo builds real fluency through short, adaptive lessons that fit into your day.
          </p>
        </div>

        {/* Social proof dots */}
        <div className="flex items-center gap-2">
          {['bg-violet-400', 'bg-violet-500', 'bg-violet-600'].map((c, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${c}`} aria-hidden="true" />
          ))}
          <span className="text-xs text-neutral-400">Join 50k+ learners</span>
        </div>

        <div className="flex flex-col gap-3">
          <Button fullWidth size="lg" asChild>
            <Link href="/register">Get started — it's free</Link>
          </Button>
          <Button variant="ghost" fullWidth size="md" asChild>
            <Link href="/login">Already have an account? Log in</Link>
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) }
          50% { transform: translateY(-8px) }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  )
}
