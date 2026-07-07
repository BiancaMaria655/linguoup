/**
 * E2E: Jornada completa de onboarding
 * Cobertura: abrir site → criar conta → completar onboarding (4 passos) →
 *            completar avaliação → ver resultado → acessar /dashboard
 *
 * Todos os endpoints de rede são mockados via Playwright route() para isolar do backend.
 */
import { test, expect, Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helper: setup network mocks (Task 8.2)
// ---------------------------------------------------------------------------
async function setupNetworkMocks(page: Page) {
  // POST /auth/register → 201 Created
  await page.route("**/api/v1/auth/register", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    })
  );

  // POST /auth/login → 200 with accessToken
  await page.route("**/api/v1/auth/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { accessToken: "mock-jwt-token" } }),
    })
  );

  // GET /users/me → profile with onboardingCompleted: false
  await page.route("**/api/v1/users/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          id: "user-e2e-01",
          name: "Teste E2E",
          email: "e2e@linguoup.test",
          role: "USER",
          preferences: {
            onboardingCompleted: false,
          },
        },
      }),
    })
  );

  // POST /users/me/onboarding → success
  await page.route("**/api/v1/users/me/onboarding", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { onboardingCompleted: true } }),
    })
  );

  // POST /assessment/submit → success (non-blocking)
  await page.route("**/api/v1/assessment/submit", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { level: "BASIC", score: 3, total: 5 },
      }),
    })
  );
}

// ---------------------------------------------------------------------------
// Test: Fluxo completo de onboarding
// ---------------------------------------------------------------------------
test.describe("Fluxo de Onboarding Completo", () => {
  test("deve completar jornada: abertura → cadastro → onboarding → avaliação → resultado → dashboard", async ({
    page,
  }) => {
    await setupNetworkMocks(page);

    // 1. Abrir site
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "LinguoUp" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Começar agora/i })).toBeVisible();

    // 2. Ir para cadastro
    await page.getByRole("link", { name: /Começar agora/i }).click();
    await expect(page).toHaveURL("/register");
    await expect(page.getByRole("heading", { name: /Criar conta/i })).toBeVisible();

    // 3. Preencher formulário de cadastro
    await page.fill("#register-name", "Teste E2E");
    await page.fill("#register-email", "e2e@linguoup.test");
    await page.fill("#register-password", "senha123");

    await page.getByRole("button", { name: /Criar Conta/i }).click();

    // 4. Deve redirecionar para /onboarding
    await expect(page).toHaveURL("/onboarding");
    await expect(page.getByRole("heading", { name: /Qual é seu objetivo/i })).toBeVisible();

    // 5. Passo 1: Objetivo
    await page.getByRole("radio", { name: /Trabalho/i }).click();
    await page.getByRole("button", { name: /Continuar/i }).click();

    // 6. Passo 2: Idioma
    await expect(page.getByRole("heading", { name: /Qual idioma/i })).toBeVisible();
    await page.getByRole("button", { name: /Inglês/i }).click();
    await page.getByRole("button", { name: /Continuar/i }).click();

    // 7. Passo 3: Disponibilidade (tem valor padrão, pode continuar)
    await expect(page.getByRole("heading", { name: /Quanto tempo/i })).toBeVisible();
    await page.getByRole("button", { name: /Continuar/i }).click();

    // 8. Passo 4: Plano personalizado
    await expect(page.getByRole("heading", { name: /Seu plano personalizado/i })).toBeVisible();
    await page.getByRole("button", { name: /Iniciar Avaliação/i }).click();

    // 9. Deve redirecionar para /assessment
    await expect(page).toHaveURL("/assessment");
    await expect(page.getByText(/Questão 1 de/i)).toBeVisible();

    // 10. Responder todas as questões da avaliação
    const totalQuestions = 5;
    for (let i = 0; i < totalQuestions; i++) {
      // Select the first option
      await page.locator("#assessment-option-0").click();
      // Click next or "Ver resultado"
      await page.locator("#assessment-next").click();
    }

    // 11. Ver resultado (tela INT-09)
    await expect(page.getByRole("heading", { name: /Avaliação concluída/i })).toBeVisible();
    await expect(page.getByText(/Seu nível detectado/i)).toBeVisible();

    // 12. Iniciar aprendizado → dashboard
    await page.locator("#assessment-start-learning").click();
    await expect(page).toHaveURL("/dashboard");
  });
});

// ---------------------------------------------------------------------------
// Test: Splash Screen
// ---------------------------------------------------------------------------
test.describe("Splash Screen", () => {
  test("deve exibir splash na primeira visita e não repetir na segunda", async ({
    page,
  }) => {
    await setupNetworkMocks(page);

    // First visit
    await page.goto("/");
    // Splash should be visible initially (aria-label)
    const splash = page.getByRole("status", { name: /Carregando LinguoUp/i });
    // It fades out after ~1.8s — just check it's present at start
    await expect(splash).toBeVisible({ timeout: 500 });

    // Wait for splash to disappear
    await expect(splash).not.toBeVisible({ timeout: 3000 });

    // Navigate away and back (same session)
    await page.getByRole("link", { name: /Começar agora/i }).click();
    await page.goBack();

    // Splash should NOT appear again in the same session
    await expect(splash).not.toBeVisible({ timeout: 1000 });
  });
});

// ---------------------------------------------------------------------------
// Test: Redirect automático para usuário autenticado
// ---------------------------------------------------------------------------
test.describe("Redirect automático", () => {
  test("usuário autenticado em / deve ser redirecionado para /dashboard", async ({
    page,
  }) => {
    await setupNetworkMocks(page);

    // Inject auth state via cookie and localStorage (simulates persisted Zustand store)
    const authState = JSON.stringify({
      state: {
        accessToken: "mock-jwt-token",
        user: {
          id: "u1",
          name: "Ana",
          email: "ana@test.com",
          role: "USER",
          onboardingCompleted: true,
        },
      },
      version: 0,
    });
    await page.context().addCookies([
      { name: "linguoup-auth", value: authState, domain: "localhost", path: "/" },
    ]);
    await page.goto("/");
    await page.evaluate((state) => {
      localStorage.setItem("linguoup-auth", state);
    }, authState);
    await page.reload();

    await expect(page).toHaveURL("/dashboard", { timeout: 3000 });
  });

  test("visitante não autenticado em /onboarding deve ser redirecionado para /login", async ({
    page,
  }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL("/login");
  });

  test("visitante não autenticado em /assessment deve ser redirecionado para /login", async ({
    page,
  }) => {
    await page.goto("/assessment");
    await expect(page).toHaveURL("/login");
  });
});
