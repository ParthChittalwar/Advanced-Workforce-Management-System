import { create } from 'zustand'
import type { Admin, AuthUser, Employee } from '../types'
import {
  clearSession,
  getSession,
  getTheme,
  saveSession,
  saveTheme,
  seedStorage,
} from '../utils/storage'

// ── Apply theme to DOM ────────────────────────────────────────────────────────
function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.classList.toggle('dark',  theme === 'dark')
  document.documentElement.classList.toggle('light', theme === 'light')
}

// ── Store interface ───────────────────────────────────────────────────────────
interface AppStore {
  // Auth
  user: AuthUser | null
  userRole: 'admin' | 'employee' | null
  isAuthenticated: boolean

  // Theme
  theme: 'dark' | 'light'

  // Actions
  login: (user: AuthUser, role: 'admin' | 'employee') => void
  logout: () => void
  toggleTheme: () => void
  setTheme: (t: 'dark' | 'light') => void
  updateCurrentEmployee: (emp: Employee) => void
  refreshUser: () => void
  bootstrap: () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create<AppStore>((set, get) => ({
  user:            null,
  userRole:        null,
  isAuthenticated: false,
  theme:           'dark',

  bootstrap() {
    // 1. Seed localStorage on first visit
    seedStorage()

    // 2. Restore theme
    const theme = getTheme()
    applyTheme(theme)
    set({ theme })

    // 3. Restore session if present
    const session = getSession()
    if (session) {
      set({
        user:            session.user,
        userRole:        session.role,
        isAuthenticated: true,
      })
    }
  },

  login(user, role) {
    saveSession(user, role)
    set({ user, userRole: role, isAuthenticated: true })
  },

  logout() {
    clearSession()
    set({ user: null, userRole: null, isAuthenticated: false })
  },

  toggleTheme() {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    saveTheme(next)
    set({ theme: next })
  },

  setTheme(t) {
    applyTheme(t)
    saveTheme(t)
    set({ theme: t })
  },

  updateCurrentEmployee(emp: Employee) {
    saveSession(emp, 'employee')
    set({ user: emp })
  },

  refreshUser() {
    const session = getSession()
    if (session) set({ user: session.user })
  },
}))

// ── Typed selectors ───────────────────────────────────────────────────────────
export const selectAdmin    = (s: AppStore) => s.user as Admin    | null
export const selectEmployee = (s: AppStore) => s.user as Employee | null
