import { useState, useCallback } from 'react'
import { useRegister, getErrorMessage } from '@/hooks/useApi'

interface RegisterFormState {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface RegisterFormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

function validate(form: RegisterFormState): RegisterFormErrors {
  const errors: RegisterFormErrors = {}

  if (!form.name.trim()) errors.name = 'Your name is required'
  else if (form.name.trim().length < 2) errors.name = 'Name is too short'

  if (!form.email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email'

  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 8)
    errors.password = 'Password must be at least 8 characters'
  else if (!/[A-Z]/.test(form.password))
    errors.password = 'Include at least one uppercase letter'

  if (!form.confirmPassword)
    errors.confirmPassword = 'Confirm your password'
  else if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords don't match"

  return errors
}

export function useRegisterScreen() {
  const [form, setForm] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPassword, setShowPassword] = useState(false)

  const registerMutation = useRegister()

  const handleChange = useCallback(
    (field: keyof RegisterFormState) => (value: string) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value }
        if (touched[field]) {
          const fieldErrors = validate(next)
          setErrors((e) => ({ ...e, [field]: fieldErrors[field], general: undefined }))
        }
        return next
      })
    },
    [touched]
  )

  const handleBlur = useCallback(
    (field: keyof RegisterFormState) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const fieldErrors = validate(form)
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }))
    },
    [form]
  )

  const handleSubmit = useCallback(async () => {
    const allTouched = { name: true, email: true, password: true, confirmPassword: true }
    setTouched(allTouched)
    const fieldErrors = validate(form)
    setErrors(fieldErrors)

    if (Object.keys(fieldErrors).length > 0) return

    try {
      await registerMutation.mutateAsync({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      })
    } catch (err) {
      setErrors({ general: getErrorMessage(err) })
    }
  }, [form, registerMutation])

  return {
    form,
    errors,
    touched,
    showPassword,
    isLoading: registerMutation.isPending,
    handleChange,
    handleBlur,
    handleSubmit,
    togglePassword: () => setShowPassword((v) => !v),
  }
}
