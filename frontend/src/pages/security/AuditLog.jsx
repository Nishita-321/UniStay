import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card, { CardHeader } from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import { LogIn, LogOut } from "lucide-react";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/security/audit-log?page=${p}&limit=25`);
      setLogs(res.data.data.logs);
      setPage(p);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    { key: "direction", label: "", render: (r) =>
      r.inTime ? <LogIn size={16} className="text-emerald-500" /> : <LogOut size={16} className="text-amber-500" />
    },
    { key: "student", label: "Student", render: (r) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{r.student?.name}</p>
        <p className="text-xs text-gray-500">{r.student?.rollNumber}</p>
      </div>
    )},
    { key: "hostel", label: "Hostel", render: (r) => r.hostel?.name || "—" },
    { key: "outTime", label: "Out Time", render: (r) => r.outTime ? new Date(r.outTime).toLocaleString() : "—" },
    { key: "inTime", label: "In Time", render: (r) => r.inTime ? new Date(r.inTime).toLocaleString() : "—" },
    { key: "outBy", label: "Out By", render: (r) => r.outMarkedBy?.name || "—" },
    { key: "inBy", label: "In By", render: (r) => r.inMarkedBy?.name || "—" },
    { key: "late", label: "Late", render: (r) => {
      if (!r.inTime) return "—";
      return new Date(r.inTime) > new Date(r.toDate)
        ? <span className="text-red-500 font-medium">Yes</span>
        : <span className="text-emerald-500">No</span>;
    }},
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900 dark:text-white">Gate Activity Audit Log</h3>
      </CardHeader>
      {loading ? <Loader /> : (
        <>
          <Table columns={columns} data={logs} emptyMessage="No gate activity recorded." />
          <Pagination page={page} pages={10} onPageChange={fetchData} />
        </>
      )}
    </Card>
  );
}
