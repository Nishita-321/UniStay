import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card, { CardHeader } from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";

export default function HostelFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = "/warden/fees?";
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      const res = await API.get(url);
      setFees(res.data.data.fees);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [statusFilter, typeFilter]);

  const columns = [
    { key: "student", label: "Student", render: (r) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{r.student?.name}</p>
        <p className="text-xs text-gray-500">{r.student?.rollNumber}</p>
      </div>
    )},
    { key: "type", label: "Type", render: (r) => <span className="capitalize">{r.type}</span> },
    { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString()}` },
    { key: "dueDate", label: "Due Date", render: (r) => new Date(r.dueDate).toLocaleDateString() },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40"
          options={[{ value: "", label: "All Status" }, { value: "pending", label: "Pending" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" }]} />
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40"
          options={[{ value: "", label: "All Types" }, { value: "hostel", label: "Hostel" }, { value: "mess", label: "Mess" }, { value: "fine", label: "Fine" }]} />
      </div>

      <Card>
        {loading ? <Loader /> : (
          <Table columns={columns} data={fees} emptyMessage="No fees found." />
        )}
      </Card>
    </div>
  );
}
