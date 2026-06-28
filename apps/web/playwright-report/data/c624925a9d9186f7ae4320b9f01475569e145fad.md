# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: onboarding.spec.ts >> CHG-012 — Auth & Onboarding E2E >> Token persists in localStorage after registration
- Location: tests/e2e/onboarding.spec.ts:249:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 5000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link "Back" [ref=e4] [cursor=pointer]:
      - /url: /welcome
      - img [ref=e5]
      - text: Back
    - img [ref=e8]
  - main [ref=e11]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - heading "Create your account" [level=1] [ref=e14]
        - paragraph [ref=e15]: Start learning for free — no credit card needed.
      - generic [ref=e16]:
        - generic [ref=e17]:
          - text: Your name
          - textbox "Your name" [ref=e19]:
            - /placeholder: Ana Silva
            - text: Playwright User
        - generic [ref=e20]:
          - text: Email
          - textbox "Email" [ref=e22]:
            - /placeholder: ana@example.com
            - text: test+1782660979941@playwright.dev
        - generic [ref=e23]:
          - text: Password
          - generic [ref=e24]:
            - textbox "Password" [ref=e25]:
              - /placeholder: Create a strong password
              - text: StrongPass1
            - button "Show password" [ref=e27]
          - paragraph [ref=e30]: At least 8 characters with one uppercase letter
        - generic [ref=e31]:
          - text: Confirm password
          - textbox "Confirm password" [ref=e33]:
            - /placeholder: Repeat your password
            - text: StrongPass1
      - generic [ref=e34]:
        - button "Create account" [active] [ref=e35]
        - paragraph [ref=e36]:
          - text: By continuing you agree to our
          - link "Terms" [ref=e37] [cursor=pointer]:
            - /url: /terms
          - text: and
          - link "Privacy Policy" [ref=e38] [cursor=pointer]:
            - /url: /privacy
          - text: .
        - paragraph [ref=e39]:
          - text: Already have an account?
          - link "Log in" [ref=e40] [cursor=pointer]:
            - /url: /auth/login
```

# Test source

```ts
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
  182 |     await expect(page).toHaveURL(/\/onboarding/, { timeout: 5000 })
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
> 259 |     await page.waitForURL(/\/onboarding/, { timeout: 5000 })
      |                ^ TimeoutError: page.waitForURL: Timeout 5000ms exceeded.
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
  283 |               onboardingCompleted: true,
  284 |               assessmentCompleted: true,
  285 |             },
  286 |             tokens: {
  287 |               accessToken: 'valid-token',
  288 |               refreshToken: 'valid-refresh',
  289 |             },
  290 |             isAuthenticated: true,
  291 |             onboardingData: {},
  292 |             onboardingStep: 0,
  293 |           },
  294 |           version: 0,
  295 |         })
  296 |       )
  297 |     })
  298 | 
  299 |     await page.goto('/')
  300 |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
  301 |   })
  302 | 
  303 |   test('Progress bar advances through onboarding steps', async ({ page }) => {
  304 |     await interceptAuth(page)
  305 |     await page.goto('/auth/register')
  306 | 
  307 |     await page.getByLabel('Your name').fill('Playwright User')
  308 |     await page.getByLabel('Email').fill(uniqueEmail())
  309 |     await page.getByLabel('Password').first().fill('StrongPass1')
  310 |     await page.getByLabel('Confirm password').fill('StrongPass1')
  311 |     await page.getByRole('button', { name: /create account/i }).click()
  312 | 
  313 |     await page.waitForURL(/\/onboarding/, { timeout: 5000 })
  314 | 
  315 |     // Step 1 of 4
  316 |     const progress = page.getByRole('progressbar')
  317 |     await expect(progress).toHaveAttribute('aria-valuenow', '1')
  318 |     await expect(progress).toHaveAttribute('aria-valuemax', '4')
  319 | 
  320 |     await page.getByRole('radio', { name: /travel/i }).click()
  321 | 
  322 |     // Step 2 of 4
  323 |     await expect(progress).toHaveAttribute('aria-valuenow', '2')
  324 |   })
  325 | 
  326 |   test('Keyboard navigation works through auth forms (WCAG 2.1 AA)', async ({
  327 |     page,
  328 |   }) => {
  329 |     await page.goto('/auth/login')
  330 | 
  331 |     // Tab through form elements
  332 |     await page.keyboard.press('Tab') // Focuses the 'Back' link
  333 |     await page.keyboard.press('Tab') // Focuses the 'Email' field
  334 |     await expect(page.getByLabel('Email')).toBeFocused()
  335 | 
  336 |     await page.keyboard.press('Tab')
  337 |     await expect(page.getByLabel('Password')).toBeFocused()
  338 | 
  339 |     await page.keyboard.press('Tab')
  340 |     // show/hide password button
  341 |     await page.keyboard.press('Tab')
  342 |     // forgot password link
  343 |     await page.keyboard.press('Tab')
  344 |     // login button
  345 |     const loginBtn = page.getByRole('button', { name: /log in/i })
  346 |     await expect(loginBtn).toBeFocused()
  347 |   })
  348 | })
  349 | 
```