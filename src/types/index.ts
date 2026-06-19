// ── Domain Types ─────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'employee'

export type TaskStatus = 'new' | 'active' | 'completed' | 'failed'

export type TaskPriority = 'low' | 'medium' | 'high'

export type Department =
  | 'Engineering'
  | 'Design'
  | 'Marketing'
  | 'HR'
  | 'Finance'
  | 'DevOps'
  | 'QA'
  | 'Management'
  | 'Sales'

export type EmployeeStatus = 'active' | 'inactive' | 'on-leave'

// ── Task ──────────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: TaskPriority
  status: TaskStatus
  assignedTo: string       // employee id
  assignedToName: string
  dueDate: string
  createdAt: string
}

// ── Task count summary ────────────────────────────────────────────────────────

export interface TaskCounts {
  newTask: number
  active: number
  completed: number
  failed: number
}

// ── Employee ──────────────────────────────────────────────────────────────────

export interface Employee {
  id: string
  role: 'employee'
  firstName: string
  lastName: string
  email: string
  password: string
  department: Department
  position: string
  phone: string
  joinDate: string
  salary: number
  status: EmployeeStatus
  performance: number    // 0–100
  skills: string[]
  taskCounts: TaskCounts
  tasks: Task[]
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface Admin {
  id: string
  role: 'admin'
  name: string
  email: string
  password: string
  company: string
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export type AuthUser = Admin | Employee

export interface SessionData {
  user: AuthUser
  role: UserRole
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalTasks: number
  activeTasks: number
  completedTasks: number
  newTasks: number
  failedTasks: number
  avgPerformance: number
}
