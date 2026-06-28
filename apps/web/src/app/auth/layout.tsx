import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {/* Top nav */}
      <header className="flex h-14 items-center justify-between px-5">
        <Link
          href="/welcome"
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
      </header>

      <main className="flex flex-1 flex-col px-5 pb-8 pt-4">{children}</main>
    </div>
  )
}
