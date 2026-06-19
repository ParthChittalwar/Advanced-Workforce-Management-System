import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, CheckSquare, PlusCircle,
  LogOut, Sun, Moon, Menu, X, Bell, Settings, ChevronRight,
  Briefcase,
} from 'lucide-react'
import { useStore } from '../store/useStore'

const NAV = [
  { to: '/admin',             label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/employees',   label: 'Employees',   icon: Users },
  { to: '/admin/tasks',       label: 'All Tasks',   icon: CheckSquare },
  { to: '/admin/create-task', label: 'Create Task', icon: PlusCircle },
]

export default function AdminLayout() {
  const { user, logout, toggleTheme, theme } = useStore()
  const navigate  = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const admin = user as { name: string; email: string; company: string } | null

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`
        flex flex-col h-full
        ${mobile
          ? 'w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800'
          : 'w-60 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800'
        }
      `}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <Briefcase size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Parth Studio</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium tracking-wide uppercase">EMS Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scroll">
        <p className="px-3 py-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-1">Main Menu</p>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-30" />
          </NavLink>
        ))}

        <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800">
          <p className="px-3 py-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-1">System</p>
          <button
            onClick={toggleTheme}
            className="sidebar-link w-full"
          >
            {theme === 'dark'
              ? <Sun size={16} className="flex-shrink-0" />
              : <Moon size={16} className="flex-shrink-0" />
            }
            <span className="flex-1">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="sidebar-link w-full">
            <Settings size={16} className="flex-shrink-0" />
            <span className="flex-1">Settings</span>
          </button>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {admin?.name?.charAt(0) ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{admin?.name ?? 'Admin'}</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{admin?.email}</p>
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
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X size={18} />
                </button>
                <Sidebar mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 lg:px-6
                           bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">Admin</span>
              <ChevronRight size={12} className="text-zinc-400 dark:text-zinc-600" />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {admin?.name?.charAt(0) ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
