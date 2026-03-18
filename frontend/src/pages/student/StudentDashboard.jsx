import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
import Card, { CardBody } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { FileText, BedDouble, CreditCard, Plus } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [gpRes, feeRes] = await Promise.all([
          API.get("/student/gatepasses?limit=5"),
          API.get("/student/fees"),
        ]);
        setRecent(gpRes.data.data.gatepasses);
        const fees = feeRes.data.data;
        setStats({
          totalGatepasses: gpRes.data.data.total,
          pendingFees: fees.totalPending,
          feeCount: fees.fees.filter((f) => f.status !== "paid").length,
        });
      } catch { /* silently fail */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(" ")[0]}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your hostel account.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Gatepasses" value={stats?.totalGatepasses || 0} icon={FileText} color="primary" />
        <StatCard title="Pending Fees" value={stats?.feeCount || 0} icon={CreditCard} color="amber" />
        <StatCard
          title="Amount Due"
          value={`₹${(stats?.pendingFees || 0).toLocaleString()}`}
          icon={CreditCard}
          color="red"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/student/gatepasses">
          <Button variant="primary" size="md">
            <Plus size={16} /> Apply Gatepass
          </Button>
        </Link>
        <Link to="/student/accommodation">
          <Button variant="outline" size="md">
            <BedDouble size={16} /> Book Accommodation
          </Button>
        </Link>
        <Link to="/student/fees">
          <Button variant="outline" size="md">
            <CreditCard size={16} /> View Fees
          </Button>
        </Link>
      </div>

      {/* Recent gatepasses */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Gatepasses</h3>
          <Link to="/student/gatepasses" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            View all
          </Link>
        </div>
        <CardBody className="p-0">
          {recent.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400">No gatepasses yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {recent.map((gp) => (
                <div key={gp._id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{gp.reason}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(gp.fromDate).toLocaleDateString()} — {new Date(gp.toDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={gp.status}>{gp.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
