import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, User, LogOut,
  Sun, Moon, Menu, X, Bell, ChevronRight, Briefcase,
} from 'lucide-react'
import { useStore, selectEmployee } from '../store/useStore'

const NAV = [
  { to: '/employee',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/employee/tasks',    label: 'My Tasks',  icon: CheckSquare },
  { to: '/employee/profile',  label: 'Profile',   icon: User },
]

export default function EmployeeLayout() {
  const { logout, toggleTheme, theme } = useStore()
  const employee = useStore(selectEmployee)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = employee
    ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
    : 'EE'

  const deptColors: Record<string, string> = {
    Engineering: 'from-blue-400 to-cyan-500',
    Design:      'from-pink-400 to-rose-500',
    Marketing:   'from-orange-400 to-amber-500',
    HR:          'from-green-400 to-emerald-500',
    Finance:     'from-yellow-400 to-lime-500',
    DevOps:      'from-violet-400 to-purple-500',
    QA:          'from-teal-400 to-green-500',
    Management:  'from-brand-400 to-indigo-600',
    Sales:       'from-red-400 to-pink-500',
  }
  const gradient = deptColors[employee?.department ?? ''] ?? 'from-brand-400 to-purple-500'

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-60 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <Briefcase size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Parth Studio</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium tracking-wide uppercase">Employee Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-1">Navigation</p>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-30" />
          </NavLink>
        ))}

        <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button onClick={toggleTheme} className="sidebar-link w-full">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="flex-1">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'}
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{employee?.department}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0"><Sidebar /></div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -250 }} animate={{ x: 0 }} exit={{ x: -250 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-md text-zinc-400"
                >
                  <X size={18} />
                </button>
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 lg:px-6
                           bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">Employee</span>
              <ChevronRight size={12} className="text-zinc-400 dark:text-zinc-600" />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {employee ? `${employee.firstName} ${employee.lastName}` : 'Portal'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}>
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
