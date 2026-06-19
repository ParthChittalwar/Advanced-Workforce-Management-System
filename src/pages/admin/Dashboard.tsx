import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, CheckSquare, Clock, AlertTriangle, TrendingUp,
  PlusCircle, ArrowRight, Star, Activity, Award,
  Briefcase, Calendar,
} from 'lucide-react'
import { getEmployees } from '../../utils/storage'
import type { Employee, DashboardStats } from '../../types'

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcStats(employees: Employee[]): DashboardStats {
  const active      = employees.filter(e => e.status === 'active').length
  const tasks       = employees.flatMap(e => e.tasks)
  const completed   = tasks.filter(t => t.status === 'completed').length
  const activeTasks = tasks.filter(t => t.status === 'active').length
  const newTasks    = tasks.filter(t => t.status === 'new').length
  const failed      = tasks.filter(t => t.status === 'failed').length
  const avgPerf     = employees.length
    ? Math.round(employees.reduce((s, e) => s + e.performance, 0) / employees.length)
    : 0

  return {
    totalEmployees: employees.length,
    activeEmployees: active,
    totalTasks: tasks.length,
    activeTasks,
    completedTasks: completed,
    newTasks,
    failedTasks: failed,
    avgPerformance: avgPerf,
  }
}

function getPriorityColor(p: string) {
  if (p === 'high')   return 'badge-rose'
  if (p === 'medium') return 'badge-amber'
  return 'badge-zinc'
}

function getStatusColor(s: string) {
  if (s === 'completed') return 'badge-emerald'
  if (s === 'active')    return 'badge-indigo'
  if (s === 'new')       return 'badge-sky'
  return 'badge-rose'
}

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  show:   (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map(({ label, value, color }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(value / max) * 100}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className={`w-full rounded-t-sm ${color} min-h-[4px]`}
          />
          <span className="text-[9px] text-zinc-500">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({ completed, active, newt, failed }: { completed: number; active: number; newt: number; failed: number }) {
  const total = completed + active + newt + failed || 1
  const pct   = (n: number) => Math.round((n / total) * 100)
  const segments = [
    { pct: pct(completed), color: '#10b981', label: 'Completed' },
    { pct: pct(active),    color: '#6366f1', label: 'Active' },
    { pct: pct(newt),      color: '#0ea5e9', label: 'New' },
    { pct: pct(failed),    color: '#f43f5e', label: 'Failed' },
  ]
  // Build conic gradient
  let cursor = 0
  const stops = segments.map(s => {
    const from = cursor; cursor += s.pct
    return `${s.color} ${from}% ${cursor}%`
  }).join(', ')

  return (
    <div className="flex items-center gap-5">
      <div
        className="w-20 h-20 rounded-full flex-shrink-0"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="w-full h-full rounded-full flex items-center justify-center"
          style={{ background: 'radial-gradient(circle at center, var(--tw-bg) 55%, transparent 55%)' }}>
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-100">{total}</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span>{s.label}</span>
            <span className="text-zinc-600 ml-auto pl-4">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Performance bar ───────────────────────────────────────────────────────────
function PerfBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-medium text-zinc-400 w-8 text-right">{value}%</span>
    </div>
  )
}

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats,     setStats]     = useState<DashboardStats | null>(null)

  useEffect(() => {
    const emps = getEmployees()
    setEmployees(emps)
    setStats(calcStats(emps))
  }, [])

  if (!stats) return null

  const recentTasks = employees
    .flatMap(e => e.tasks.map(t => ({ ...t, empName: `${e.firstName} ${e.lastName}` })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const deptMap: Record<string, number> = {}
  employees.forEach(e => { deptMap[e.department] = (deptMap[e.department] ?? 0) + 1 })
  const deptData = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label: label.slice(0, 3), value, color: 'bg-brand-500/60' }))

  const STAT_CARDS = [
    {
      label: 'Total Employees',
      value: stats.totalEmployees,
      sub: `${stats.activeEmployees} active`,
      icon: Users,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
      border: 'border-brand-500/20',
      trend: '+2 this month',
    },
    {
      label: 'Active Tasks',
      value: stats.activeTasks,
      sub: `${stats.newTasks} new`,
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      trend: 'In progress',
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks,
      sub: `of ${stats.totalTasks} total`,
      icon: CheckSquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      trend: `${stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% rate`,
    },
    {
      label: 'Avg Performance',
      value: `${stats.avgPerformance}%`,
      sub: 'across team',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      trend: 'Company average',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Welcome back, Parth — here's what's happening at your company.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/create-task" className="btn-md btn-primary shadow-glow-sm">
            <PlusCircle size={15} />
            Create Task
          </Link>
          <Link to="/admin/employees" className="btn-md btn-secondary">
            <Users size={15} />
            Employees
          </Link>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, sub, icon: Icon, color, bg, border, trend }, i) => (
          <motion.div
            key={label}
            variants={CARD_VARIANTS}
            initial="hidden"
            animate="show"
            custom={i}
            className={`stat-card border ${border}`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{value}</p>
              <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Department breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card p-5 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Dept. Distribution</h3>
            <Building2Icon />
          </div>
          <BarChart data={deptData} />
          <div className="mt-3 space-y-1">
            {Object.entries(deptMap).slice(0, 4).map(([dept, count]) => (
              <div key={dept} className="flex justify-between text-xs">
                <span className="text-zinc-500">{dept}</span>
                <span className="text-zinc-400 font-medium">{count} emp.</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Task overview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="card p-5 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Task Overview</h3>
            <CheckSquare size={14} className="text-zinc-400" />
          </div>
          <DonutChart
            completed={stats.completedTasks}
            active={stats.activeTasks}
            newt={stats.newTasks}
            failed={stats.failedTasks}
          />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: 'Completion Rate', val: `${stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%` },
              { label: 'Failure Rate',    val: `${stats.totalTasks ? Math.round((stats.failedTasks    / stats.totalTasks) * 100) : 0}%` },
            ].map(({ label, val }) => (
              <div key={label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-2.5">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{val}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top performers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="card p-5 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Top Performers</h3>
            <Award size={14} className="text-zinc-400" />
          </div>
          <div className="space-y-3">
            {[...employees]
              .sort((a, b) => b.performance - a.performance)
              .slice(0, 4)
              .map((emp, i) => (
                <div key={emp.id} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                                  bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-purple-500
                                  flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <PerfBar value={emp.performance} />
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* ── Employee list + Recent tasks ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Employee table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="table-wrapper lg:col-span-3"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-700/60">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">All Employees</h3>
            <Link to="/admin/employees" className="text-xs text-brand-500 hover:text-brand-400 font-medium flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Employee</th>
                  <th className="th hidden sm:table-cell">Department</th>
                  <th className="th hidden md:table-cell">Tasks</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 6).map(emp => (
                  <tr key={emp.id} className="tr-hover">
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500
                                        flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-[11px] text-zinc-400">{emp.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td hidden sm:table-cell">
                      <span className="badge-indigo text-[11px]">{emp.department}</span>
                    </td>
                    <td className="td hidden md:table-cell">
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        <span className="text-sky-500 font-medium">{emp.taskCounts.newTask} new</span>
                        <span className="text-brand-500 font-medium">{emp.taskCounts.active} active</span>
                        <span className="text-emerald-500 font-medium">{emp.taskCounts.completed} done</span>
                      </div>
                    </td>
                    <td className="td">
                      <span className={
                        emp.status === 'active'   ? 'badge-emerald' :
                        emp.status === 'on-leave' ? 'badge-amber'   : 'badge-zinc'
                      }>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent tasks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent Tasks</h3>
            <Link to="/admin/tasks" className="text-xs text-brand-500 hover:text-brand-400 font-medium flex items-center gap-1">
              All tasks <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3 custom-scroll overflow-y-auto max-h-72">
            {recentTasks.map(task => (
              <div key={task.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/40">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0
                  ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-zinc-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{task.title}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">→ {task.empName}</p>
                </div>
                <span className={`${getStatusColor(task.status)} flex-shrink-0 text-[10px]`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Quick actions ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55 }}
        className="card p-5"
      >
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/admin/create-task', icon: PlusCircle, label: 'Assign Task',        sub: 'Create & assign',   color: 'text-brand-400',  bg: 'bg-brand-500/10',   border: 'border-brand-500/20' },
            { to: '/admin/employees',   icon: Users,       label: 'Add Employee',       sub: 'Expand the team',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { to: '/admin/tasks',       icon: Clock,       label: 'Pending Tasks',      sub: `${stats.newTasks} waiting`, color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
            { to: '/admin/tasks',       icon: AlertTriangle, label: 'Failed Tasks',     sub: `${stats.failedTasks} failed`, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
          ].map(({ to, icon: Icon, label, sub, color, bg, border }) => (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 p-4 rounded-xl border ${border} ${bg} hover:opacity-90 transition-opacity`}
            >
              <Icon size={18} className={`${color} flex-shrink-0`} />
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{label}</p>
                <p className="text-[10px] text-zinc-500">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function Building2Icon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 13h6M9 17h6" />
    </svg>
  )
}
