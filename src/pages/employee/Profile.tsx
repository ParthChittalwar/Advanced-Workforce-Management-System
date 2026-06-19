import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, Briefcase, Building2, Calendar,
  DollarSign, TrendingUp, Edit2, Save, X, Plus, Trash2,
  CheckCircle, Star,
} from 'lucide-react'
import { useStore, selectEmployee } from '../../store/useStore'
import { getEmployees, updateEmployee as saveEmployee } from '../../utils/storage'
import type { Employee } from '../../types'

const DEPT_COLORS: Record<string, string> = {
  Engineering: 'from-blue-400 to-cyan-500',
  Design: 'from-pink-400 to-rose-500',
  Marketing: 'from-orange-400 to-amber-500',
  HR: 'from-green-400 to-emerald-500',
  Finance: 'from-yellow-400 to-lime-500',
  DevOps: 'from-violet-400 to-purple-500',
  QA: 'from-teal-400 to-green-500',
  Management: 'from-brand-400 to-indigo-600',
  Sales: 'from-red-400 to-pink-500',
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function EmployeeProfile() {
  const storeEmployee = useStore(selectEmployee)
  const updateCurrent = useStore(s => s.updateCurrentEmployee)
  const [employee,  setEmployee]  = useState<Employee | null>(null)
  const [editing,   setEditing]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [newSkill,  setNewSkill]  = useState('')

  // Edit form state
  const [form, setForm] = useState({ phone: '', position: '' })

  function reload() {
    if (!storeEmployee) return
    const fresh = getEmployees().find(e => e.id === storeEmployee.id)
    if (fresh) {
      setEmployee(fresh)
      setForm({ phone: fresh.phone, position: fresh.position })
    }
  }
  useEffect(() => { reload() }, [storeEmployee?.id])

  function startEdit() { setEditing(true); setSaved(false) }
  function cancelEdit() { setEditing(false); if (employee) setForm({ phone: employee.phone, position: employee.position }) }

  function saveProfile() {
    if (!employee) return
    const updated: Employee = { ...employee, phone: form.phone, position: form.position }
    saveEmployee(updated)
    updateCurrent(updated)
    setEmployee(updated)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function addSkill() {
    if (!employee || !newSkill.trim()) return
    if (employee.skills.includes(newSkill.trim())) { setNewSkill(''); return }
    const updated: Employee = { ...employee, skills: [...employee.skills, newSkill.trim()] }
    saveEmployee(updated)
    updateCurrent(updated)
    setEmployee(updated)
    setNewSkill('')
  }

  function removeSkill(skill: string) {
    if (!employee) return
    const updated: Employee = { ...employee, skills: employee.skills.filter(s => s !== skill) }
    saveEmployee(updated)
    updateCurrent(updated)
    setEmployee(updated)
  }

  if (!employee) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  const gradient = DEPT_COLORS[employee.department] ?? 'from-brand-400 to-purple-500'
  const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
  const completedTasks = employee.tasks.filter(t => t.status === 'completed').length

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information and skills</p>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/30"
          >
            <CheckCircle size={13} className="text-emerald-500" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Profile saved!</span>
          </motion.div>
        )}
      </div>

      {/* ── Profile hero card ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card p-6 sm:p-7"
      >
        <div className="flex items-start gap-5 flex-col sm:flex-row">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-black shadow-glow-sm`}>
              {initials}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 flex-shrink-0
              ${employee.status === 'active' ? 'bg-emerald-500' : employee.status === 'on-leave' ? 'bg-amber-500' : 'bg-zinc-500'}`} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-sm text-zinc-500 mt-0.5">{employee.position} · {employee.department}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[11px] ${employee.status === 'active' ? 'badge-emerald' : employee.status === 'on-leave' ? 'badge-amber' : 'badge-zinc'}`}>
                    {employee.status}
                  </span>
                  <span className="badge-indigo text-[11px]">{employee.department}</span>
                </div>
              </div>
              <button
                onClick={editing ? cancelEdit : startEdit}
                className={`btn-sm ${editing ? 'btn-ghost border border-zinc-300 dark:border-zinc-600' : 'btn-secondary'}`}
              >
                {editing ? <><X size={12}/> Cancel</> : <><Edit2 size={12}/> Edit</>}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { val: employee.performance + '%', label: 'Performance',   icon: <TrendingUp size={12} className="text-emerald-500" /> },
                { val: employee.tasks.length,      label: 'Total Tasks',   icon: <Briefcase size={12} className="text-brand-500" /> },
                { val: completedTasks,             label: 'Completed',     icon: <Star size={12} className="text-amber-500" /> },
              ].map(({ val, label, icon }) => (
                <div key={label} className="card p-3 text-center">
                  <div className="flex justify-center mb-1">{icon}</div>
                  <p className="text-base font-black text-zinc-900 dark:text-zinc-100">{val}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Editable fields ────────────────────────────────────────────────── */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 border-brand-200 dark:border-brand-700/30 bg-brand-50/30 dark:bg-brand-950/10"
        >
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
            <Edit2 size={14} className="text-brand-500" /> Edit Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="input-label" style={{ color: '#9ca3af' }}>Position / Job Title</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  className="input pl-9"
                  placeholder="e.g. Senior Developer"
                />
              </div>
            </div>
            <div>
              <label className="input-label" style={{ color: '#9ca3af' }}>Phone Number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="input pl-9"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <button onClick={saveProfile} className="btn-md btn-primary w-full">
              <Save size={14} /> Save Changes
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Personal info ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card p-5"
      >
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-2">
          <User size={14} className="text-brand-500" /> Personal Information
        </h3>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <InfoRow icon={<Mail size={14} className="text-brand-500" />}      label="Email"        value={employee.email} />
          <InfoRow icon={<Phone size={14} className="text-zinc-500" />}      label="Phone"        value={employee.phone} />
          <InfoRow icon={<Briefcase size={14} className="text-zinc-500" />}  label="Position"     value={employee.position} />
          <InfoRow icon={<Building2 size={14} className="text-zinc-500" />}  label="Department"   value={employee.department} />
          <InfoRow icon={<Calendar size={14} className="text-zinc-500" />}   label="Join Date"    value={employee.joinDate} />
          <InfoRow icon={<DollarSign size={14} className="text-zinc-500" />} label="Salary"       value={`₹${employee.salary.toLocaleString()} / year`} />
          <InfoRow icon={<TrendingUp size={14} className="text-emerald-500" />} label="Performance" value={`${employee.performance}%`} />
        </div>
      </motion.div>

      {/* ── Skills ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="card p-5"
      >
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
          <Star size={14} className="text-amber-500" /> Skills
        </h3>

        {/* Add skill */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Add a skill (e.g. React, Python)"
            className="input flex-1"
          />
          <button onClick={addSkill} disabled={!newSkill.trim()} className="btn-md btn-primary flex-shrink-0">
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Skill chips */}
        {employee.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {employee.skills.map(skill => (
              <div key={skill}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-700/40
                           text-brand-700 dark:text-brand-300 text-xs font-medium group"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-400 hover:text-rose-500"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">No skills added yet. Type above and press Enter.</p>
          </div>
        )}
      </motion.div>

      {/* ── Task history ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card p-5"
      >
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
          <Briefcase size={14} className="text-brand-500" /> Task History ({employee.tasks.length})
        </h3>
        {employee.tasks.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4 italic">No tasks assigned yet.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
            {[...employee.tasks].reverse().map(task => (
              <div key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                  ${task.status === 'completed' ? 'bg-emerald-500' :
                    task.status === 'active'    ? 'bg-brand-500'   :
                    task.status === 'new'       ? 'bg-sky-500'     : 'bg-rose-500'}`} />
                <p className={`flex-1 text-xs font-medium truncate
                  ${task.status === 'completed' ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-800 dark:text-zinc-200'}`}>
                  {task.title}
                </p>
                <span className={`text-[10px] font-medium flex-shrink-0
                  ${task.status === 'completed' ? 'text-emerald-500' :
                    task.status === 'active'    ? 'text-brand-500'   :
                    task.status === 'new'       ? 'text-sky-500'     : 'text-rose-500'}`}>
                  {task.status}
                </span>
                <span className="text-[10px] text-zinc-400 flex-shrink-0 hidden sm:block">
                  Due {task.dueDate}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
