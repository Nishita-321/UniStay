import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
import Loader from "../../components/ui/Loader";
import { Users, Building2, FileText, BedDouble, CreditCard, UserCheck, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/dashboard")
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          System overview and management console.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} color="primary" />
        <StatCard title="Total Wardens" value={stats?.totalWardens || 0} icon={UserCheck} color="blue" />
        <StatCard title="Total Hostels" value={stats?.totalHostels || 0} icon={Building2} color="emerald" />
        <StatCard title="Pending Gatepasses" value={stats?.pendingGatepasses || 0} icon={FileText} color="amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pending Accommodation" value={stats?.pendingAccommodation || 0} icon={BedDouble} color="blue" />
        <StatCard title="Unpaid Fees" value={stats?.pendingFees || 0} icon={CreditCard} color="red" />
        <StatCard
          title="Pending Amount"
          value={`₹${(stats?.totalFeesPendingAmount || 0).toLocaleString()}`}
          icon={DollarSign}
          color="amber"
        />
      </div>
    </div>
  );
}
