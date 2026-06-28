import { test, expect, type Page } from '@playwright/test'

// ── Helpers ───────────────────────────────────────────────────────────────────

const uniqueEmail = () => `test+${Date.now()}@playwright.dev`

async function interceptAuth(page: Page) {
  await page.route('**/api/v1/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user-123',
          name: 'Playwright User',
          email: route.request().postDataJSON().email,
          onboardingCompleted: false,
          assessmentCompleted: false,
          createdAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      }),
    })
  })
}

async function interceptOnboarding(page: Page) {
  await page.route('**/api/v1/users/onboarding', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plan: { weeklyLessons: 7, dailyMinutes: 15, estimatedLevelUpWeeks: 12 },
        user: {
          id: 'user-123',
          name: 'Playwright User',
          email: 'test@playwright.dev',
          onboardingCompleted: true,
          assessmentCompleted: false,
          createdAt: new Date().toISOString(),
        },
      }),
    })
  })
}

async function interceptAssessment(page: Page) {
  await page.route('**/api/v1/assessment/start', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sessionId: 'session-abc',
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            prompt: 'What is the Spanish word for "hello"?',
            options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
            correctAnswer: 'Hola',
            difficulty: 'A1',
            language: 'spanish',
          },
          {
            id: 'q2',
            type: 'multiple_choice',
            prompt: 'Which sentence is grammatically correct?',
            options: [
              'Yo soy feliz.',
              'Yo estar feliz.',
              'Yo es feliz.',
              'Yo am feliz.',
            ],
            correctAnswer: 'Yo soy feliz.',
            difficulty: 'A2',
            language: 'spanish',
          },
        ],
      }),
    })
  })

  await page.route('**/api/v1/assessment/session-abc/submit', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        level: 'A2',
        score: 75,
        totalQuestions: 2,
        correctAnswers: 1,
        strengths: ['Vocabulary'],
        improvements: ['Grammar'],
        nextSteps: 'Focus on verb conjugation.',
      }),
    })
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('CHG-012 — Auth & Onboarding E2E', () => {
  test('INT-01: Splash screen routes unauthenticated user to welcome', async ({
    page,
  }) => {
    // Ensure no auth state
    await page.context().clearCookies()

    await page.goto('/')

    // Should eventually land on /welcome
    await expect(page).toHaveURL(/\/welcome/, { timeout: 5000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Learn a language'
    )
  })

  test('INT-02: Welcome page has correct CTAs', async ({ page }) => {
    await page.goto('/welcome')

    const registerLink = page.getByRole('link', { name: /get started/i })
    const loginLink = page.getByRole('link', { name: /log in/i })

    await expect(registerLink).toBeVisible()
    await expect(loginLink).toBeVisible()
    await expect(registerLink).toHaveAttribute('href', '/register')
  })

  test('INT-03: Register form validates required fields', async ({ page }) => {
    await page.goto('/auth/register')

    // Click submit without filling form
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/your name is required/i)).toBeVisible()
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('INT-03: Register form validates email format', async ({ page }) => {
    await page.goto('/auth/register')

    await page.getByLabel('Email').fill('not-an-email')
    await page.getByLabel('Email').blur()

    await expect(page.getByText(/enter a valid email/i)).toBeVisible()
  })

  test('INT-03: Register form validates password mismatch', async ({ page }) => {
    await page.goto('/auth/register')

    await page.getByLabel('Password').first().fill('StrongPass1')
    await page.getByLabel('Confirm password').fill('Different1')
    await page.getByLabel('Confirm password').blur()

    await expect(page.getByText(/passwords don't match/i)).toBeVisible()
  })

  test('Full journey: register → onboarding → assessment → result', async ({
    page,
  }) => {
    const email = uniqueEmail()

    // Set up API mocks
    await interceptAuth(page)
    await interceptOnboarding(page)
    await interceptAssessment(page)

    // ── INT-03: Register ──────────────────────────────────────────────────
    await page.goto('/auth/register')

    await page.getByLabel('Your name').fill('Playwright User')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').first().fill('StrongPass1')
    await page.getByLabel('Confirm password').fill('StrongPass1')
    await page.getByRole('button', { name: /create account/i }).click()

    // Should navigate to onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 5000 })

    // ── INT-04: Learning goal ─────────────────────────────────────────────
    await expect(
      page.getByRole('heading', { name: /what's your main goal/i })
    ).toBeVisible()

    await page.getByRole('radio', { name: /travel/i }).click()
    await expect(page).toHaveURL(/\/onboarding/)

    // ── INT-05: Language ──────────────────────────────────────────────────
    await expect(
      page.getByRole('heading', { name: /which language/i })
    ).toBeVisible()

    await page.getByRole('radio', { name: /spanish/i }).click()

    // ── INT-06: Availability ──────────────────────────────────────────────
    await expect(
      page.getByRole('heading', { name: /how much time/i })
    ).toBeVisible()

    await page.getByRole('radio', { name: /15 min/i }).click()

    // ── INT-07: Plan ──────────────────────────────────────────────────────
    await expect(
      page.getByRole('heading', { name: /your plan is ready/i })
    ).toBeVisible()

    // Check plan card shows selected options
    await expect(page.getByText(/spanish for travel/i)).toBeVisible()
    await expect(page.getByText(/15 min\/day/i)).toBeVisible()

    await page.getByRole('button', { name: /take the level assessment/i }).click()

    // ── INT-08: Assessment ────────────────────────────────────────────────
    await expect(page).toHaveURL(/\/assessment/, { timeout: 5000 })
    await expect(
      page.getByText(/what is the spanish word for "hello"/i)
    ).toBeVisible()

    // Answer first question
    await page.getByRole('radio', { name: /Hola/i }).click()
    await page.getByRole('button', { name: /next question/i }).click()

    // Answer second question
    await expect(
      page.getByText(/grammatically correct/i)
    ).toBeVisible()
    await page.getByRole('radio', { name: /yo soy feliz/i }).click()
    await page.getByRole('button', { name: /finish/i }).click()

    // ── INT-09: Result ────────────────────────────────────────────────────
    await expect(page).toHaveURL(/\/assessment\/result/, { timeout: 5000 })
    await expect(
      page.getByRole('heading', { name: /elementary/i })
    ).toBeVisible()

    // Check CEFR level is displayed
    await expect(page.getByText('A2').first()).toBeVisible()

    // Verify CTA to dashboard
    const dashboardLink = page.getByRole('link', { name: /start my first lesson/i })
    await expect(dashboardLink).toBeVisible()
    await expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  test('Token persists in localStorage after registration', async ({ page }) => {
    await interceptAuth(page)
    await page.goto('/auth/register')

    await page.getByLabel('Your name').fill('Playwright User')
    await page.getByLabel('Email').fill(uniqueEmail())
    await page.getByLabel('Password').first().fill('StrongPass1')
    await page.getByLabel('Confirm password').fill('StrongPass1')
    await page.getByRole('button', { name: /create account/i }).click()

    await page.waitForURL(/\/onboarding/, { timeout: 5000 })

    const storage = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('auth-storage') ?? '{}')
    )

    expect(storage.state?.tokens?.accessToken).toBe('mock-access-token')
    expect(storage.state?.isAuthenticated).toBe(true)
  })

  test('Authenticated user with completed onboarding goes to dashboard', async ({
    page,
  }) => {
    // Seed localStorage with a completed auth state
    await page.goto('/welcome')
    await page.evaluate(() => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: {
              id: 'user-123',
              name: 'Test User',
              email: 'test@example.com',
              onboardingCompleted: true,
              assessmentCompleted: true,
            },
            tokens: {
              accessToken: 'valid-token',
              refreshToken: 'valid-refresh',
            },
            isAuthenticated: true,
            onboardingData: {},
            onboardingStep: 0,
          },
          version: 0,
        })
      )
    })

    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
  })

  test('Progress bar advances through onboarding steps', async ({ page }) => {
    await interceptAuth(page)
    await page.goto('/auth/register')

    await page.getByLabel('Your name').fill('Playwright User')
    await page.getByLabel('Email').fill(uniqueEmail())
    await page.getByLabel('Password').first().fill('StrongPass1')
    await page.getByLabel('Confirm password').fill('StrongPass1')
    await page.getByRole('button', { name: /create account/i }).click()

    await page.waitForURL(/\/onboarding/, { timeout: 5000 })

    // Step 1 of 4
    const progress = page.getByRole('progressbar')
    await expect(progress).toHaveAttribute('aria-valuenow', '1')
    await expect(progress).toHaveAttribute('aria-valuemax', '4')

    await page.getByRole('radio', { name: /travel/i }).click()

    // Step 2 of 4
    await expect(progress).toHaveAttribute('aria-valuenow', '2')
  })

  test('Keyboard navigation works through auth forms (WCAG 2.1 AA)', async ({
    page,
  }) => {
    await page.goto('/auth/login')

    // Tab through form elements
    await page.keyboard.press('Tab') // Focuses the 'Back' link
    await page.keyboard.press('Tab') // Focuses the 'Email' field
    await expect(page.getByLabel('Email')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Password')).toBeFocused()

    await page.keyboard.press('Tab')
    // show/hide password button
    await page.keyboard.press('Tab')
    // forgot password link
    await page.keyboard.press('Tab')
    // login button
    const loginBtn = page.getByRole('button', { name: /log in/i })
    await expect(loginBtn).toBeFocused()
  })
})
