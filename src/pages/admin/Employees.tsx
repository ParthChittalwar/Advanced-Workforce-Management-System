import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, UserPlus, X, Mail, Phone, Briefcase, Building2,
  Lock, TrendingUp, CheckSquare, Clock, AlertTriangle,
  Filter, ChevronDown, Eye, Trash2, UserCheck,
} from 'lucide-react'
import { getEmployees, addEmployee, deleteEmployee, generateId } from '../../utils/storage'
import type { Department, Employee } from '../../types'

const DEPARTMENTS: Department[] = [
  'Engineering','Design','Marketing','HR','Finance','DevOps','QA','Management','Sales',
]

const DEPT_COLORS: Record<string, string> = {
  Engineering: 'badge-indigo', Design: 'badge-purple', Marketing: 'badge-amber',
  HR: 'badge-emerald', Finance: 'badge-sky', DevOps: 'badge-rose',
  QA: 'badge-zinc', Management: 'badge-indigo', Sales: 'badge-amber',
}

function Initials({ emp }: { emp: Employee }) {
  const colors = [
    'from-brand-400 to-indigo-600','from-pink-400 to-rose-500','from-orange-400 to-amber-500',
    'from-green-400 to-emerald-500','from-violet-400 to-purple-600','from-teal-400 to-cyan-500',
    'from-blue-400 to-sky-600','from-red-400 to-pink-500',
  ]
  const idx = (emp.firstName.charCodeAt(0) + emp.lastName.charCodeAt(0)) % colors.length
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
      {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
    </div>
  )
}

interface NewEmpForm {
  firstName: string; lastName: string; email: string; password: string;
  department: Department | ''; position: string; phone: string; salary: string;
}

const EMPTY_FORM: NewEmpForm = {
  firstName:'', lastName:'', email:'', password:'', department:'',
  position:'', phone:'', salary:'',
}

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [query,     setQuery]     = useState('')
  const [deptFilter, setDeptFilter] = useState<Department | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<'All'|'active'|'inactive'|'on-leave'>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewEmp,      setViewEmp]      = useState<Employee | null>(null)
  const [form,  setForm]  = useState<NewEmpForm>(EMPTY_FORM)
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving]   = useState(false)

  function reload() { setEmployees(getEmployees()) }
  useEffect(() => { reload() }, [])

  const filtered = useMemo(() => {
    let list = [...employees]
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(e =>
        `${e.firstName} ${e.lastName} ${e.email} ${e.department} ${e.position}`.toLowerCase().includes(q)
      )
    }
    if (deptFilter !== 'All') list = list.filter(e => e.department === deptFilter)
    if (statusFilter !== 'All') list = list.filter(e => e.status === statusFilter)
    return list
  }, [employees, query, deptFilter, statusFilter])

  function updateForm(k: keyof NewEmpForm, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    setFormErr('')
  }

  async function handleAdd() {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.department) {
      setFormErr('Please fill in all required fields.')
      return
    }
    if (employees.find(e => e.email === form.email)) {
      setFormErr('Email already exists.')
      return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))

    const emp: Employee = {
      id: generateId('emp'),
      role: 'employee',
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      department: form.department as Department,
      position: form.position.trim() || 'Team Member',
      phone: form.phone.trim() || 'N/A',
      joinDate: new Date().toISOString().split('T')[0],
      salary: parseInt(form.salary) || 60000,
      status: 'active',
      performance: 75,
      skills: [],
      taskCounts: { newTask: 0, active: 0, completed: 0, failed: 0 },
      tasks: [],
    }
    addEmployee(emp)
    reload()
    setShowAddModal(false)
    setForm(EMPTY_FORM)
    setSaving(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Remove this employee? This cannot be undone.')) return
    deleteEmployee(id)
    reload()
    if (viewEmp?.id === id) setViewEmp(null)
  }

  const totalTasks = employees.reduce((s, e) => s + e.tasks.length, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} total · {employees.filter(e => e.status === 'active').length} active · {totalTasks} tasks assigned</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-md btn-primary shadow-glow-sm"
        >
          <UserPlus size={15} /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, email, role…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="relative">
            <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select value={deptFilter}
              onChange={e => setDeptFilter(e.target.value as typeof deptFilter)}
              className="input pl-9 pr-8 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="All">All Depts.</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="input pl-9 pr-8 appearance-none cursor-pointer min-w-[130px]"
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Employee grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Search size={20} className="text-zinc-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No employees found</p>
          <p className="text-xs text-zinc-500 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp, i) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="card p-4 card-hover group"
            >
              <div className="flex items-start justify-between mb-3">
                <Initials emp={emp} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setViewEmp(emp)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {emp.firstName} {emp.lastName}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{emp.position}</p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`${DEPT_COLORS[emp.department] ?? 'badge-zinc'} text-[11px]`}>
                  {emp.department}
                </span>
                <span className={`${emp.status === 'active' ? 'badge-emerald' : emp.status === 'on-leave' ? 'badge-amber' : 'badge-zinc'} text-[11px]`}>
                  {emp.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-3">
                <span title="Performance">⭐ {emp.performance}%</span>
                <span title="Tasks">{emp.tasks.length} tasks</span>
              </div>

              {/* Mini task summary */}
              <div className="grid grid-cols-4 gap-1 text-center">
                {[
                  { val: emp.taskCounts.newTask,   col: 'text-sky-500',     label: 'N' },
                  { val: emp.taskCounts.active,    col: 'text-brand-500',   label: 'A' },
                  { val: emp.taskCounts.completed, col: 'text-emerald-500', label: 'C' },
                  { val: emp.taskCounts.failed,    col: 'text-rose-500',    label: 'F' },
                ].map(({ val, col, label }) => (
                  <div key={label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg py-1">
                    <p className={`text-xs font-bold ${col}`}>{val}</p>
                    <p className="text-[9px] text-zinc-500">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Add Employee Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <Modal onClose={() => { setShowAddModal(false); setForm(EMPTY_FORM); setFormErr('') }}>
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Add New Employee</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Fill in the details to add a new team member</p>
              </div>
              <button onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto custom-scroll max-h-[60vh]">
              {formErr && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/30">
                  <span className="text-xs text-rose-600 dark:text-rose-300">{formErr}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="First Name *" icon={<UserCheck size={13}/>}>
                  <input className="input pl-9" placeholder="Arjun" value={form.firstName}
                    onChange={e => updateForm('firstName', e.target.value)} required />
                </FormField>
                <FormField label="Last Name *" icon={<UserCheck size={13}/>}>
                  <input className="input pl-9" placeholder="Kumar" value={form.lastName}
                    onChange={e => updateForm('lastName', e.target.value)} required />
                </FormField>
              </div>
              <FormField label="Email *" icon={<Mail size={13}/>}>
                <input className="input pl-9" type="email" placeholder="arjun@example.com" value={form.email}
                  onChange={e => updateForm('email', e.target.value)} required />
              </FormField>
              <FormField label="Password *" icon={<Lock size={13}/>}>
                <input className="input pl-9" type="text" placeholder="Set a password" value={form.password}
                  onChange={e => updateForm('password', e.target.value)} required />
              </FormField>
              <FormField label="Phone" icon={<Phone size={13}/>}>
                <input className="input pl-9" placeholder="+91 98765 43210" value={form.phone}
                  onChange={e => updateForm('phone', e.target.value)} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Department *" icon={<Building2 size={13}/>}>
                  <select className="input pl-9 appearance-none cursor-pointer" value={form.department}
                    onChange={e => updateForm('department', e.target.value)} required>
                    <option value="">Select…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </FormField>
                <FormField label="Position" icon={<Briefcase size={13}/>}>
                  <input className="input pl-9" placeholder="Developer" value={form.position}
                    onChange={e => updateForm('position', e.target.value)} />
                </FormField>
              </div>
              <FormField label="Salary (₹)" icon={<TrendingUp size={13}/>}>
                <input className="input pl-9" type="number" placeholder="60000" value={form.salary}
                  onChange={e => updateForm('salary', e.target.value)} />
              </FormField>
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex gap-3 justify-end">
              <button onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM) }}
                className="btn-md btn-secondary">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="btn-md btn-primary">
                {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving…</> : <><UserPlus size={14}/>Add Employee</>}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── View Employee Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewEmp && (
          <Modal onClose={() => setViewEmp(null)}>
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Initials emp={viewEmp} />
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {viewEmp.firstName} {viewEmp.lastName}
                  </h2>
                  <p className="text-xs text-zinc-500">{viewEmp.position} · {viewEmp.department}</p>
                </div>
              </div>
              <button onClick={() => setViewEmp(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scroll max-h-[70vh] space-y-5">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'New',       val: viewEmp.taskCounts.newTask,   color: 'text-sky-500' },
                  { label: 'Active',    val: viewEmp.taskCounts.active,    color: 'text-brand-500' },
                  { label: 'Completed', val: viewEmp.taskCounts.completed, color: 'text-emerald-500' },
                  { label: 'Failed',    val: viewEmp.taskCounts.failed,    color: 'text-rose-500' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="card p-3 text-center">
                    <p className={`text-lg font-black ${color}`}>{val}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Email',       val: viewEmp.email },
                  { label: 'Phone',       val: viewEmp.phone },
                  { label: 'Join Date',   val: viewEmp.joinDate },
                  { label: 'Salary',      val: `₹${viewEmp.salary.toLocaleString()}` },
                  { label: 'Performance', val: `${viewEmp.performance}%` },
                  { label: 'Status',      val: viewEmp.status },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-0.5">{label}</p>
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium">{val}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {viewEmp.skills.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewEmp.skills.map(s => (
                      <span key={s} className="badge-indigo text-[11px]">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                  Tasks ({viewEmp.tasks.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scroll">
                  {viewEmp.tasks.length === 0
                    ? <p className="text-xs text-zinc-500 italic">No tasks assigned yet.</p>
                    : viewEmp.tasks.map(t => (
                      <div key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/40">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-rose-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-zinc-500'}`} />
                        <p className="flex-1 text-xs text-zinc-800 dark:text-zinc-200 font-medium truncate">{t.title}</p>
                        <span className={`text-[10px] ${t.status === 'completed' ? 'text-emerald-500' : t.status === 'active' ? 'text-brand-500' : t.status === 'new' ? 'text-sky-500' : 'text-rose-500'}`}>
                          {t.status}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="card w-full max-w-lg shadow-2xl pointer-events-auto" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </motion.div>
    </>
  )
}

function FormField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="input-label" style={{ color: '#9ca3af' }}>{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">{icon}</div>
        {children}
      </div>
    </div>
  )
}
