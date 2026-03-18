import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { ShieldCheck, ScrollText, LogIn, LogOut } from "lucide-react";

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [gpRes, logRes] = await Promise.all([
          API.get("/security/gatepasses?status=approved&limit=1"),
          API.get("/security/audit-log?limit=5"),
        ]);
        setStats({ activeGatepasses: gpRes.data.data.total });
        setRecentLogs(logRes.data.data.logs);
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
          Gate security operations center.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Active Gatepasses" value={stats.activeGatepasses || 0} icon={ShieldCheck} color="primary" />
        <StatCard title="Recent Activity" value={recentLogs.length} icon={ScrollText} color="blue" />
      </div>

      <div className="flex gap-3">
        <Link to="/security/verify">
          <Button><ShieldCheck size={16} /> Verify Gatepass</Button>
        </Link>
        <Link to="/security/audit">
          <Button variant="outline"><ScrollText size={16} /> Audit Log</Button>
        </Link>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Gate Activity</h3>
        </div>
        <CardBody className="p-0">
          {recentLogs.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400">No recent activity.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {recentLogs.map((log) => (
                <div key={log._id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {log.inTime ? (
                      <LogIn size={16} className="text-emerald-500" />
                    ) : (
                      <LogOut size={16} className="text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.student?.name} — {log.student?.rollNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.inTime
                          ? `Checked in: ${new Date(log.inTime).toLocaleString()}`
                          : `Checked out: ${new Date(log.outTime).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
