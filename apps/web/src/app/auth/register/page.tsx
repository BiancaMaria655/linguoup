'use client'

import Link from 'next/link'
import { useRegisterScreen } from '@/hooks/useRegisterScreen'
import { Input, Button, ErrorBanner } from '@/components/ui'

/**
 * INT-03 — Cadastro (part of Cadastro e Login screen)
 */
export default function RegisterPage() {
  const {
    form,
    errors,
    showPassword,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    togglePassword,
  } = useRegisterScreen()

  const EyeIcon = ({ visible }: { visible: boolean }) =>
    visible ? (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Create your account
        </h1>
        <p className="text-sm text-neutral-500">
          Start learning for free — no credit card needed.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {errors.general && <ErrorBanner message={errors.general} />}

        <Input
          label="Your name"
          type="text"
          autoComplete="given-name"
          value={form.name}
          onChange={(e) => handleChange('name')(e.target.value)}
          onBlur={handleBlur('name')}
          error={errors.name}
          placeholder="Ana Silva"
          disabled={isLoading}
        />

        <Input
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => handleChange('email')(e.target.value)}
          onBlur={handleBlur('email')}
          error={errors.email}
          placeholder="ana@example.com"
          disabled={isLoading}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => handleChange('password')(e.target.value)}
          onBlur={handleBlur('password')}
          error={errors.password}
          hint="At least 8 characters with one uppercase letter"
          placeholder="Create a strong password"
          disabled={isLoading}
          rightElement={
            <button
              type="button"
              onClick={togglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <EyeIcon visible={showPassword} />
            </button>
          }
        />

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => handleChange('confirmPassword')(e.target.value)}
          onBlur={handleBlur('confirmPassword')}
          error={errors.confirmPassword}
          placeholder="Repeat your password"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Button
          fullWidth
          size="lg"
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          Create account
        </Button>

        <p className="text-center text-xs leading-relaxed text-neutral-400">
          By continuing you agree to our{' '}
          <Link href="/terms" className="underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
