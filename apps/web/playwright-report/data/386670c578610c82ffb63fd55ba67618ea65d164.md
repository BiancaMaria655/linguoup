# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: onboarding.spec.ts >> CHG-012 — Auth & Onboarding E2E >> Full journey: register → onboarding → assessment → result
- Location: tests/e2e/onboarding.spec.ts:162:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/onboarding/
Received string:  "chrome-error://chromewebdata/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    - unexpected value "http://localhost:3001/auth/register"
    - waiting for" http://localhost:3001/onboarding" navigation to finish...
    11 × unexpected value "chrome-error://chromewebdata/"

```

# Test source

```ts
  82  |       }),
  83  |     })
  84  |   })
  85  | 
  86  |   await page.route('**/api/v1/assessment/session-abc/submit', async (route) => {
  87  |     await route.fulfill({
  88  |       status: 200,
  89  |       contentType: 'application/json',
  90  |       body: JSON.stringify({
  91  |         level: 'A2',
  92  |         score: 75,
  93  |         totalQuestions: 2,
  94  |         correctAnswers: 1,
  95  |         strengths: ['Vocabulary'],
  96  |         improvements: ['Grammar'],
  97  |         nextSteps: 'Focus on verb conjugation.',
  98  |       }),
  99  |     })
  100 |   })
  101 | }
  102 | 
  103 | // ── Tests ─────────────────────────────────────────────────────────────────────
  104 | 
  105 | test.describe('CHG-012 — Auth & Onboarding E2E', () => {
  106 |   test('INT-01: Splash screen routes unauthenticated user to welcome', async ({
  107 |     page,
  108 |   }) => {
  109 |     // Ensure no auth state
  110 |     await page.context().clearCookies()
  111 | 
  112 |     await page.goto('/')
  113 | 
  114 |     // Should eventually land on /welcome
  115 |     await expect(page).toHaveURL(/\/welcome/, { timeout: 5000 })
  116 |     await expect(page.getByRole('heading', { level: 1 })).toContainText(
  117 |       'Learn a language'
  118 |     )
  119 |   })
  120 | 
  121 |   test('INT-02: Welcome page has correct CTAs', async ({ page }) => {
  122 |     await page.goto('/welcome')
  123 | 
  124 |     const registerLink = page.getByRole('link', { name: /get started/i })
  125 |     const loginLink = page.getByRole('link', { name: /log in/i })
  126 | 
  127 |     await expect(registerLink).toBeVisible()
  128 |     await expect(loginLink).toBeVisible()
  129 |     await expect(registerLink).toHaveAttribute('href', '/register')
  130 |   })
  131 | 
  132 |   test('INT-03: Register form validates required fields', async ({ page }) => {
  133 |     await page.goto('/auth/register')
  134 | 
  135 |     // Click submit without filling form
  136 |     await page.getByRole('button', { name: /create account/i }).click()
  137 | 
  138 |     await expect(page.getByText(/your name is required/i)).toBeVisible()
  139 |     await expect(page.getByText(/email is required/i)).toBeVisible()
  140 |     await expect(page.getByText(/password is required/i)).toBeVisible()
  141 |   })
  142 | 
  143 |   test('INT-03: Register form validates email format', async ({ page }) => {
  144 |     await page.goto('/auth/register')
  145 | 
  146 |     await page.getByLabel('Email').fill('not-an-email')
  147 |     await page.getByLabel('Email').blur()
  148 | 
  149 |     await expect(page.getByText(/enter a valid email/i)).toBeVisible()
  150 |   })
  151 | 
  152 |   test('INT-03: Register form validates password mismatch', async ({ page }) => {
  153 |     await page.goto('/auth/register')
  154 | 
  155 |     await page.getByLabel('Password').first().fill('StrongPass1')
  156 |     await page.getByLabel('Confirm password').fill('Different1')
  157 |     await page.getByLabel('Confirm password').blur()
  158 | 
  159 |     await expect(page.getByText(/passwords don't match/i)).toBeVisible()
  160 |   })
  161 | 
  162 |   test('Full journey: register → onboarding → assessment → result', async ({
  163 |     page,
  164 |   }) => {
  165 |     const email = uniqueEmail()
  166 | 
  167 |     // Set up API mocks
  168 |     await interceptAuth(page)
  169 |     await interceptOnboarding(page)
  170 |     await interceptAssessment(page)
  171 | 
  172 |     // ── INT-03: Register ──────────────────────────────────────────────────
  173 |     await page.goto('/auth/register')
  174 | 
  175 |     await page.getByLabel('Your name').fill('Playwright User')
  176 |     await page.getByLabel('Email').fill(email)
  177 |     await page.getByLabel('Password').first().fill('StrongPass1')
  178 |     await page.getByLabel('Confirm password').fill('StrongPass1')
  179 |     await page.getByRole('button', { name: /create account/i }).click()
  180 | 
  181 |     // Should navigate to onboarding
> 182 |     await expect(page).toHaveURL(/\/onboarding/, { timeout: 5000 })
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  183 | 
  184 |     // ── INT-04: Learning goal ─────────────────────────────────────────────
  185 |     await expect(
  186 |       page.getByRole('heading', { name: /what's your main goal/i })
  187 |     ).toBeVisible()
  188 | 
  189 |     await page.getByRole('radio', { name: /travel/i }).click()
  190 |     await expect(page).toHaveURL(/\/onboarding/)
  191 | 
  192 |     // ── INT-05: Language ──────────────────────────────────────────────────
  193 |     await expect(
  194 |       page.getByRole('heading', { name: /which language/i })
  195 |     ).toBeVisible()
  196 | 
  197 |     await page.getByRole('radio', { name: /spanish/i }).click()
  198 | 
  199 |     // ── INT-06: Availability ──────────────────────────────────────────────
  200 |     await expect(
  201 |       page.getByRole('heading', { name: /how much time/i })
  202 |     ).toBeVisible()
  203 | 
  204 |     await page.getByRole('radio', { name: /15 min/i }).click()
  205 | 
  206 |     // ── INT-07: Plan ──────────────────────────────────────────────────────
  207 |     await expect(
  208 |       page.getByRole('heading', { name: /your plan is ready/i })
  209 |     ).toBeVisible()
  210 | 
  211 |     // Check plan card shows selected options
  212 |     await expect(page.getByText(/spanish for travel/i)).toBeVisible()
  213 |     await expect(page.getByText(/15 min\/day/i)).toBeVisible()
  214 | 
  215 |     await page.getByRole('button', { name: /take the level assessment/i }).click()
  216 | 
  217 |     // ── INT-08: Assessment ────────────────────────────────────────────────
  218 |     await expect(page).toHaveURL(/\/assessment/, { timeout: 5000 })
  219 |     await expect(
  220 |       page.getByText(/what is the spanish word for "hello"/i)
  221 |     ).toBeVisible()
  222 | 
  223 |     // Answer first question
  224 |     await page.getByRole('radio', { name: /Hola/i }).click()
  225 |     await page.getByRole('button', { name: /next question/i }).click()
  226 | 
  227 |     // Answer second question
  228 |     await expect(
  229 |       page.getByText(/grammatically correct/i)
  230 |     ).toBeVisible()
  231 |     await page.getByRole('radio', { name: /yo soy feliz/i }).click()
  232 |     await page.getByRole('button', { name: /finish/i }).click()
  233 | 
  234 |     // ── INT-09: Result ────────────────────────────────────────────────────
  235 |     await expect(page).toHaveURL(/\/assessment\/result/, { timeout: 5000 })
  236 |     await expect(
  237 |       page.getByRole('heading', { name: /elementary/i })
  238 |     ).toBeVisible()
  239 | 
  240 |     // Check CEFR level is displayed
  241 |     await expect(page.getByText('A2').first()).toBeVisible()
  242 | 
  243 |     // Verify CTA to dashboard
  244 |     const dashboardLink = page.getByRole('link', { name: /start my first lesson/i })
  245 |     await expect(dashboardLink).toBeVisible()
  246 |     await expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  247 |   })
  248 | 
  249 |   test('Token persists in localStorage after registration', async ({ page }) => {
  250 |     await interceptAuth(page)
  251 |     await page.goto('/auth/register')
  252 | 
  253 |     await page.getByLabel('Your name').fill('Playwright User')
  254 |     await page.getByLabel('Email').fill(uniqueEmail())
  255 |     await page.getByLabel('Password').first().fill('StrongPass1')
  256 |     await page.getByLabel('Confirm password').fill('StrongPass1')
  257 |     await page.getByRole('button', { name: /create account/i }).click()
  258 | 
  259 |     await page.waitForURL(/\/onboarding/, { timeout: 5000 })
  260 | 
  261 |     const storage = await page.evaluate(() =>
  262 |       JSON.parse(localStorage.getItem('auth-storage') ?? '{}')
  263 |     )
  264 | 
  265 |     expect(storage.state?.tokens?.accessToken).toBe('mock-access-token')
  266 |     expect(storage.state?.isAuthenticated).toBe(true)
  267 |   })
  268 | 
  269 |   test('Authenticated user with completed onboarding goes to dashboard', async ({
  270 |     page,
  271 |   }) => {
  272 |     // Seed localStorage with a completed auth state
  273 |     await page.goto('/welcome')
  274 |     await page.evaluate(() => {
  275 |       localStorage.setItem(
  276 |         'auth-storage',
  277 |         JSON.stringify({
  278 |           state: {
  279 |             user: {
  280 |               id: 'user-123',
  281 |               name: 'Test User',
  282 |               email: 'test@example.com',
```