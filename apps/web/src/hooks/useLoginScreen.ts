import { useState, useCallback } from 'react'
import { useLogin } from '@/hooks/useApi'
import { getErrorMessage } from '@/hooks/useApi'

interface LoginFormState {
  email: string
  password: string
}

interface LoginFormErrors {
  email?: string
  password?: string
  general?: string
}

function validateEmail(email: string): string | undefined {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email'
  return undefined
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return undefined
}

export function useLoginScreen() {
  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPassword, setShowPassword] = useState(false)

  const loginMutation = useLogin()

  const handleChange = useCallback(
    (field: keyof LoginFormState) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      if (touched[field]) {
        // Re-validate on change after first blur
        const validate =
          field === 'email' ? validateEmail : validatePassword
        const err = validate(value)
        setErrors((prev) => ({ ...prev, [field]: err, general: undefined }))
      }
    },
    [touched]
  )

  const handleBlur = useCallback(
    (field: keyof LoginFormState) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const validate = field === 'email' ? validateEmail : validatePassword
      const err = validate(form[field])
      setErrors((prev) => ({ ...prev, [field]: err }))
    },
    [form]
  )

  const handleSubmit = useCallback(async () => {
    const emailErr = validateEmail(form.email)
    const passwordErr = validatePassword(form.password)

    setTouched({ email: true, password: true })
    setErrors({ email: emailErr, password: passwordErr })

    if (emailErr || passwordErr) return

    try {
      await loginMutation.mutateAsync({
        email: form.email,
        password: form.password,
      })
    } catch (err) {
      setErrors({ general: getErrorMessage(err) })
    }
  }, [form, loginMutation])

  const togglePassword = useCallback(
    () => setShowPassword((v) => !v),
    []
  )

  return {
    form,
    errors,
    touched,
    showPassword,
    isLoading: loginMutation.isPending,
    handleChange,
    handleBlur,
    handleSubmit,
    togglePassword,
  }
}
