'use client'

import React, { forwardRef, InputHTMLAttributes, ButtonHTMLAttributes, isValidElement, cloneElement } from 'react'
import { cn } from '@/lib/utils'

// ── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-describedby={
              [error && errorId, hint && hintId].filter(Boolean).join(' ') ||
              undefined
            }
            aria-invalid={!!error}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors',
              'bg-white dark:bg-neutral-900',
              'border-neutral-200 dark:border-neutral-700',
              'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
              'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
              rightElement && 'pr-12',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-sm text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  asChild?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  fullWidth,
  children,
  className,
  disabled,
  asChild,
  ...props
}: ButtonProps) {
  const buttonClasses = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'active:scale-[0.98]',

    // Variants
    variant === 'primary' &&
      'bg-violet-600 text-white hover:bg-violet-700 shadow-sm',
    variant === 'secondary' &&
      'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800',
    variant === 'ghost' &&
      'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',

    // Sizes
    size === 'sm' && 'h-9 px-4 text-sm',
    size === 'md' && 'h-12 px-6 text-base',
    size === 'lg' && 'h-14 px-8 text-lg',

    fullWidth && 'w-full',
    className
  )

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      className: cn(buttonClasses, (children.props as any).className),
    } as any)
  }

  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={buttonClasses}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

// ── OptionCard ────────────────────────────────────────────────────────────────

interface OptionCardProps {
  label: string
  description?: string
  icon?: React.ReactNode
  selected?: boolean
  onClick?: () => void
}

export function OptionCard({
  label,
  description,
  icon,
  selected,
  onClick,
}: OptionCardProps) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
        'active:scale-[0.99]',
        selected
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
          : 'border-neutral-200 bg-white hover:border-violet-300 hover:bg-violet-50/40 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-violet-700 dark:hover:bg-violet-950/20'
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl',
            selected
              ? 'bg-violet-500 text-white'
              : 'bg-neutral-100 dark:bg-neutral-800'
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className="flex flex-col gap-0.5">
        <span
          className={cn(
            'text-sm font-medium',
            selected
              ? 'text-violet-700 dark:text-violet-300'
              : 'text-neutral-800 dark:text-neutral-200'
          )}
        >
          {label}
        </span>
        {description && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </span>
        )}
      </span>
      {selected && (
        <svg
          className="ml-auto h-5 w-5 flex-shrink-0 text-violet-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────

interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs text-neutral-500">
          {label} — step {current} of {total}
        </span>
      )}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
        className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
      >
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── ErrorBanner ───────────────────────────────────────────────────────────────

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
    >
      {message}
    </div>
  )
}
