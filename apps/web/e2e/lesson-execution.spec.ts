/**
 * E2E: Jornada de Execução de Microlição — /lessons/[id]
 *
 * Cobre:
 * - Carregar lição com 3 exercícios (1 de cada tipo)
 * - Responder todas as questões
 * - Ver tela de resultado com XP e botões de navegação
 * - Navegar "Voltar para Home" → URL /dashboard
 *
 * Todos os endpoints são mockados via page.route() para isolar do backend.
 * Auth state injetado via localStorage (Zustand persist).
 */

import { test, expect, Page } from "@playwright/test";

// ── Fixtures ────────────────────────────────────────────────────────────────

const LESSON_ID = "lesson-e2e-001";

const lessonFixture = {
  data: {
    id: LESSON_ID,
    title: "Hello & Greetings",
    topic: "Speaking",
    durationMinutes: 5,
    exercises: [
      {
        id: "ex-1",
        type: "multiple_choice",
        question: "What does 'Hello' mean?",
        options: ["Goodbye", "Hello", "Thank you", "Please"],
        correctAnswer: "Hello",
        hint: "It's a greeting.",
      },
      {
        id: "ex-2",
        type: "fill_blank",
        question: "Complete: 'Good ___'",
        correctAnswer: "morning",
        hint: "Think of a time of day.",
      },
      {
        id: "ex-3",
        type: "translation",
        question: "Translate: 'Olá'",
        correctAnswer: "Hello",
      },
    ],
  },
};

const completeFixture = {
  data: {
    xpAwarded: 40,
    newAchievements: [],
    currentStreak: 3,
  },
};

const achievementsFixture = {
  data: [],
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Builds the auth state JSON used for both cookie and localStorage injection.
 */
function buildAuthState() {
  return JSON.stringify({
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
}

async function setupLessonMocks(page: Page) {
  // GET /lessons/:id → lesson fixture
  await page.route(`**/api/v1/lessons/${LESSON_ID}`, (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(lessonFixture),
      });
    } else {
      route.continue();
    }
  });

  // POST /lessons/:id/complete → complete fixture
  await page.route(`**/api/v1/lessons/${LESSON_ID}/complete`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(completeFixture),
    });
  });

  // GET /achievements → empty initial
  await page.route("**/api/v1/achievements", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(achievementsFixture),
    });
  });

  // Mock home data to avoid unhandled routes
  await page.route("**/api/v1/users/me/home", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          streak: 3,
          xp: 1000,
          level: 2,
          dailyGoalMinutes: 15,
          todayMinutes: 5,
          nextLesson: null,
          pendingReviews: 0,
        },
      }),
    });
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

test.describe("Execução de Microlição — Jornada Completa", () => {
  test("deve responder todas as questões e exibir tela de resultado com XP", async ({
    page,
  }) => {
    await setupLessonMocks(page);

    // Set cookie first (needed by middleware before first navigation)
    const authState = buildAuthState();
    await page.context().addCookies([{ name: "linguoup-auth", value: encodeURIComponent(authState), domain: "localhost", path: "/" }]);

    // Navigate to lesson page (now authenticated via cookie)
    await page.goto(`/lessons/${LESSON_ID}`);

    // Inject localStorage (Zustand — for useAuthStore in hooks)
    await page.evaluate((state) => { localStorage.setItem("linguoup-auth", state); }, authState);

    // Reload so hooks pick up the auth from localStorage
    await page.reload();

    // Should render the lesson (first exercise: multiple choice)
    await expect(page.getByText("What does 'Hello' mean?")).toBeVisible({
      timeout: 8000,
    });

    // ── Exercise 1: multiple choice ──
    await page.getByRole("button", { name: "Hello" }).click();

    // Should show "Correto!" feedback
    await expect(page.getByText("✅ Correto!")).toBeVisible({ timeout: 3000 });

    // Click "Continuar →"
    await page.getByRole("button", { name: /Continuar/i }).click();

    // ── Exercise 2: fill_blank ──
    await expect(page.getByText(/Complete:/i)).toBeVisible({ timeout: 3000 });

    await page.getByPlaceholder("Complete a frase…").fill("morning");
    await page.getByRole("button", { name: /Verificar/i }).click();

    await expect(page.getByText("✅ Correto!")).toBeVisible({ timeout: 3000 });

    // Click "Continuar →"
    await page.getByRole("button", { name: /Continuar/i }).click();

    // ── Exercise 3: translation ──
    await expect(page.getByText(/Translate:/i)).toBeVisible({ timeout: 3000 });

    await page.getByPlaceholder("Digite a tradução…").fill("Hello");
    await page.getByRole("button", { name: /Verificar/i }).click();

    await expect(page.getByText("✅ Correto!")).toBeVisible({ timeout: 3000 });

    // Click "Ver resultado →"
    await page.getByRole("button", { name: /Ver resultado/i }).click();

    // ── Result screen ──
    // Should display "Lição concluída!"
    await expect(
      page.getByRole("heading", { name: /Lição concluída/i })
    ).toBeVisible({ timeout: 5000 });

    // Should display XP ganho
    await expect(page.getByText(/XP ganho/i)).toBeVisible();

    // Should display navigation buttons
    await expect(
      page.getByRole("button", { name: /Próxima Lição/i })
    ).toBeVisible();
    await expect(page.getByText(/Voltar para Home/i)).toBeVisible();
  });

  test("deve navegar para /dashboard ao clicar 'Voltar para Home'", async ({
    page,
  }) => {
    await setupLessonMocks(page);

    // Set cookie first (needed by middleware before first navigation)
    const authState = buildAuthState();
    await page.context().addCookies([{ name: "linguoup-auth", value: encodeURIComponent(authState), domain: "localhost", path: "/" }]);



    await page.goto(`/lessons/${LESSON_ID}`);
    await page.evaluate((state) => { localStorage.setItem("linguoup-auth", state); }, authState);
    await page.reload();

    // Answer all questions quickly (doesn't matter if correct/incorrect for navigation test)
    await expect(page.getByText("What does 'Hello' mean?")).toBeVisible({
      timeout: 8000,
    });

    // Q1: multiple choice — pick any
    await page.getByRole("button", { name: "Hello" }).click();
    await page.getByRole("button", { name: /Continuar/i }).click();

    // Q2: fill_blank
    await page.getByPlaceholder("Complete a frase…").fill("test");
    await page.getByRole("button", { name: /Verificar/i }).click();
    await page.getByRole("button", { name: /Continuar/i }).click();

    // Q3: translation
    await page.getByPlaceholder("Digite a tradução…").fill("test");
    await page.getByRole("button", { name: /Verificar/i }).click();
    await page.getByRole("button", { name: /Ver resultado/i }).click();

    // Wait for result screen
    await expect(
      page.getByRole("heading", { name: /Lição concluída/i })
    ).toBeVisible({ timeout: 5000 });

    // Click "Voltar para Home"
    await page.getByText("Voltar para Home").click();

    // Should navigate to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });
});
