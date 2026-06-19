import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckSquare, User, Tag, Flag, Calendar, FileText,
  ArrowLeft, Send, CheckCircle, AlertCircle,
} from 'lucide-react'
import { getEmployees, createTask, generateId } from '../../utils/storage'
import type { Employee, TaskPriority } from '../../types'

const CATEGORIES = [
  'Development','Design','QA','Documentation','DevOps',
  'Marketing','HR','Finance','Meeting','Strategy','Support','Other',
]

export default function AdminCreateTask() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState({
    assignedTo: '',
    title: '',
    description: '',
    category: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
  })
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { setEmployees(getEmployees()) }, [])

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.assignedTo) { setError('Please select an employee.'); return }
    if (!form.title.trim()) { setError('Please enter a task title.'); return }
    if (!form.dueDate) { setError('Please set a due date.'); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 600))

    const emp = employees.find(e => e.id === form.assignedTo)
    if (!emp) { setError('Employee not found.'); setLoading(false); return }

    createTask({
      id:             generateId('task'),
      title:          form.title.trim(),
      description:    form.description.trim(),
      category:       form.category || 'General',
      priority:       form.priority,
      status:         'new',
      assignedTo:     form.assignedTo,
      assignedToName: `${emp.firstName} ${emp.lastName}`,
      dueDate:        form.dueDate,
      createdAt:      new Date().toISOString().split('T')[0],
    })

    setSuccess(true)
    setLoading(false)

    setTimeout(() => navigate('/admin/tasks'), 2000)
  }

  const selectedEmp = employees.find(e => e.id === form.assignedTo)

  const PRIORITY_OPTS: { val: TaskPriority; label: string; color: string; dot: string }[] = [
    { val: 'low',    label: 'Low',    color: 'border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50',  dot: 'bg-zinc-400' },
    { val: 'medium', label: 'Medium', color: 'border-amber-300 dark:border-amber-600/50 bg-amber-50 dark:bg-amber-950/30',  dot: 'bg-amber-400' },
    { val: 'high',   label: 'High',   color: 'border-rose-300 dark:border-rose-600/50 bg-rose-50 dark:bg-rose-950/30', dot: 'bg-rose-400' },
  ]

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Task Created!</h2>
          <p className="text-sm text-zinc-500 mb-1">
            "<strong className="text-zinc-700 dark:text-zinc-300">{form.title}</strong>" has been assigned to{' '}
            <strong className="text-zinc-700 dark:text-zinc-300">{selectedEmp?.firstName} {selectedEmp?.lastName}</strong>.
          </p>
          <p className="text-xs text-zinc-400">Redirecting to tasks…</p>
          <div className="flex justify-center gap-1 mt-4">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h1 className="page-title">Create Task</h1>
          <p className="page-subtitle">Assign a new task to a team member</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/30"
          >
            <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
          </motion.div>
        )}

        {/* Assign to employee */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
            <User size={14} className="text-brand-500" /> Assign To
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto custom-scroll">
            {employees.map(emp => (
              <button
                key={emp.id}
                type="button"
                onClick={() => update('assignedTo', emp.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-150
                  ${form.assignedTo === emp.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/30'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500
                                 flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${form.assignedTo === emp.id ? 'text-brand-700 dark:text-brand-300' : 'text-zinc-800 dark:text-zinc-200'}`}>
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">{emp.position}</p>
                </div>
                {form.assignedTo === emp.id && (
                  <CheckCircle size={13} className="text-brand-500 flex-shrink-0 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Task details */}
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <CheckSquare size={14} className="text-brand-500" /> Task Details
          </h3>

          {/* Title */}
          <div>
            <label className="input-label" style={{ color: '#9ca3af' }}>Task Title *</label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Redesign the login page"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                className="input pl-9"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="input-label" style={{ color: '#9ca3af' }}>Description</label>
            <textarea
              placeholder="Describe what needs to be done, acceptance criteria, links…"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Category + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label" style={{ color: '#9ca3af' }}>Category</label>
              <div className="relative">
                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <select
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  className="input pl-9 appearance-none cursor-pointer"
                >
                  <option value="">Select…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="input-label" style={{ color: '#9ca3af' }}>Due Date *</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => update('dueDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input pl-9"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <Flag size={14} className="text-brand-500" /> Priority Level
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {PRIORITY_OPTS.map(({ val, label, color, dot }) => (
              <button
                key={val}
                type="button"
                onClick={() => update('priority', val)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-150
                  ${form.priority === val
                    ? color + ' ring-2 ring-offset-1 dark:ring-offset-zinc-900 ' +
                      (val === 'high' ? 'ring-rose-400' : val === 'medium' ? 'ring-amber-400' : 'ring-zinc-400')
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0`} />
                <span className={`text-sm font-semibold ${
                  form.priority === val
                    ? val === 'high' ? 'text-rose-700 dark:text-rose-300'
                    : val === 'medium' ? 'text-amber-700 dark:text-amber-300'
                    : 'text-zinc-600 dark:text-zinc-300'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview card */}
        {(form.title || selectedEmp) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="card p-5 border-brand-200 dark:border-brand-800/40 bg-brand-50/30 dark:bg-brand-950/10"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-500 mb-3">Preview</p>
            <div className="flex items-start gap-3">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0
                ${form.priority === 'high' ? 'bg-rose-500' : form.priority === 'medium' ? 'bg-amber-500' : 'bg-zinc-400'}`} />
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{form.title || 'Task Title'}</p>
                {form.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{form.description}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {selectedEmp && (
                    <span className="badge-indigo text-[11px]">→ {selectedEmp.firstName} {selectedEmp.lastName}</span>
                  )}
                  {form.category && <span className="badge-zinc text-[11px]">{form.category}</span>}
                  {form.dueDate  && <span className="badge-amber text-[11px]">Due {form.dueDate}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-md btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-md btn-primary flex-1 shadow-glow-sm"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
            ) : (
              <><Send size={14} /> Assign Task</>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  )
}
