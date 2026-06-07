import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'

const SignUp: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedRole = searchParams.get('role') || 'student'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const passwordMismatch = useMemo(() => {
    if (!password || !confirmPassword) return false
    return password !== confirmPassword
  }, [password, confirmPassword])

  const roleLabel = selectedRole === 'organizer' ? 'Organizer' : 'Student'
  const dashboardPath = selectedRole === 'organizer' ? '/organizer' : '/attendee'

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env, then restart the dev server.',
      )
      return
    }

    if (passwordMismatch) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const supabase = getSupabase()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: selectedRole,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data?.user && !data.session) {
        setInfo('Account created. Check your email to confirm, then sign in.')
        return
      }

      navigate(dashboardPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-60px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[460px] bg-white border border-[#e7e7e7] rounded-xl p-8">
        <h1 className="text-[1.8rem] font-extrabold tracking-tight text-[#111] mb-2">Register</h1>
        <p className="text-[0.95rem] text-[#666] mb-1">Create your FestForge account.</p>

        {/* Role badge */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-[0.8rem] text-[#888]">Joining as</span>
          <span
            className="text-[0.78rem] font-semibold px-3 py-1 rounded-full"
            style={{
              background: selectedRole === 'organizer' ? '#EEF2FF' : '#F0FDF4',
              color: selectedRole === 'organizer' ? '#4F46E5' : '#16A34A',
              border: `1px solid ${selectedRole === 'organizer' ? '#C7D2FE' : '#BBF7D0'}`,
            }}
          >
            {roleLabel}
          </span>
          <Link
            to="/register"
            className="text-[0.78rem] text-[#888] underline ml-auto hover:text-[#111] transition-colors"
          >
            Change role
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.9rem] text-red-700">
            {error}
          </div>
        ) : null}

        {info ? (
          <div className="mb-4 rounded-lg border border-[#d0d0d0] bg-white px-4 py-3 text-[0.9rem] text-[#333]">
            {info}{' '}
            <Link to="/signin" className="font-semibold text-[#111] underline">
              Go to sign in
            </Link>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[0.85rem] font-semibold text-[#111]">Full name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#d0d0d0] bg-white text-[#111] outline-none focus:border-[#aaa] transition-colors"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[0.85rem] font-semibold text-[#111]">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#d0d0d0] bg-white text-[#111] outline-none focus:border-[#aaa] transition-colors"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[0.85rem] font-semibold text-[#111]">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#d0d0d0] bg-white text-[#111] outline-none focus:border-[#aaa] transition-colors"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[0.85rem] font-semibold text-[#111]">Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#d0d0d0] bg-white text-[#111] outline-none focus:border-[#aaa] transition-colors"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading || passwordMismatch}
            className="mt-2 px-[18px] py-[10px] rounded-lg border-none bg-[#111] text-white text-[0.9rem] font-semibold cursor-pointer hover:bg-[#333] hover:-translate-y-px transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#111] disabled:hover:translate-y-0"
          >
            {isLoading ? 'Creating account…' : `Register as ${roleLabel}`}
          </button>
        </form>

        <p className="mt-5 text-center text-[0.88rem] text-[#666]">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-[#111] underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}

export default SignUp
