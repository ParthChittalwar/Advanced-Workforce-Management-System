import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useStore } from './store/useStore'

// Layouts
import AdminLayout    from './layouts/AdminLayout'
import EmployeeLayout from './layouts/EmployeeLayout'

// Public pages
import Landing  from './pages/Landing'
import Login    from './pages/Login'
import Register from './pages/Register'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminEmployees from './pages/admin/Employees'
import AdminTasks     from './pages/admin/Tasks'
import AdminCreateTask from './pages/admin/CreateTask'

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeMyTasks   from './pages/employee/MyTasks'
import EmployeeProfile   from './pages/employee/Profile'

// Route guards
import ProtectedRoute from './routes/ProtectedRoute'

export default function App() {
  const bootstrap = useStore(s => s.bootstrap)

  useEffect(() => { bootstrap() }, [bootstrap])

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index              element={<AdminDashboard />} />
          <Route path="employees"   element={<AdminEmployees />} />
          <Route path="tasks"       element={<AdminTasks />} />
          <Route path="create-task" element={<AdminCreateTask />} />
        </Route>

        {/* Employee */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index          element={<EmployeeDashboard />} />
          <Route path="tasks"   element={<EmployeeMyTasks />} />
          <Route path="profile" element={<EmployeeProfile />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
