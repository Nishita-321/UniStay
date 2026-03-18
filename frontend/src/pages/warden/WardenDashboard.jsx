import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
import Card, { CardBody } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import { Users, FileText, BedDouble, CreditCard } from "lucide-react";

export default function WardenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentGp, setRecentGp] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [studRes, gpRes, accRes, feeRes] = await Promise.all([
          API.get("/warden/students?limit=1"),
          API.get("/warden/gatepasses?status=pending&limit=5"),
          API.get("/warden/accommodation?status=pending"),
          API.get("/warden/fees?status=pending"),
        ]);
        setStats({
          students: studRes.data.data.total,
          pendingGp: gpRes.data.data.total,
          pendingAcc: accRes.data.data.accommodations.length,
          pendingFees: feeRes.data.data.fees.length,
        });
        setRecentGp(gpRes.data.data.gatepasses);
      } catch { /* */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Welcome, {user?.name?.split(" ")[0]}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your hostel operations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.students || 0} icon={Users} color="primary" />
        <StatCard title="Pending Gatepasses" value={stats.pendingGp || 0} icon={FileText} color="amber" />
        <StatCard title="Pending Accommodation" value={stats.pendingAcc || 0} icon={BedDouble} color="blue" />
        <StatCard title="Unpaid Fees" value={stats.pendingFees || 0} icon={CreditCard} color="red" />
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Pending Gatepass Requests</h3>
        </div>
        <CardBody className="p-0">
          {recentGp.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400">No pending requests.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {recentGp.map((gp) => (
                <div key={gp._id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {gp.student?.name} — {gp.student?.rollNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{gp.reason}</p>
                  </div>
                  <Badge variant="pending">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
