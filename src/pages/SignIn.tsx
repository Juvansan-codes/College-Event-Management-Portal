import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'

const SignIn: React.FC = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setError(null)

    if (!isSupabaseConfigured) {
      setError(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env, then restart the dev server.',
      )
      return
    }

    setIsLoading(true)

    try {
      const supabase = getSupabase()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      /* Redirect based on the role stored in user metadata */
      const role = data.user?.user_metadata?.role
      if (role === 'organizer') {
        navigate('/organizer')
      } else {
        navigate('/attendee')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-60px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px] bg-white border border-[#e7e7e7] rounded-xl p-8">
        <h1 className="text-[1.8rem] font-extrabold tracking-tight text-[#111] mb-2">Sign in</h1>
        <p className="text-[0.95rem] text-[#666] mb-6">Welcome back to FestForge.</p>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.9rem] text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-[#d0d0d0] bg-white text-[#111] outline-none focus:border-[#aaa] transition-colors"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 px-[18px] py-[10px] rounded-lg border-none bg-[#111] text-white text-[0.9rem] font-semibold cursor-pointer hover:bg-[#333] hover:-translate-y-px transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#111] disabled:hover:translate-y-0"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-[0.88rem] text-[#666]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#111] underline">
            Register
          </Link>
        </p>
      </div>
    </section>
  )
}

export default SignIn
