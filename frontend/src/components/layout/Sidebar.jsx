import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, FileText, BedDouble, CreditCard, User,
  Users, Building2, ShieldCheck, ClipboardList, LogOut, ScrollText, UserPlus
} from "lucide-react";

const navByRole = {
  student: [
    { to: "/student", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/student/gatepasses", icon: FileText, label: "My Gatepasses" },
    { to: "/student/accommodation", icon: BedDouble, label: "Accommodation" },
    { to: "/student/fees", icon: CreditCard, label: "My Fees" },
    { to: "/student/profile", icon: User, label: "Profile" },
  ],
  warden: [
    { to: "/warden", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/warden/students", icon: Users, label: "Students" },
    { to: "/warden/gatepasses", icon: FileText, label: "Gatepasses" },
    { to: "/warden/accommodation", icon: BedDouble, label: "Accommodation" },
    { to: "/warden/fees", icon: CreditCard, label: "Fees" },
  ],
  security: [
    { to: "/security", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/security/verify", icon: ShieldCheck, label: "Verify Gatepass" },
    { to: "/security/audit", icon: ScrollText, label: "Audit Log" },
  ],
  admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/users", icon: UserPlus, label: "Manage Users" },
    { to: "/admin/hostels", icon: Building2, label: "Hostels" },
    { to: "/admin/students", icon: Users, label: "Students" },
    { to: "/admin/gatepasses", icon: ClipboardList, label: "Gatepasses" },
    { to: "/admin/fees", icon: CreditCard, label: "Fees & Fines" },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const links = navByRole[user?.role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200
          dark:border-gray-700 flex flex-col transition-transform duration-200
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              UniStay
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-6 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {user?.role} panel
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium
              text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
