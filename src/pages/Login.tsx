import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, LogIn,
  Shield, Briefcase, ChevronRight, Zap,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { getAdmin, getEmployees } from '../utils/storage'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated, userRole } = useStore()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [remember, setRemember] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate(userRole === 'admin' ? '/admin' : '/employee', { replace: true })
    return null
  }

  function fillAdmin() {
    setEmail('Parth@hero.com')
    setPassword('Parth123')
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 600)) // simulate network

    const admin = getAdmin()
    if (admin && email === admin.email && password === admin.password) {
      login(admin, 'admin')
      navigate('/admin')
      return
    }

    const employees = getEmployees()
    const emp = employees.find(e => e.email === email && e.password === password)
    if (emp) {
      login(emp, 'employee')
      navigate('/employee')
      return
    }

    setError('Invalid email or password. Please try again.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* ── Left panel ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        {/* Content */}
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Parth Studio <span className="text-brand-400">EMS</span></span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Welcome back to<br />
            <span className="gradient-text">your workspace</span>
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed mb-10">
            Sign in to manage your team, track tasks, and drive productivity across your organisation.
          </p>

          {/* Features list */}
          {[
            { icon: Shield,    text: 'Role-based admin & employee access' },
            { icon: Zap,       text: 'Real-time task tracking dashboard' },
            { icon: ChevronRight, text: 'Full employee lifecycle management' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/25 flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-brand-400" />
              </div>
              <span className="text-sm text-zinc-400">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* Bottom quote */}
        <div className="relative border border-white/[0.07] rounded-xl p-4 bg-white/[0.02]">
          <p className="text-sm text-zinc-400 italic mb-2">
            "The most polished employee management tool I've used — everything just works."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-purple-500" />
            <span className="text-xs text-zinc-500 font-medium">Parth · Founder, Parth Studio</span>
          </div>
        </div>
      </div>

      {/* ── Right panel — Login form ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-zinc-950" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Briefcase size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">Parth Studio EMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-1.5">Sign in</h2>
            <p className="text-sm text-zinc-500">Enter your credentials to access your account</p>
          </div>

          {/* Quick fill button */}
          <button
            type="button"
            onClick={fillAdmin}
            className="w-full mb-6 flex items-center gap-3 px-4 py-3 rounded-xl
                       border border-brand-500/30 bg-brand-500/8 hover:bg-brand-500/12
                       text-brand-300 hover:text-brand-200 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Shield size={14} className="text-brand-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-brand-300">Fill Admin Credentials</p>
              <p className="text-[10px] text-brand-500 mt-0.5">Parth@hero.com · Parth123</p>
            </div>
            <ChevronRight size={14} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600">or sign in manually</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-950/40 border border-rose-500/30 mb-5"
            >
              <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
              <p className="text-sm text-rose-300">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="input-label" style={{ color: '#9ca3af' }}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="input-label" style={{ color: '#9ca3af' }}>Password</label>
                <button type="button" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center
                  ${remember
                    ? 'bg-brand-600 border-brand-600'
                    : 'bg-transparent border-zinc-600 group-hover:border-zinc-400'
                  }`}>
                  {remember && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-lg btn-primary w-full shadow-glow-sm mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-zinc-500 mt-6">
            New employee?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create an account
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Demo Accounts</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Admin</span>
                <code className="text-zinc-400">Parth@hero.com / Parth123</code>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Employee</span>
                <code className="text-zinc-400">e@e.com / 123</code>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
