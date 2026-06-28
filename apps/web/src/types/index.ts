// Auth types
export interface User {
  id: string
  name: string
  email: string
  onboardingCompleted: boolean
  assessmentCompleted: boolean
  level?: ProficiencyLevel
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// Onboarding types
export type LearningGoal =
  | 'travel'
  | 'work'
  | 'study'
  | 'culture'
  | 'family'
  | 'other'

export type Language =
  | 'english'
  | 'spanish'
  | 'portuguese'
  | 'french'
  | 'german'
  | 'italian'
  | 'mandarin'
  | 'japanese'
  | 'korean'
  | 'arabic'

export type DailyMinutes = 5 | 10 | 15 | 20 | 30

export type ProficiencyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface OnboardingData {
  learningGoal?: LearningGoal
  targetLanguage?: Language
  dailyMinutes?: DailyMinutes
  nativeLanguage?: Language
}

export interface OnboardingResponse {
  plan: {
    weeklyLessons: number
    dailyMinutes: DailyMinutes
    estimatedLevelUpWeeks: number
  }
  user: User
}

// Assessment types
export interface AssessmentQuestion {
  id: string
  type: 'multiple_choice' | 'fill_blank' | 'listening'
  prompt: string
  options?: string[]
  correctAnswer: string
  difficulty: ProficiencyLevel
  language: Language
}

export interface AssessmentAnswer {
  questionId: string
  answer: string
  timeSpentMs: number
}

export interface AssessmentResult {
  level: ProficiencyLevel
  score: number
  totalQuestions: number
  correctAnswers: number
  strengths: string[]
  improvements: string[]
  nextSteps: string
}

export interface AssessmentResponse {
  sessionId: string
  questions: AssessmentQuestion[]
}

// UI state types
export type OnboardingStep =
  | 'goal'
  | 'language'
  | 'availability'
  | 'plan'
  | 'assessment'
  | 'result'
