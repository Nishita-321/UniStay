import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageGatepasses() {
  const [gatepasses, setGatepasses] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/gatepasses?page=${p}&limit=15${filter ? `&status=${filter}` : ""}`);
      setGatepasses(res.data.data.gatepasses);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this gatepass?")) return;
    try {
      await API.delete(`/admin/gatepasses/${id}`);
      toast.success("Gatepass deleted.");
      fetchData(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
  };

  const columns = [
    { key: "student", label: "Student", render: (r) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{r.student?.name}</p>
        <p className="text-xs text-gray-500">{r.student?.rollNumber}</p>
      </div>
    )},
    { key: "hostel", label: "Hostel", render: (r) => r.hostel?.name || "—" },
    { key: "reason", label: "Reason" },
    { key: "fromDate", label: "From", render: (r) => new Date(r.fromDate).toLocaleDateString() },
    { key: "toDate", label: "To", render: (r) => new Date(r.toDate).toLocaleDateString() },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status}>{r.status}</Badge> },
    { key: "approvedBy", label: "Approved By", render: (r) => r.approvedBy?.name || "—" },
    { key: "action", label: "", render: (r) => (
      <Button size="sm" variant="ghost" onClick={() => handleDelete(r._id)}>
        <Trash2 size={14} className="text-red-500" />
      </Button>
    )},
  ];

  return (
    <div className="space-y-4">
      <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40"
        options={[
          { value: "", label: "All Status" }, { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" },
        ]} />

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={gatepasses} emptyMessage="No gatepasses." />
            <Pagination page={page} pages={pages} onPageChange={fetchData} />
          </>
        )}
      </Card>
    </div>
  );
}
