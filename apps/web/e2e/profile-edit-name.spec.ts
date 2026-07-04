/**
 * E2E: Jornada de edição de nome no Perfil
 *
 * Todos os endpoints de rede são mockados via Playwright route() para isolar do backend.
 * Auth state é injetado via localStorage + cookie (padrão Zustand persist) + reload.
 */
import { test, expect, Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helper: build auth state JSON
// ---------------------------------------------------------------------------
function buildAuthState(name = "Ana Teste") {
  return JSON.stringify({
    state: {
      accessToken: "mock-jwt-token",
      user: {
        id: "user-e2e-01",
        name,
        email: "ana@linguoup.test",
        role: "USER",
        onboardingCompleted: true,
      },
    },
    version: 0,
  });
}

// ---------------------------------------------------------------------------
// Helper: setup network mocks for profile page
// Note: apiFetch returns json?.data ?? json, so mocks return plain objects
// (no wrapping in { data: {} }) to match the direct-object fallback.
// ---------------------------------------------------------------------------
async function setupProfileMocks(page: Page, currentName = "Ana Teste") {
  let nameOverride = currentName;

  // GET + PATCH /users/me
  await page.route("**/api/v1/users/me", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-e2e-01",
          name: nameOverride,
          email: "ana@linguoup.test",
          targetLanguage: "en",
          learningGoal: "CAREER",
          level: 3,
          xp: 1200,
          streak: 5,
          totalLessons: 15,
          onboardingCompleted: true,
        }),
      });
    } else if (route.request().method() === "PATCH") {
      const body = JSON.parse(route.request().postData() ?? "{}");
      nameOverride = body.name ?? nameOverride;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ name: nameOverride }),
      });
    } else {
      await route.continue();
    }
  });

  // GET /xp
  await page.route("**/api/v1/xp", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ level: 3, xp: 1200, xpForNextLevel: 300, xpProgress: 80 }),
    })
  );

  // GET /achievements/me
  await page.route("**/api/v1/achievements/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    })
  );

  // GET /notifications (for badge in layout)
  await page.route("**/api/v1/notifications", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    })
  );

  // GET /users/me/home (for layout queries)
  await page.route("**/api/v1/users/me/home", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        streak: 5,
        xp: 1200,
        level: 3,
        dailyGoalMinutes: 15,
        todayMinutes: 8,
        nextLesson: null,
        pendingReviews: 0,
      }),
    })
  );
}

// ---------------------------------------------------------------------------
// Helper: inject auth and reload (same pattern as other E2E tests)
// ---------------------------------------------------------------------------
async function injectAuthAndNavigate(page: Page, path: string, name = "Ana Teste") {
  const authState = buildAuthState(name);
  await page.context().addCookies([
    { name: "linguoup-auth", value: authState, domain: "localhost", path: "/" },
  ]);
  await page.goto(path);
  await page.evaluate((state: string) => {
    localStorage.setItem("linguoup-auth", state);
  }, authState);
  await page.reload();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.describe("Perfil — Edição de Nome", () => {
  test("deve exibir perfil do usuário autenticado", async ({ page }) => {
    await setupProfileMocks(page);
    await injectAuthAndNavigate(page, "/profile");

    // Should display user name as heading
    await expect(page.getByRole("heading", { name: /Ana Teste/i })).toBeVisible({
      timeout: 8000,
    });
  });

  test("deve abrir modal de edição ao clicar em Editar", async ({ page }) => {
    await setupProfileMocks(page);
    await injectAuthAndNavigate(page, "/profile");

    // Wait for profile to load
    await expect(page.getByRole("heading", { name: /Ana Teste/i })).toBeVisible({
      timeout: 8000,
    });

    // Click edit button
    await page.getByText("✏️ Editar").click();

    // Modal with "Editar Nome" heading should appear
    await expect(page.getByRole("heading", { name: /Editar Nome/i })).toBeVisible({
      timeout: 3000,
    });
  });

  test("jornada completa: autenticar → perfil → editar nome → salvar → ver nome atualizado", async ({
    page,
  }) => {
    const updatedName = "Ana Silva";
    await setupProfileMocks(page, "Ana Teste");
    await injectAuthAndNavigate(page, "/profile", "Ana Teste");

    // Wait for profile to render with current name
    await expect(page.getByRole("heading", { name: /Ana Teste/i })).toBeVisible({
      timeout: 8000,
    });

    // Click "Editar" to open modal
    await page.getByText("✏️ Editar").click();

    // Modal opens
    await expect(page.getByRole("heading", { name: /Editar Nome/i })).toBeVisible({
      timeout: 3000,
    });

    // Clear and fill new name
    const nameInput = page.getByPlaceholder("Seu nome");
    await nameInput.clear();
    await nameInput.fill(updatedName);
    await expect(nameInput).toHaveValue(updatedName);

    // Click "Salvar"
    await page.getByRole("button", { name: /^Salvar$/ }).click();

    // Modal should close
    await expect(page.getByRole("heading", { name: /Editar Nome/i })).not.toBeVisible({
      timeout: 3000,
    });

    // Updated name should be displayed (via updateUser in store or re-fetch)
    await expect(
      page.getByRole("heading", { name: new RegExp(updatedName, "i") })
    ).toBeVisible({ timeout: 5000 });
  });
});
