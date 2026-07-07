/**
 * E2E: Jornada da área autenticada — Dashboard → Trilhas → Detalhe da Trilha
 *
 * Todos os endpoints de rede são mockados via Playwright route() para isolar do backend.
 * Auth state é injetado via localStorage (padrão Zustand persist).
 */
import { test, expect, Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helper: inject authenticated state into localStorage (Zustand persist)
// ---------------------------------------------------------------------------
async function injectAuthState(page: Page) {
  const authState = JSON.stringify({
    state: {
      accessToken: "mock-jwt-token",
      user: {
        id: "user-e2e-01",
        name: "Ana Teste",
        email: "ana@linguoup.test",
        role: "USER",
        onboardingCompleted: true,
      },
    },
    version: 0,
  });
  await page.context().addCookies([
    { name: "linguoup-auth", value: authState, domain: "localhost", path: "/" },
  ]);
  await page.evaluate((state) => {
    localStorage.setItem("linguoup-auth", state);
  }, authState);
}

// ---------------------------------------------------------------------------
// Helper: setup network mocks for authenticated area
// ---------------------------------------------------------------------------
async function setupAuthMocks(page: Page) {
  // GET /users/me/home → dashboard data
  await page.route("**/api/v1/users/me/home", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          streak: 7,
          xp: 2500,
          level: 4,
          dailyGoalMinutes: 15,
          todayMinutes: 8,
          nextLesson: {
            id: "lesson-abc",
            title: "Present Simple",
            topic: "Grammar",
            durationMinutes: 5,
          },
          pendingReviews: 2,
        },
      }),
    })
  );

  // GET /lessons/trails → trail catalog
  await page.route("**/api/v1/lessons/trails", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            id: "trail-001",
            title: "Inglês para Iniciantes",
            description: "Aprenda o básico do inglês do zero.",
            level: "beginner",
            totalLessons: 10,
            completedLessons: 3,
            icon: "🇬🇧",
          },
          {
            id: "trail-002",
            title: "Business English",
            description: "Inglês para o ambiente de trabalho.",
            level: "intermediate",
            totalLessons: 8,
            completedLessons: 0,
            icon: "💼",
          },
        ],
      }),
    })
  );

  // GET /lessons/trails/:id → trail detail
  await page.route("**/api/v1/lessons/trails/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          id: "trail-001",
          title: "Inglês para Iniciantes",
          description: "Aprenda o básico do inglês do zero.",
          level: "beginner",
          totalLessons: 10,
          completedLessons: 3,
          lessons: [
            {
              id: "lesson-001",
              title: "Hello & Greetings",
              topic: "Speaking",
              durationMinutes: 5,
              status: "completed",
            },
            {
              id: "lesson-002",
              title: "Numbers 1–10",
              topic: "Vocabulary",
              durationMinutes: 5,
              status: "next",
            },
            {
              id: "lesson-003",
              title: "Colors",
              topic: "Vocabulary",
              durationMinutes: 5,
              status: "locked",
            },
          ],
        },
      }),
    })
  );
}

// ---------------------------------------------------------------------------
// Test: Dashboard — elementos principais
// ---------------------------------------------------------------------------
test.describe("Dashboard — Área Autenticada", () => {
  test("deve exibir saudação, streak card e XP card após autenticação", async ({
    page,
  }) => {
    await setupAuthMocks(page);

    // Navigate to home to inject localStorage
    await page.goto("/");
    await injectAuthState(page);

    // Navigate to dashboard (with auth state)
    await page.goto("/dashboard");

    // Should display greeting (Bom dia / Boa tarde / Boa noite + first name)
    await expect(page.getByRole("heading", { name: /Ana/ })).toBeVisible({ timeout: 5000 });

    // Should display streak card
    await expect(page.getByText(/Streak/i)).toBeVisible();

    // Should display XP card
    await expect(page.getByText(/XP Total/i)).toBeVisible();

    // Should display level card
    await expect(page.getByText("Nível", { exact: true })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Test: Catálogo de Trilhas
// ---------------------------------------------------------------------------
test.describe("Catálogo de Trilhas", () => {
  test("deve exibir lista de trilhas ao navegar para /lessons", async ({
    page,
  }) => {
    await setupAuthMocks(page);

    await page.goto("/");
    await injectAuthState(page);

    await page.goto("/lessons");

    // Page heading
    await expect(page.getByRole("heading", { name: /Trilhas/i })).toBeVisible({
      timeout: 5000,
    });

    // Should render trail cards
    await expect(
      page.getByText(/Inglês para Iniciantes/i)
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Business English/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Test: Detalhe da Trilha
// ---------------------------------------------------------------------------
test.describe("Detalhe da Trilha", () => {
  test("deve navegar para /lessons/trail/[id] e exibir cabeçalho da trilha", async ({
    page,
  }) => {
    await setupAuthMocks(page);

    await page.goto("/");
    await injectAuthState(page);

    await page.goto("/lessons");

    // Click on the first trail card
    await page.getByText(/Inglês para Iniciantes/i).click();

    // Should navigate to trail detail
    await expect(page).toHaveURL(/\/lessons\/trail\/trail-001/, {
      timeout: 5000,
    });

    // Should display trail title heading
    await expect(
      page.getByRole("heading", { name: /Inglês para Iniciantes/i })
    ).toBeVisible({ timeout: 5000 });
  });
});
