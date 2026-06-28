'use client'

import { useState, useCallback, useEffect } from 'react'
import { useStartAssessment, useSubmitAssessment } from '@/hooks/useApi'
import { Button, ProgressBar, ErrorBanner } from '@/components/ui'
import type { AssessmentAnswer } from '@/types'

/**
 * INT-08 — Avaliação de Nível
 * Adaptive quiz to determine the user's language proficiency.
 */
export default function AssessmentPage() {
  const { data: session, isLoading: loadingSession, error: sessionError } = useStartAssessment()
  const submitMutation = useSubmitAssessment()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [answered, setAnswered] = useState(false)

  const questions = session?.questions ?? []
  const totalQuestions = questions.length
  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    setQuestionStartTime(Date.now())
    setSelectedOption(null)
    setAnswered(false)
  }, [currentIndex])

  const handleSelect = useCallback(
    (option: string) => {
      if (answered) return
      setSelectedOption(option)
    },
    [answered]
  )

  const handleConfirm = useCallback(() => {
    if (!selectedOption || !currentQuestion || answered) return

    const answer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      answer: selectedOption,
      timeSpentMs: Date.now() - questionStartTime,
    }

    const nextAnswers = [...answers, answer]
    setAnswers(nextAnswers)
    setAnswered(true)

    // Brief pause then advance
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((i) => i + 1)
      } else if (session) {
        submitMutation.mutate({
          sessionId: session.sessionId,
          answers: nextAnswers,
        })
      }
    }, 600)
  }, [
    selectedOption,
    currentQuestion,
    answered,
    questionStartTime,
    answers,
    currentIndex,
    totalQuestions,
    session,
    submitMutation,
  ])

  if (loadingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" aria-hidden="true" />
        <p className="text-sm text-neutral-500">Preparing your assessment…</p>
      </div>
    )
  }

  if (sessionError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 bg-white dark:bg-neutral-950">
        <ErrorBanner message="Couldn't start the assessment. Please try again." />
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (submitMutation.isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" aria-hidden="true" />
        <p className="text-sm text-neutral-500">Analysing your answers…</p>
      </div>
    )
  }

  if (submitMutation.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 bg-white dark:bg-neutral-950">
        <ErrorBanner message="Couldn't submit your answers. Please try again." />
        <Button onClick={() => submitMutation.reset()}>Retry</Button>
      </div>
    )
  }

  if (!currentQuestion) return null

  const isMultipleChoice = currentQuestion.type === 'multiple_choice'

  return (
    <main className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="flex flex-col gap-3 px-5 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-widest text-violet-500">
            Level assessment
          </span>
          <span className="text-xs text-neutral-400">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <ProgressBar
          current={currentIndex + 1}
          total={totalQuestions}
          label="Assessment progress"
        />
      </header>

      {/* Question */}
      <div className="flex flex-1 flex-col gap-8 px-5 pt-6 pb-10">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
            Question {currentIndex + 1}
          </span>
          <p className="text-lg font-medium leading-snug text-neutral-900 dark:text-white">
            {currentQuestion.prompt}
          </p>
        </div>

        {isMultipleChoice && currentQuestion.options && (
          <div
            className="flex flex-col gap-2"
            role="radiogroup"
            aria-label={`Options for question ${currentIndex + 1}`}
          >
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option
              const isCorrect = answered && option === currentQuestion.correctAnswer
              const isWrong = answered && isSelected && option !== currentQuestion.correctAnswer

              return (
                <button
                  key={option}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(option)}
                  disabled={answered}
                  className={`
                    flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium
                    transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
                    disabled:cursor-default
                    ${
                      isCorrect
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : isWrong
                        ? 'border-red-400 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
                        : isSelected
                        ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/30 dark:text-violet-300'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-violet-300 hover:bg-violet-50/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200'
                    }
                  `}
                >
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs
                      ${
                        isCorrect
                          ? 'border-emerald-400 bg-emerald-400 text-white'
                          : isWrong
                          ? 'border-red-400 bg-red-400 text-white'
                          : isSelected
                          ? 'border-violet-500 bg-violet-500 text-white'
                          : 'border-neutral-300 dark:border-neutral-600'
                      }
                    `}
                    aria-hidden="true"
                  >
                    {isCorrect ? '✓' : isWrong ? '✗' : ''}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>
        )}

        {currentQuestion.type === 'fill_blank' && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              placeholder="Type your answer…"
              value={selectedOption ?? ''}
              onChange={(e) => handleSelect(e.target.value)}
              disabled={answered}
              aria-label="Your answer"
            />
          </div>
        )}

        <div className="mt-auto">
          <Button
            fullWidth
            size="lg"
            disabled={!selectedOption || answered}
            onClick={handleConfirm}
          >
            {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next question'}
          </Button>
        </div>
      </div>
    </main>
  )
}
