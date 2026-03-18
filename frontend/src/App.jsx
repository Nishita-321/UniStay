import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyGatepasses from "./pages/student/MyGatepasses";
import MyAccommodation from "./pages/student/MyAccommodation";
import MyFees from "./pages/student/MyFees";
import Profile from "./pages/student/Profile";

// Warden pages
import WardenDashboard from "./pages/warden/WardenDashboard";
import HostelStudents from "./pages/warden/HostelStudents";
import ManageGatepassesW from "./pages/warden/ManageGatepasses";
import ManageAccommodation from "./pages/warden/ManageAccommodation";
import HostelFees from "./pages/warden/HostelFees";

// Security pages
import SecurityDashboard from "./pages/security/SecurityDashboard";
import VerifyGatepass from "./pages/security/VerifyGatepass";
import AuditLog from "./pages/security/AuditLog";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageHostels from "./pages/admin/ManageHostels";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageGatepassesA from "./pages/admin/ManageGatepasses";
import ManageFees from "./pages/admin/ManageFees";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Student Panel */}
            <Route
              path="/student"
              element={
                <ProtectedRoute roles={["student"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="gatepasses" element={<MyGatepasses />} />
              <Route path="accommodation" element={<MyAccommodation />} />
              <Route path="fees" element={<MyFees />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Warden Panel */}
            <Route
              path="/warden"
              element={
                <ProtectedRoute roles={["warden"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<WardenDashboard />} />
              <Route path="students" element={<HostelStudents />} />
              <Route path="gatepasses" element={<ManageGatepassesW />} />
              <Route path="accommodation" element={<ManageAccommodation />} />
              <Route path="fees" element={<HostelFees />} />
            </Route>

            {/* Security Panel */}
            <Route
              path="/security"
              element={
                <ProtectedRoute roles={["security"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SecurityDashboard />} />
              <Route path="verify" element={<VerifyGatepass />} />
              <Route path="audit" element={<AuditLog />} />
            </Route>

            {/* Admin Panel */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="hostels" element={<ManageHostels />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="gatepasses" element={<ManageGatepassesA />} />
              <Route path="fees" element={<ManageFees />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "10px",
                background: "var(--toast-bg, #fff)",
                color: "var(--toast-color, #1f2937)",
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
