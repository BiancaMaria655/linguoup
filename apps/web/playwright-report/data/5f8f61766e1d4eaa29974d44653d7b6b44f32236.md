# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: onboarding.spec.ts >> CHG-012 — Auth & Onboarding E2E >> Keyboard navigation works through auth forms (WCAG 2.1 AA)
- Location: tests/e2e/onboarding.spec.ts:326:7

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator: getByLabel('Password')
Expected: focused
Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
    1) <input value="" id="password" type="password" aria-invalid="false" placeholder="Your password" autocomplete="current-password" class="w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 pr-12"/> aka getByRole('textbox', { name: 'Password' })
    2) <button type="button" aria-label="Show password" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">…</button> aka getByRole('button', { name: 'Show password' })

Call log:
  - Expect "toBeFocused" with timeout 5000ms
  - waiting for getByLabel('Password')

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
          - heading "Welcome back" [level=1] [ref=e14]
          - paragraph [ref=e15]: Log in to continue your learning streak.
        - generic [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e18]: Email
            - textbox "Email" [invalid] [ref=e20]:
              - /placeholder: name@example.com
            - alert [ref=e21]: Email is required
          - generic [ref=e22]:
            - generic [ref=e23]: Password
            - generic [ref=e24]:
              - textbox "Password" [active] [ref=e25]:
                - /placeholder: Your password
              - button "Show password" [ref=e27]:
                - img [ref=e28]
          - link "Forgot password?" [ref=e32] [cursor=pointer]:
            - /url: /auth/forgot-password
        - generic [ref=e33]:
          - button "Log in" [ref=e34]
          - paragraph [ref=e35]:
            - text: Don't have an account?
            - link "Sign up free" [ref=e36] [cursor=pointer]:
              - /url: /auth/register
  - button "Open Next.js Dev Tools" [ref=e42] [cursor=pointer]:
    - img [ref=e43]
  - alert [ref=e46]
```

# Test source

```ts
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
> 337 |     await expect(page.getByLabel('Password')).toBeFocused()
      |                                               ^ Error: expect(locator).toBeFocused() failed
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