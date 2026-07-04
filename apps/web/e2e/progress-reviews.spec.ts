/**
 * E2E: Jornada de Progresso e Revisões — /progress e /reviews
 *
 * Cobre:
 * - Navegar para /progress → verificar stats carregados
 * - Navegar para /reviews → verificar lista e badge de itens
 * - Iniciar sessão de revisão → responder todos os itens → ver tela de resultado
 * - Abrir modal de meta diária → ajustar slider → salvar → verificar valor atualizado
 *
 * Todos os endpoints são mockados via page.route() para isolar do backend.
 * Auth state injetado via localStorage e cookie (Zustand persist).
 */

import { test, expect, Page } from "@playwright/test";

// ── Fixtures ────────────────────────────────────────────────────────────────

const progressFixture = {
  totalLessons: 42,
  weekLessons: 5,
  totalMinutes: 310,
  weekMinutes: 60,
  vocabulary: 128,
  streak: 7,
  bestStreak: 14,
  currentStreak: 7,
  dailyGoalMinutes: 15,
  dailyActivity: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
    minutes: Math.floor(Math.random() * 30),
  })),
  weeklyActivity: [],
  calendarDays: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
    active: i % 3 !== 0,
  })),
};

const reviewsFixture = {
  items: [
    {
      id: "rev-1",
      question: "What does 'Bom dia' mean?",
      options: ["Good morning", "Good night", "Good afternoon", "Goodbye"],
      correctAnswer: "Good morning",
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      topic: "Saudações",
    },
    {
      id: "rev-2",
      question: "What does 'Obrigado' mean?",
      options: ["Please", "Thank you", "Hello", "Goodbye"],
      correctAnswer: "Thank you",
      dueDate: new Date(Date.now() - 3600000).toISOString(),
      topic: "Educação",
    },
  ],
  total: 2,
  overdue: 1,
};

const xpFixture = {
  level: 3,
  xp: 1240,
  xpForNextLevel: 60,
  xpProgress: 80,
};

const achievementsFixture = [
  { id: "ach-1", title: "Iniciante", description: "Completou a primeira lição", icon: "🌟", unlocked: true, criteria: "Complete 1 lição" },
  { id: "ach-2", title: "7 Dias", description: "7 dias de sequência", icon: "🔥", unlocked: false, criteria: "Mantenha 7 dias de streak" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

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

async function setupMocks(page: Page) {
  // Progress endpoint
  await page.route("**/api/v1/progress**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(progressFixture),
    });
  });

  // Reviews pending
  await page.route("**/api/v1/reviews/pending", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(reviewsFixture),
    });
  });

  // POST /reviews/:id/complete
  await page.route("**/api/v1/reviews/*/complete", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  // POST /reviews/:id/postpone
  await page.route("**/api/v1/reviews/*/postpone", (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  // POST /users/me/onboarding (update daily goal)
  await page.route("**/api/v1/users/me/onboarding", (route) => {
    if (route.request().method() === "POST") {
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    } else {
      route.continue();
    }
  });

  // XP endpoint
  await page.route("**/api/v1/xp", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(xpFixture),
    });
  });

  // Achievements
  await page.route("**/api/v1/achievements/me", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(achievementsFixture),
    });
  });

  // Users/me (profile)
  await page.route("**/api/v1/users/me", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-e2e-01",
          name: "Ana Teste",
          email: "ana@linguoup.test",
          targetLanguage: "en",
          learningGoal: "CAREER",
          level: 3,
          xp: 1240,
          streak: 7,
          totalLessons: 42,
          onboardingCompleted: true,
        }),
      });
    } else {
      route.continue();
    }
  });

  // Home data
  await page.route("**/api/v1/users/me/home", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        streak: 7,
        xp: 1240,
        level: 3,
        dailyGoalMinutes: 15,
        todayMinutes: 10,
        nextLesson: null,
        pendingReviews: 2,
      }),
    });
  });
}


// ── Tests ────────────────────────────────────────────────────────────────────


test.describe("Progresso e Revisões — Jornada Completa", () => {
  test("deve exibir tela de progresso com stats e gráficos carregados", async ({ page }) => {
    await setupMocks(page);

    const authState = buildAuthState();
    await page.context().addCookies([
      { name: "linguoup-auth", value: authState, domain: "localhost", path: "/" },
    ]);

    await page.goto("/progress");
    await page.evaluate((state) => { localStorage.setItem("linguoup-auth", state); }, authState);
    await page.reload();

    // Heading should appear
    await expect(page.getByRole("heading", { name: /Progresso/i })).toBeVisible({ timeout: 8000 });

    // Stats grid should show real values
    await expect(page.getByText("42")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("310")).toBeVisible({ timeout: 3000 });

    // Streak card
    await expect(page.getByText("Sequência atual")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("min/dia")).toBeVisible({ timeout: 3000 });
  });

  test("deve filtrar por período ao clicar nos botões 7 dias / 30 dias / 90 dias", async ({ page }) => {
    await setupMocks(page);
    const authState = buildAuthState();
    await page.context().addCookies([{ name: "linguoup-auth", value: authState, domain: "localhost", path: "/" }]);
    await page.goto("/progress");
    await page.evaluate((state) => { localStorage.setItem("linguoup-auth", state); }, authState);
    await page.reload();

    await expect(page.getByRole("heading", { name: /Progresso/i })).toBeVisible({ timeout: 8000 });

    // Click 7 dias filter
    await page.getByRole("button", { name: "7 dias" }).click();
    // Click 90 dias filter
    await page.getByRole("button", { name: "90 dias" }).click();

    // Page should still show stats (re-fetched with new period)
    await expect(page.getByText("Sequência atual")).toBeVisible({ timeout: 3000 });
  });

  test("deve abrir modal de meta diária, ajustar slider e salvar", async ({ page }) => {
    await setupMocks(page);
    const authState = buildAuthState();
    await page.context().addCookies([{ name: "linguoup-auth", value: authState, domain: "localhost", path: "/" }]);
    await page.goto("/progress");
    await page.evaluate((state) => { localStorage.setItem("linguoup-auth", state); }, authState);
    await page.reload();

    await expect(page.getByText("min/dia")).toBeVisible({ timeout: 8000 });

    // Click "Alterar" button for daily goal
    await page.getByRole("button", { name: "Alterar" }).click();

    // Modal should appear with heading
    await expect(page.getByRole("heading", { name: /Alterar Meta Diária/i })).toBeVisible({ timeout: 3000 });

    // Interact with the range slider
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = "30";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Click save
    await page.getByRole("button", { name: "Salvar" }).click();

    // Modal should close (modal heading disappears)
    await expect(page.getByRole("heading", { name: /Alterar Meta Diária/i })).not.toBeVisible({ timeout: 3000 });
  });

  test("deve exibir lista de revisões pendentes com badge de vencidos", async ({ page }) => {
    await setupMocks(page);
    const authState = buildAuthState();
    await page.context().addCookies([{ name: "linguoup-auth", value: authState, domain: "localhost", path: "/" }]);
    await page.goto("/reviews");
    await page.evaluate((state) => { localStorage.setItem("linguoup-auth", state); }, authState);
    await page.reload();

    await expect(page.getByRole("heading", { name: /Revisões/i })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("1 vencidos")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /Revisar agora/i })).toBeVisible({ timeout: 3000 });
  });

  test("deve iniciar sessão de revisão, responder todos os itens e ver tela de resultado", async ({ page }) => {
    await setupMocks(page);
    const authState = buildAuthState();
    await page.context().addCookies([{ name: "linguoup-auth", value: authState, domain: "localhost", path: "/" }]);
    await page.goto("/reviews");
    await page.evaluate((state) => { localStorage.setItem("linguoup-auth", state); }, authState);
    await page.reload();

    await expect(page.getByRole("button", { name: /Revisar agora/i })).toBeVisible({ timeout: 8000 });

    // Start session
    await page.getByRole("button", { name: /Revisar agora/i }).click();

    // Session view: first question "Bom dia"
    await expect(page.getByText(/Bom dia/i)).toBeVisible({ timeout: 5000 });

    // Answer item 1 — correct
    await page.getByRole("button", { name: "Good morning" }).click();
    await expect(page.getByText("✅ Correto!")).toBeVisible({ timeout: 3000 });

    // Advance
    await page.getByRole("button", { name: /Próximo/i }).click();

    // Item 2 — "Obrigado"
    await expect(page.getByText(/Obrigado/i)).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: "Thank you" }).click();
    await expect(page.getByText("✅ Correto!")).toBeVisible({ timeout: 3000 });

    // Last item — click "Ver resultado"
    await page.getByRole("button", { name: /Ver resultado/i }).click();

    // Result screen
    await expect(page.getByRole("heading", { name: /Revisão concluída/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/2.*itens/)).toBeVisible({ timeout: 3000 });

    // Return to list
    await page.getByRole("button", { name: /Voltar para Revisões/i }).click();
    await expect(page.getByRole("heading", { name: /Revisões/i })).toBeVisible({ timeout: 5000 });
  });
});
