import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, PlusCircle, Trash2, Filter, ChevronDown, CheckSquare, Clock, AlertCircle, X } from 'lucide-react'
import { getEmployees, deleteTask } from '../../utils/storage'
import type { Employee, Task, TaskStatus, TaskPriority } from '../../types'

interface TaskWithEmp extends Task { empName: string; empId: string }

function getPriorityBadge(p: TaskPriority) {
  if (p === 'high')   return 'badge-rose'
  if (p === 'medium') return 'badge-amber'
  return 'badge-zinc'
}
function getStatusBadge(s: TaskStatus) {
  if (s === 'completed') return 'badge-emerald'
  if (s === 'active')    return 'badge-indigo'
  if (s === 'new')       return 'badge-sky'
  return 'badge-rose'
}

const STATUS_TABS: { key: TaskStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  { key: 'all',       label: 'All',       icon: <CheckSquare size={13}/> },
  { key: 'new',       label: 'New',       icon: <Clock size={13}/> },
  { key: 'active',    label: 'Active',    icon: <Clock size={13}/> },
  { key: 'completed', label: 'Completed', icon: <CheckSquare size={13}/> },
  { key: 'failed',    label: 'Failed',    icon: <AlertCircle size={13}/> },
]

export default function AdminTasks() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [query,     setQuery]     = useState('')
  const [statusTab, setStatusTab] = useState<TaskStatus | 'all'>('all')
  const [priority,  setPriority]  = useState<TaskPriority | 'all'>('all')
  const [delTarget, setDelTarget] = useState<TaskWithEmp | null>(null)

  function reload() { setEmployees(getEmployees()) }
  useEffect(() => { reload() }, [])

  const allTasks = useMemo<TaskWithEmp[]>(() =>
    employees.flatMap(e =>
      e.tasks.map(t => ({ ...t, empName: `${e.firstName} ${e.lastName}`, empId: e.id }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [employees]
  )

  const filtered = useMemo(() => {
    let list = [...allTasks]
    if (statusTab !== 'all') list = list.filter(t => t.status === statusTab)
    if (priority  !== 'all') list = list.filter(t => t.priority === priority)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(t =>
        (t.title + t.description + t.category + t.empName).toLowerCase().includes(q)
      )
    }
    return list
  }, [allTasks, statusTab, priority, query])

  const counts = useMemo(() => ({
    all:       allTasks.length,
    new:       allTasks.filter(t => t.status === 'new').length,
    active:    allTasks.filter(t => t.status === 'active').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    failed:    allTasks.filter(t => t.status === 'failed').length,
  }), [allTasks])

  function confirmDelete() {
    if (!delTarget) return
    deleteTask(delTarget.empId, delTarget.id)
    reload()
    setDelTarget(null)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="page-subtitle">{allTasks.length} total tasks across {employees.length} employees</p>
        </div>
        <Link to="/admin/create-task" className="btn-md btn-primary shadow-glow-sm">
          <PlusCircle size={15}/> Create Task
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150
              ${statusTab === key
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
          >
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
              ${statusTab === key ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks, employees, category…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select value={priority}
              onChange={e => setPriority(e.target.value as typeof priority)}
              className="input pl-9 pr-8 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <CheckSquare size={20} className="text-zinc-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No tasks found</p>
          <p className="text-xs text-zinc-500 mt-1 mb-4">Try adjusting your filters or create a new task.</p>
          <Link to="/admin/create-task" className="btn-sm btn-primary inline-flex">
            <PlusCircle size={13}/> Create Task
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Task</th>
                <th className="th hidden sm:table-cell">Assigned To</th>
                <th className="th hidden md:table-cell">Category</th>
                <th className="th">Priority</th>
                <th className="th">Status</th>
                <th className="th hidden lg:table-cell">Due Date</th>
                <th className="th w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, i) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="tr-hover group"
                >
                  <td className="td">
                    <div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">{task.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 hidden sm:block line-clamp-1">{task.description}</p>
                    </div>
                  </td>
                  <td className="td hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {task.assignedToName.charAt(0)}
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">{task.assignedToName}</span>
                    </div>
                  </td>
                  <td className="td hidden md:table-cell">
                    <span className="badge-zinc text-[11px]">{task.category}</span>
                  </td>
                  <td className="td">
                    <span className={`${getPriorityBadge(task.priority)} text-[11px]`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="td">
                    <span className={`${getStatusBadge(task.status)} text-[11px]`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="td hidden lg:table-cell">
                    <span className="text-xs text-zinc-500">{task.dueDate}</span>
                  </td>
                  <td className="td">
                    <button
                      onClick={() => setDelTarget(task)}
                      className="p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {delTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setDelTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="card w-full max-w-sm p-6 pointer-events-auto shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center mb-4">
                  <Trash2 size={18} className="text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">Delete Task?</h3>
                <p className="text-sm text-zinc-500 mb-5">
                  "<strong className="text-zinc-700 dark:text-zinc-300">{delTarget.title}</strong>" will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDelTarget(null)} className="btn-md btn-secondary flex-1">Cancel</button>
                  <button onClick={confirmDelete} className="btn-md btn-danger flex-1">Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
