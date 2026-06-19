import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, CheckSquare, BarChart3, Shield, Zap,
  ArrowRight, ChevronRight, Star, Briefcase,
} from 'lucide-react'
import { useStore } from '../store/useStore'

const FEATURES = [
  { icon: Users,       title: 'Employee Directory',   desc: 'Manage your entire workforce from a single, beautiful dashboard with search and smart filters.' },
  { icon: CheckSquare, title: 'Task Management',       desc: 'Assign, track, and complete tasks with priority levels, due dates, and real-time status updates.' },
  { icon: BarChart3,   title: 'Analytics & Reports',  desc: 'Gain deep insights into team performance, productivity trends, and department-level metrics.' },
  { icon: Shield,      title: 'Role-Based Access',     desc: 'Granular permissions for Admins and Employees — everyone sees exactly what they need.' },
  { icon: Zap,         title: 'Lightning Fast',        desc: 'Built on Vite + React with optimised rendering so your team never waits for the dashboard.' },
  { icon: Star,        title: 'Premium Experience',    desc: 'Designed with care — dark-first aesthetic, smooth animations, and full mobile responsiveness.' },
]

const STATS = [
  { value: '8+',   label: 'Team Members' },
  { value: '20+',  label: 'Tasks Tracked' },
  { value: '99%',  label: 'Uptime' },
  { value: '100%', label: 'Satisfaction' },
]

const FADE_UP = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
})

export default function Landing() {
  const { isAuthenticated, userRole, bootstrap } = useStore()
  const navigate = useNavigate()

  useEffect(() => { bootstrap() }, [bootstrap])

  function handleGetStarted() {
    if (isAuthenticated) {
      navigate(userRole === 'admin' ? '/admin' : '/employee')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16
                      bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Briefcase size={14} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">Parth Studio <span className="text-brand-400">EMS</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
            Sign In
          </Link>
          <button
            onClick={handleGetStarted}
            className="btn-sm btn-primary"
          >
            Get Started <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 lg:px-12 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]
                          bg-gradient-radial from-brand-600/20 via-purple-600/5 to-transparent
                          rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-72 h-72 bg-brand-500/8 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-20 right-1/4 w-56 h-56 bg-purple-500/8 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <motion.div {...FADE_UP(0)} className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                           bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Modern HR Platform · Built for teams
          </span>
        </motion.div>

        <motion.h1 {...FADE_UP(0.08)} className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-balance">
          Manage Your Team
          <br />
          <span className="gradient-text">with Confidence</span>
        </motion.h1>

        <motion.p {...FADE_UP(0.16)} className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 text-balance leading-relaxed">
          Parth Studio Employee Management — a premium SaaS platform for tracking tasks,
          managing employees, and driving productivity across your organisation.
        </motion.p>

        <motion.div {...FADE_UP(0.22)} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
          <button
            onClick={handleGetStarted}
            className="btn-lg btn-primary shadow-glow-indigo"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'}
            <ArrowRight size={18} />
          </button>
          <Link to="/login" className="btn-lg btn-ghost border border-zinc-700">
            Sign in as Admin <ChevronRight size={16} />
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/[0.07]"
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors py-5 px-4">
              <p className="text-2xl font-black gradient-text-subtle">{value}</p>
              <p className="text-xs text-zinc-500 mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Dashboard preview mockup ─────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl bg-zinc-900">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-zinc-900/80">
              <div className="w-3 h-3 rounded-full bg-rose-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="flex-1 mx-3">
                <div className="mx-auto w-40 h-5 rounded-md bg-zinc-800 flex items-center justify-center">
                  <span className="text-[9px] text-zinc-500">dashboard.parthstudio.app</span>
                </div>
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="p-5 grid grid-cols-4 gap-3">
              {/* Sidebar mock */}
              <div className="hidden sm:block col-span-1 bg-zinc-950/60 rounded-xl p-3 space-y-2">
                <div className="h-6 bg-brand-600/30 rounded-lg" />
                {['Dashboard','Employees','Tasks','Create Task'].map(l => (
                  <div key={l} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-800/50">
                    <div className="w-3 h-3 bg-zinc-700 rounded" />
                    <div className="h-2 bg-zinc-700 rounded flex-1" />
                  </div>
                ))}
              </div>
              {/* Content mock */}
              <div className="col-span-4 sm:col-span-3 space-y-3">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2">
                  {[['brand','8','Employees'],['emerald','13','Completed'],['amber','6','Active'],['rose','1','Failed']].map(([c,v,l]) => (
                    <div key={l} className={`bg-zinc-800/60 rounded-xl p-3 border border-${c}-500/20`}>
                      <p className={`text-lg font-bold text-${c}-400`}>{v}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
                {/* Table mock */}
                <div className="bg-zinc-800/40 rounded-xl p-3">
                  <div className="h-2.5 w-24 bg-zinc-700 rounded mb-3" />
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b border-zinc-700/40 last:border-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500/50 to-purple-500/50 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-2 bg-zinc-700 rounded w-24 mb-1.5" />
                        <div className="h-1.5 bg-zinc-800 rounded w-16" />
                      </div>
                      <div className="h-4 w-12 bg-emerald-500/20 rounded-full border border-emerald-500/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 pb-28">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4 text-balance">
              A complete HR toolkit,<br />
              <span className="gradient-text">beautifully designed</span>
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-balance">
              From employee onboarding to task tracking and performance analytics — all in one platform.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                viewport={{ once: true }}
                className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-brand-500/25
                           rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20
                                flex items-center justify-center mb-4 group-hover:bg-brand-500/15 transition-colors">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <h3 className="font-bold text-zinc-100 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-12 pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl border border-brand-500/25
                     bg-gradient-to-b from-brand-950/60 to-zinc-950 p-12"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-glow-indigo">
            <Briefcase size={24} className="text-white" />
          </div>
          <h2 className="text-3xl font-black mb-4 text-balance">
            Ready to transform your<br />
            <span className="gradient-text">team management?</span>
          </h2>
          <p className="text-zinc-400 mb-8 text-balance">
            Sign in as Admin with your credentials or register as an employee to get started immediately.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleGetStarted}
              className="btn-lg btn-primary shadow-glow-indigo w-full sm:w-auto"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'} <ArrowRight size={18} />
            </button>
            <Link to="/register" className="btn-lg btn-ghost border border-zinc-700 w-full sm:w-auto">
              Register as Employee
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Briefcase size={11} className="text-white" />
            </div>
            <span className="text-sm text-zinc-400 font-medium">Parth Studio EMS</span>
          </div>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Parth Studio · Built with ♥ by Parth
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login"    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Login</Link>
            <Link to="/register" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
