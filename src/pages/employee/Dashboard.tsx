import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckSquare, Clock, AlertCircle, Star, ArrowRight,
  Play, CheckCircle, XCircle, TrendingUp, Calendar, Zap,
} from 'lucide-react'
import { useStore, selectEmployee } from '../../store/useStore'
import { getEmployees, updateTaskStatus } from '../../utils/storage'
import type { Employee, Task } from '../../types'

function getPriorityDot(p: string) {
  if (p === 'high')   return 'bg-rose-500'
  if (p === 'medium') return 'bg-amber-500'
  return 'bg-zinc-400'
}

function getStatusColor(s: string) {
  if (s === 'completed') return 'badge-emerald'
  if (s === 'active')    return 'badge-indigo'
  if (s === 'new')       return 'badge-sky'
  return 'badge-rose'
}

export default function EmployeeDashboard() {
  const storeEmployee = useStore(selectEmployee)
  const updateCurrent = useStore(s => s.updateCurrentEmployee)
  const [employee, setEmployee] = useState<Employee | null>(null)

  function reload() {
    if (!storeEmployee) return
    const fresh = getEmployees().find(e => e.id === storeEmployee.id)
    if (fresh) setEmployee(fresh)
  }

  useEffect(() => { reload() }, [storeEmployee?.id])

  function handleStatusChange(task: Task, newStatus: 'active' | 'completed' | 'failed') {
    if (!employee) return
    const updated = updateTaskStatus(employee.id, task.id, newStatus)
    if (updated) {
      setEmployee(updated)
      updateCurrent(updated)
    }
  }

  if (!employee) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  const newTasks       = employee.tasks.filter(t => t.status === 'new')
  const activeTasks    = employee.tasks.filter(t => t.status === 'active')
  const completedTasks = employee.tasks.filter(t => t.status === 'completed')
  const failedTasks    = employee.tasks.filter(t => t.status === 'failed')

  const completionRate = employee.tasks.length > 0
    ? Math.round((completedTasks.length / employee.tasks.length) * 100)
    : 0

  const STAT_CARDS = [
    { label: 'New Tasks',    value: employee.taskCounts.newTask,   icon: Clock,       color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20' },
    { label: 'In Progress',  value: employee.taskCounts.active,    icon: Zap,         color: 'text-brand-400',   bg: 'bg-brand-500/10',   border: 'border-brand-500/20' },
    { label: 'Completed',    value: employee.taskCounts.completed,  icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Failed',       value: employee.taskCounts.failed,    icon: AlertCircle, color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  ]

  const greetHour = new Date().getHours()
  const greeting  = greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Welcome banner ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card p-5 sm:p-6 border-brand-200/50 dark:border-brand-800/30
                   bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/20 dark:to-purple-950/20"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
              {greeting} 👋
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {employee.position} · {employee.department}
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Calendar size={12} className="text-brand-400" />
                Joined {employee.joinDate}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Star size={12} className="text-amber-400" />
                {employee.performance}% performance
              </div>
              <span className={`text-[11px] ${employee.status === 'active' ? 'badge-emerald' : 'badge-amber'}`}>
                {employee.status}
              </span>
            </div>
          </div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-600
                          flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-glow-sm">
            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-brand-200/50 dark:border-brand-800/30">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-500">Task completion rate</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{completionRate}%</span>
          </div>
          <div className="h-1.5 bg-brand-100 dark:bg-brand-900/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
            className={`stat-card border ${border}`}
          >
            <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── New tasks (action required) ───────────────────────────────────── */}
      {newTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                New Tasks — Action Required
              </h3>
              <span className="badge-sky text-[11px]">{newTasks.length}</span>
            </div>
            <Link to="/employee/tasks" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {newTasks.map(task => (
              <div key={task.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-sky-200/60 dark:border-sky-800/30
                           bg-sky-50/50 dark:bg-sky-950/10 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getPriorityDot(task.priority)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="badge-zinc text-[10px]">{task.category}</span>
                    <span className="text-[10px] text-zinc-400">Due {task.dueDate}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStatusChange(task, 'active')}
                  className="btn-sm btn-primary flex-shrink-0"
                >
                  <Play size={11} /> Accept
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Active tasks ──────────────────────────────────────────────────── */}
      {activeTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Active Tasks</h3>
              <span className="badge-indigo text-[11px]">{activeTasks.length}</span>
            </div>
            <Link to="/employee/tasks" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {activeTasks.slice(0, 4).map(task => (
              <div key={task.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50
                           hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors bg-white dark:bg-zinc-800/30">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getPriorityDot(task.priority)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="badge-zinc text-[10px]">{task.category}</span>
                    <span className={`text-[10px] font-medium ${task.priority === 'high' ? 'text-rose-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-zinc-500'}`}>
                      {task.priority} priority
                    </span>
                    <span className="text-[10px] text-zinc-400">Due {task.dueDate}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleStatusChange(task, 'completed')}
                    title="Mark Complete"
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors border border-emerald-200 dark:border-emerald-800/40"
                  >
                    <CheckCircle size={14} />
                  </button>
                  <button
                    onClick={() => handleStatusChange(task, 'failed')}
                    title="Mark Failed"
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border border-rose-200 dark:border-rose-800/40"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Recent completed ──────────────────────────────────────────────── */}
      {completedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <CheckSquare size={14} className="text-emerald-500" />
              Recently Completed
              <span className="badge-emerald text-[11px]">{completedTasks.length}</span>
            </h3>
          </div>
          <div className="space-y-2">
            {completedTasks.slice(0, 3).map(task => (
              <div key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10
                           border border-emerald-200/50 dark:border-emerald-800/20">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                <p className="flex-1 text-xs text-zinc-700 dark:text-zinc-300 line-through decoration-zinc-400 truncate">
                  {task.title}
                </p>
                <span className="badge-emerald text-[10px]">done</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Skills & performance ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Skills */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <Zap size={14} className="text-brand-500" /> Skills
          </h3>
          {employee.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {employee.skills.map(s => (
                <span key={s} className="badge-indigo">{s}</span>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-zinc-500">No skills listed yet.</p>
              <Link to="/employee/profile" className="text-xs text-brand-400 hover:text-brand-300 mt-1 block">
                Add skills in your profile →
              </Link>
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" /> Performance
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'Overall', val: employee.performance },
              { label: 'Task Completion', val: completionRate },
              { label: 'On-Time Delivery', val: Math.min(100, completionRate + 8) },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">{label}</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{val}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className={`h-full rounded-full ${val >= 80 ? 'bg-emerald-500' : val >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {employee.tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <CheckSquare size={22} className="text-zinc-400" />
          </div>
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">No tasks yet</h3>
          <p className="text-xs text-zinc-500">Your admin will assign tasks to you soon. Check back later!</p>
        </motion.div>
      )}
    </div>
  )
}
