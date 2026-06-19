import type { Admin, AuthUser, Employee, SessionData, Task } from '../types'
import { adminSeed, employeesSeed } from '../data/initialData'

const KEY = {
  ADMIN:     'psem_admin',
  EMPLOYEES: 'psem_employees',
  SESSION:   'psem_session',
  SEEDED:    'psem_seeded',
  THEME:     'psem_theme',
}

// ── Seed ─────────────────────────────────────────────────────────────────────

export function seedStorage(): void {
  if (localStorage.getItem(KEY.SEEDED)) return
  localStorage.setItem(KEY.ADMIN,     JSON.stringify(adminSeed))
  localStorage.setItem(KEY.EMPLOYEES, JSON.stringify(employeesSeed))
  localStorage.setItem(KEY.SEEDED,    '1')
}

// ── Read ──────────────────────────────────────────────────────────────────────

export function getAdmin(): Admin | null {
  try { return JSON.parse(localStorage.getItem(KEY.ADMIN) ?? 'null') }
  catch { return null }
}

export function getEmployees(): Employee[] {
  try { return JSON.parse(localStorage.getItem(KEY.EMPLOYEES) ?? '[]') }
  catch { return [] }
}

export function getSession(): SessionData | null {
  try { return JSON.parse(localStorage.getItem(KEY.SESSION) ?? 'null') }
  catch { return null }
}

export function getTheme(): 'dark' | 'light' {
  return (localStorage.getItem(KEY.THEME) as 'dark' | 'light') ?? 'dark'
}

// ── Write ─────────────────────────────────────────────────────────────────────

function saveEmployees(employees: Employee[]): void {
  localStorage.setItem(KEY.EMPLOYEES, JSON.stringify(employees))
}

export function saveSession(user: AuthUser, role: 'admin' | 'employee'): void {
  localStorage.setItem(KEY.SESSION, JSON.stringify({ user, role }))
}

export function clearSession(): void {
  localStorage.removeItem(KEY.SESSION)
}

export function saveTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(KEY.THEME, theme)
}

// ── Employee ops ──────────────────────────────────────────────────────────────

export function addEmployee(employee: Employee): void {
  const employees = getEmployees()
  employees.push(employee)
  saveEmployees(employees)
}

export function updateEmployee(updated: Employee): void {
  const employees = getEmployees()
  const idx = employees.findIndex(e => e.id === updated.id)
  if (idx !== -1) { employees[idx] = updated; saveEmployees(employees) }
}

export function deleteEmployee(id: string): void {
  saveEmployees(getEmployees().filter(e => e.id !== id))
}

// ── Task ops ──────────────────────────────────────────────────────────────────

export function createTask(task: Task): void {
  const employees = getEmployees()
  const emp = employees.find(e => e.id === task.assignedTo)
  if (!emp) return
  emp.tasks.push(task)
  emp.taskCounts.newTask += 1
  saveEmployees(employees)
}

export function updateTaskStatus(
  employeeId: string,
  taskId: string,
  newStatus: 'active' | 'completed' | 'failed',
): Employee | null {
  const employees = getEmployees()
  const emp = employees.find(e => e.id === employeeId)
  if (!emp) return null

  const task = emp.tasks.find(t => t.id === taskId)
  if (!task) return null

  const prev = task.status
  task.status = newStatus

  // Update counts
  if (prev === 'new')       emp.taskCounts.newTask  = Math.max(0, emp.taskCounts.newTask - 1)
  if (prev === 'active')    emp.taskCounts.active   = Math.max(0, emp.taskCounts.active  - 1)
  if (prev === 'completed') emp.taskCounts.completed = Math.max(0, emp.taskCounts.completed - 1)
  if (prev === 'failed')    emp.taskCounts.failed   = Math.max(0, emp.taskCounts.failed  - 1)

  if (newStatus === 'active')    emp.taskCounts.active    += 1
  if (newStatus === 'completed') emp.taskCounts.completed += 1
  if (newStatus === 'failed')    emp.taskCounts.failed    += 1

  saveEmployees(employees)
  return emp
}

export function deleteTask(employeeId: string, taskId: string): void {
  const employees = getEmployees()
  const emp = employees.find(e => e.id === employeeId)
  if (!emp) return
  const task = emp.tasks.find(t => t.id === taskId)
  if (task) {
    emp.tasks = emp.tasks.filter(t => t.id !== taskId)
    const s = task.status
    if (s === 'new')       emp.taskCounts.newTask   = Math.max(0, emp.taskCounts.newTask - 1)
    if (s === 'active')    emp.taskCounts.active    = Math.max(0, emp.taskCounts.active  - 1)
    if (s === 'completed') emp.taskCounts.completed = Math.max(0, emp.taskCounts.completed - 1)
    if (s === 'failed')    emp.taskCounts.failed    = Math.max(0, emp.taskCounts.failed  - 1)
    saveEmployees(employees)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getAllTasks(): Task[] {
  return getEmployees().flatMap(e => e.tasks)
}
