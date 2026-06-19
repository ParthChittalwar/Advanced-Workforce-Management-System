import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, Play, Clock, CheckSquare,
  AlertCircle, Search, Filter, Calendar, ChevronDown,
} from 'lucide-react'
import { useStore, selectEmployee } from '../../store/useStore'
import { getEmployees, updateTaskStatus } from '../../utils/storage'
import type { Employee, Task, TaskStatus } from '../../types'

type Tab = TaskStatus | 'all'

const TABS: { key: Tab; label: string; color: string }[] = [
  { key: 'all',       label: 'All Tasks',  color: 'text-zinc-500' },
  { key: 'new',       label: 'New',        color: 'text-sky-500' },
  { key: 'active',    label: 'Active',     color: 'text-brand-500' },
  { key: 'completed', label: 'Completed',  color: 'text-emerald-500' },
  { key: 'failed',    label: 'Failed',     color: 'text-rose-500' },
]

function PriorityDot({ priority }: { priority: string }) {
  const c = priority === 'high' ? 'bg-rose-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-zinc-400'
  return <span className={`inline-block w-2 h-2 rounded-full ${c} flex-shrink-0`} />
}

function TaskCard({
  task,
  onStatusChange,
}: {
  task: Task
  onStatusChange: (id: string, s: 'active' | 'completed' | 'failed') => void
}) {
  const [expanded, setExpanded] = useState(false)

  const isOverdue = task.dueDate < new Date().toISOString().split('T')[0]
    && task.status !== 'completed' && task.status !== 'failed'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className={`card p-4 cursor-pointer group transition-shadow duration-200
        ${task.status === 'completed' ? 'opacity-70' : ''}
        ${isOverdue ? 'border-rose-300 dark:border-rose-700/40' : ''}
      `}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Priority dot */}
        <div className="mt-1 flex-shrink-0"><PriorityDot priority={task.priority} /></div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className={`text-sm font-semibold leading-snug flex-1
              ${task.status === 'completed'
                ? 'line-through text-zinc-400 dark:text-zinc-600'
                : 'text-zinc-900 dark:text-zinc-100'
              }`}>
              {task.title}
            </p>
            {/* Status badge */}
            <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full
              ${task.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' :
                task.status === 'active'    ? 'bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400' :
                task.status === 'new'       ? 'bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400' :
                                              'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
              }`}>
              {task.status}
            </span>
          </div>

          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <span className="badge-zinc text-[10px]">{task.category}</span>
            <span className={`text-[10px] font-medium
              ${task.priority === 'high' ? 'text-rose-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-zinc-500'}`}>
              {task.priority}
            </span>
            <div className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-rose-500 font-medium' : 'text-zinc-400'}`}>
              <Calendar size={9} />
              {isOverdue ? 'Overdue · ' : ''}{task.dueDate}
            </div>
          </div>

          {/* Expandable description */}
          <AnimatePresence>
            {expanded && task.description && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-zinc-500 mt-2 leading-relaxed overflow-hidden"
              >
                {task.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action buttons */}
      {task.status !== 'completed' && task.status !== 'failed' && (
        <div
          className="flex gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800"
          onClick={e => e.stopPropagation()}
        >
          {task.status === 'new' && (
            <button
              onClick={() => onStatusChange(task.id, 'active')}
              className="btn-sm btn-primary flex-1"
            >
              <Play size={11} /> Accept Task
            </button>
          )}
          {task.status === 'active' && (
            <>
              <button
                onClick={() => onStatusChange(task.id, 'completed')}
                className="btn-sm btn-success flex-1"
              >
                <CheckCircle size={11} /> Mark Complete
              </button>
              <button
                onClick={() => onStatusChange(task.id, 'failed')}
                className="btn-sm btn-danger flex-1"
              >
                <XCircle size={11} /> Mark Failed
              </button>
            </>
          )}
        </div>
      )}

      {/* Done / Failed indicator */}
      {(task.status === 'completed' || task.status === 'failed') && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {task.status === 'completed'
            ? <><CheckCircle size={12} className="text-emerald-500" /><span className="text-[11px] text-emerald-500 font-medium">Task completed</span></>
            : <><XCircle size={12} className="text-rose-500" /><span className="text-[11px] text-rose-500 font-medium">Marked as failed</span></>
          }
        </div>
      )}
    </motion.div>
  )
}

// ── Kanban column ──────────────────────────────────────────────────────────────
function KanbanColumn({
  title, tasks, icon, accent, onStatusChange,
}: {
  title: string
  tasks: Task[]
  icon: React.ReactNode
  accent: string
  onStatusChange: (id: string, s: 'active' | 'completed' | 'failed') => void
}) {
  return (
    <div className="flex-1 min-w-[240px] flex flex-col gap-3">
      <div className={`flex items-center gap-2 px-1`}>
        <div className={`w-1.5 h-1.5 rounded-full ${accent}`} />
        {icon}
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{title}</span>
        <span className="ml-auto text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tasks.map(t => (
            <TaskCard key={t.id} task={t} onStatusChange={onStatusChange} />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="h-24 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800
                          flex items-center justify-center">
            <p className="text-xs text-zinc-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EmployeeMyTasks() {
  const storeEmployee = useStore(selectEmployee)
  const updateCurrent = useStore(s => s.updateCurrentEmployee)
  const [employee,  setEmployee]  = useState<Employee | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [query,     setQuery]     = useState('')
  const [priority,  setPriority]  = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [viewMode,  setViewMode]  = useState<'list' | 'kanban'>('list')

  function reload() {
    if (!storeEmployee) return
    const fresh = getEmployees().find(e => e.id === storeEmployee.id)
    if (fresh) setEmployee(fresh)
  }

  useEffect(() => { reload() }, [storeEmployee?.id])

  function handleStatusChange(taskId: string, newStatus: 'active' | 'completed' | 'failed') {
    if (!employee) return
    const updated = updateTaskStatus(employee.id, taskId, newStatus)
    if (updated) {
      setEmployee(updated)
      updateCurrent(updated)
    }
  }

  const filtered = useMemo(() => {
    if (!employee) return []
    let tasks = [...employee.tasks]
    if (activeTab !== 'all') tasks = tasks.filter(t => t.status === activeTab)
    if (priority  !== 'all') tasks = tasks.filter(t => t.priority === priority)
    if (query.trim()) {
      const q = query.toLowerCase()
      tasks = tasks.filter(t => (t.title + t.description + t.category).toLowerCase().includes(q))
    }
    return tasks
  }, [employee, activeTab, priority, query])

  if (!employee) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  const counts: Record<Tab, number> = {
    all:       employee.tasks.length,
    new:       employee.taskCounts.newTask,
    active:    employee.taskCounts.active,
    completed: employee.taskCounts.completed,
    failed:    employee.taskCounts.failed,
  }

  // For kanban view
  const kanbanCols = [
    { key: 'new'       as TaskStatus, title: 'New',       icon: <Clock size={12} className="text-sky-500" />,     accent: 'bg-sky-500' },
    { key: 'active'    as TaskStatus, title: 'Active',    icon: <Play size={12} className="text-brand-500" />,    accent: 'bg-brand-500' },
    { key: 'completed' as TaskStatus, title: 'Completed', icon: <CheckSquare size={12} className="text-emerald-500" />, accent: 'bg-emerald-500' },
    { key: 'failed'    as TaskStatus, title: 'Failed',    icon: <AlertCircle size={12} className="text-rose-500" />,   accent: 'bg-rose-500' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">
            {employee.taskCounts.active} active · {employee.taskCounts.completed} completed · {employee.taskCounts.newTask} new
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${viewMode === 'kanban' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            Board
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input type="text" placeholder="Search tasks…" value={query}
              onChange={e => setQuery(e.target.value)} className="input pl-9" />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select value={priority} onChange={e => setPriority(e.target.value as typeof priority)}
              className="input pl-9 pr-8 appearance-none cursor-pointer min-w-[140px]">
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Status tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 overflow-x-auto no-scrollbar">
            {TABS.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                  ${activeTab === key
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : `${color} opacity-70 hover:opacity-100`
                  }`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${activeTab === key ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          {/* Task list */}
          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                <CheckSquare size={20} className="text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No tasks here</p>
              <p className="text-xs text-zinc-500 mt-1">
                {activeTab === 'all' ? 'No tasks have been assigned to you yet.' : `No ${activeTab} tasks.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map(task => (
                  <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      ) : (
        /* Kanban board */
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {kanbanCols.map(col => (
            <KanbanColumn
              key={col.key}
              title={col.title}
              icon={col.icon}
              accent={col.accent}
              tasks={employee.tasks.filter(t => t.status === col.key)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
