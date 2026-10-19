import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

/* ── Student ── */
import StudentAuth          from './pages/student/StudentAuth'
import StudentHome          from './pages/student/StudentHome'
import StudentPerformance   from './pages/student/StudentPerformance'
import StudentAI            from './pages/student/StudentAI'
import StudentEvents        from './pages/student/StudentEvents'
import StudentBooking       from './pages/student/StudentBooking'
import StudentChat          from './pages/student/StudentChat'
import StudentNotifications from './pages/student/StudentNotifications'
import StudentProfile       from './pages/student/StudentProfile'

/* ── Admin ── */
import AdminAuth            from './pages/admin/AdminAuth'
import AdminHome            from './pages/admin/AdminHome'
import AdminStudents        from './pages/admin/AdminStudents'
import AdminEvents          from './pages/admin/AdminEvents'
import AdminReports         from './pages/admin/AdminReports'
import AdminAI              from './pages/admin/AdminAI'
import AdminNotifications   from './pages/admin/AdminNotifications'
import AdminChat            from './pages/admin/AdminChat'
import AdminProfile         from './pages/admin/AdminProfile'
import AdminBooking         from './pages/admin/AdminBooking'

/* ── Turf Owner ── */
import TurfAuth             from './pages/turf/TurfAuth'
import TurfHome             from './pages/turf/TurfHome'
import TurfBookings         from './pages/turf/TurfBookings'
import TurfSlots            from './pages/turf/TurfSlots'
import TurfEarnings         from './pages/turf/TurfEarnings'
import TurfReports          from './pages/turf/TurfReports'
import TurfProfile          from './pages/turf/TurfProfile'
import TurfNotifications    from './pages/turf/TurfNotifications'
import SplashScreen         from './pages/SplashScreen'
import RoleSelection        from './pages/RoleSelection'

/* Detect role from current path */
function RoleThemeWrapper({ children }) {
  const { pathname } = useLocation()
  const role = pathname.startsWith('/admin') ? 'admin'
             : pathname.startsWith('/turf')  ? 'turf'
             : 'student'
  return <ThemeProvider role={role}>{children}</ThemeProvider>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RoleThemeWrapper>
          <Routes>
            <Route path="/"     element={<SplashScreen />} />
            <Route path="/role" element={<RoleSelection />} />

            {/* Student */}
            <Route path="/student/auth"          element={<StudentAuth />} />
            <Route path="/student/home"          element={<StudentHome />} />
            <Route path="/student/performance"   element={<StudentPerformance />} />
            <Route path="/student/ai"            element={<StudentAI />} />
            <Route path="/student/events"        element={<StudentEvents />} />
            <Route path="/student/booking"       element={<StudentBooking />} />
            <Route path="/student/chat"          element={<StudentChat />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
            <Route path="/student/profile"       element={<StudentProfile />} />

            {/* Admin */}
            <Route path="/admin/auth"            element={<AdminAuth />} />
            <Route path="/admin/home"            element={<AdminHome />} />
            <Route path="/admin/students"        element={<AdminStudents />} />
            <Route path="/admin/events"          element={<AdminEvents />} />
            <Route path="/admin/reports"         element={<AdminReports />} />
            <Route path="/admin/booking"         element={<AdminBooking />} />
            <Route path="/admin/ai"              element={<AdminAI />} />
            <Route path="/admin/notifications"   element={<AdminNotifications />} />
            <Route path="/admin/chat"            element={<AdminChat />} />
            <Route path="/admin/profile"         element={<AdminProfile />} />

            {/* Turf Owner */}
            <Route path="/turf/auth"             element={<TurfAuth />} />
            <Route path="/turf/home"             element={<TurfHome />} />
            <Route path="/turf/bookings"         element={<TurfBookings />} />
            <Route path="/turf/slots"            element={<TurfSlots />} />
            <Route path="/turf/earnings"         element={<TurfEarnings />} />
            <Route path="/turf/reports"          element={<TurfReports />} />
            <Route path="/turf/profile"          element={<TurfProfile />} />
            <Route path="/turf/notifications"    element={<TurfNotifications />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </RoleThemeWrapper>
      </BrowserRouter>
    </AuthProvider>
  )
}
