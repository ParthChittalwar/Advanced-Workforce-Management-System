import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  Briefcase, Building2, AlertCircle, CheckCircle, ChevronLeft,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { addEmployee, generateId, getEmployees } from '../utils/storage'
import type { Department, Employee } from '../types'

const DEPARTMENTS: Department[] = [
  'Engineering','Design','Marketing','HR','Finance','DevOps','QA','Management','Sales',
]

export default function Register() {
  const navigate = useNavigate()
  const { login } = useStore()

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    phone: '', department: '' as Department | '', position: '',
  })
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  function update(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 3) {
      setError('Password must be at least 3 characters.')
      return
    }
    if (!form.department) {
      setError('Please select a department.')
      return
    }

    // Check duplicate email
    const existing = getEmployees().find(e => e.email === form.email)
    if (existing) { setError('An account with this email already exists.'); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 700))

    const newEmployee: Employee = {
      id:          generateId('emp'),
      role:        'employee',
      firstName:   form.firstName.trim(),
      lastName:    form.lastName.trim(),
      email:       form.email.trim().toLowerCase(),
      password:    form.password,
      department:  form.department as Department,
      position:    form.position.trim() || 'Team Member',
      phone:       form.phone.trim() || 'N/A',
      joinDate:    new Date().toISOString().split('T')[0],
      salary:      60000,
      status:      'active',
      performance: 75,
      skills:      [],
      taskCounts:  { newTask: 0, active: 0, completed: 0, failed: 0 },
      tasks:       [],
    }

    addEmployee(newEmployee)
    setSuccess(true)
    setLoading(false)

    setTimeout(() => {
      login(newEmployee, 'employee')
      navigate('/employee')
    }, 1400)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/login"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Briefcase size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">Parth Studio EMS</span>
          </div>
        </div>

        <div className="card border-zinc-800 bg-zinc-900 p-7 lg:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-black text-zinc-100 mb-1.5">Create Account</h1>
            <p className="text-sm text-zinc-500">Register as an employee to access your dashboard</p>
          </div>

          {/* Success state */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-8"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                <CheckCircle size={26} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 mb-1">Account Created!</h3>
              <p className="text-sm text-zinc-500">Redirecting to your dashboard…</p>
              <div className="mt-4 flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </motion.div>
          )}

          {!success && (
            <>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label" style={{ color: '#9ca3af' }}>First Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input type="text" required value={form.firstName}
                        onChange={e => update('firstName', e.target.value)}
                        placeholder="Arjun" className="input pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" style={{ color: '#9ca3af' }}>Last Name</label>
                    <input type="text" required value={form.lastName}
                      onChange={e => update('lastName', e.target.value)}
                      placeholder="Kumar" className="input"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="input-label" style={{ color: '#9ca3af' }}>Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <input type="email" required value={form.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="you@example.com" className="input pl-9"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="input-label" style={{ color: '#9ca3af' }}>Phone (optional)</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <input type="tel" value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="+91 98765 43210" className="input pl-9"
                    />
                  </div>
                </div>

                {/* Department + Position */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label" style={{ color: '#9ca3af' }}>Department</label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <select
                        required
                        value={form.department}
                        onChange={e => update('department', e.target.value)}
                        className="input pl-9 appearance-none cursor-pointer"
                      >
                        <option value="">Select…</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="input-label" style={{ color: '#9ca3af' }}>Position</label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input type="text" value={form.position}
                        onChange={e => update('position', e.target.value)}
                        placeholder="Developer" className="input pl-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label" style={{ color: '#9ca3af' }}>Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        required value={form.password}
                        onChange={e => update('password', e.target.value)}
                        placeholder="••••••••" className="input pl-9 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="input-label" style={{ color: '#9ca3af' }}>Confirm</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        required value={form.confirmPassword}
                        onChange={e => update('confirmPassword', e.target.value)}
                        placeholder="••••••••" className="input pl-9"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-lg btn-primary w-full mt-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
                  ) : 'Create Employee Account'}
                </button>
              </form>

              <p className="text-center text-sm text-zinc-500 mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
