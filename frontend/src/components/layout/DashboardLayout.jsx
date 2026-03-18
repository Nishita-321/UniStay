import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const titles = {
  "/student": "Dashboard",
  "/student/gatepasses": "My Gatepasses",
  "/student/accommodation": "Accommodation",
  "/student/fees": "My Fees",
  "/student/profile": "Profile",
  "/warden": "Dashboard",
  "/warden/students": "Hostel Students",
  "/warden/gatepasses": "Manage Gatepasses",
  "/warden/accommodation": "Accommodation Requests",
  "/warden/fees": "Hostel Fees",
  "/security": "Dashboard",
  "/security/verify": "Verify Gatepass",
  "/security/audit": "Audit Log",
  "/admin": "Dashboard",
  "/admin/users": "Manage Users",
  "/admin/hostels": "Manage Hostels",
  "/admin/students": "Manage Students",
  "/admin/gatepasses": "All Gatepasses",
  "/admin/fees": "Fees & Fines",
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = titles[location.pathname] || "UniStay";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
