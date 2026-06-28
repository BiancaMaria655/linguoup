import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  OnboardingData,
  OnboardingResponse,
  AssessmentResponse,
  AssessmentAnswer,
  AssessmentResult,
} from '@/types'
const API_BASE = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const cleanUrl = url.replace(/\/+$/, "");
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
})();

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let body: unknown
    try {
      body = await res.json()
    } catch {
      // non-JSON error body
    }
    throw new ApiError(
      res.status,
      (body as { message?: string })?.message ?? res.statusText,
      body
    )
  }

  return res.json() as Promise<T>
}

// ── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  refresh: (refreshToken: string): Promise<{ accessToken: string }> =>
    request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (token: string): Promise<void> =>
    request('/auth/logout', { method: 'POST' }, token),
}

// ── Onboarding ──────────────────────────────────────────────────────────────

export const onboardingApi = {
  submit: (data: OnboardingData, token: string): Promise<OnboardingResponse> =>
    request(
      '/users/onboarding',
      { method: 'POST', body: JSON.stringify(data) },
      token
    ),
}

// ── Assessment ──────────────────────────────────────────────────────────────

export const assessmentApi = {
  start: (token: string): Promise<AssessmentResponse> =>
    request('/assessment/start', { method: 'POST' }, token),

  submit: (
    sessionId: string,
    answers: AssessmentAnswer[],
    token: string
  ): Promise<AssessmentResult> =>
    request(
      `/assessment/${sessionId}/submit`,
      { method: 'POST', body: JSON.stringify({ answers }) },
      token
    ),
}

export { ApiError }
