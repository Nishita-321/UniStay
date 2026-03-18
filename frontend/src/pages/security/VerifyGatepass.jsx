import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card, { CardHeader } from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import { Search, LogOut, LogIn, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyGatepass() {
  const [gatepasses, setGatepasses] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/security/gatepasses?page=${p}&limit=15&search=${search}`);
      setGatepasses(res.data.data.gatepasses);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1);
  };

  const viewDetail = async (id) => {
    try {
      const res = await API.get(`/security/gatepasses/${id}`);
      setDetail(res.data.data.gatepass);
    } catch { toast.error("Failed to load details."); }
  };

  const markOut = async () => {
    setActionLoading(true);
    try {
      await API.patch(`/security/gatepasses/${detail._id}/out`);
      toast.success("Student checked out!");
      setDetail(null);
      fetchData(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
    setActionLoading(false);
  };

  const markIn = async () => {
    setActionLoading(true);
    try {
      const res = await API.patch(`/security/gatepasses/${detail._id}/in`);
      const msg = res.data.data.isLate
        ? "Student checked in (LATE!)"
        : "Student checked in!";
      toast.success(msg);
      setDetail(null);
      fetchData(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
    setActionLoading(false);
  };

  const columns = [
    { key: "student", label: "Student", render: (r) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{r.student?.name}</p>
        <p className="text-xs text-gray-500">{r.student?.rollNumber}</p>
      </div>
    )},
    { key: "hostel", label: "Hostel", render: (r) => r.hostel?.name || "—" },
    { key: "fromDate", label: "Valid From", render: (r) => new Date(r.fromDate).toLocaleString() },
    { key: "toDate", label: "Valid Until", render: (r) => new Date(r.toDate).toLocaleString() },
    { key: "gate", label: "Gate Status", render: (r) => {
      if (r.inTime) return <Badge variant="completed">Returned</Badge>;
      if (r.outTime) return <Badge variant="pending">Out</Badge>;
      return <Badge variant="approved">Ready</Badge>;
    }},
    { key: "action", label: "", render: (r) => (
      <Button size="sm" variant="ghost" onClick={() => viewDetail(r._id)}>
        <Eye size={14} /> View
      </Button>
    )},
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search student name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
              text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={gatepasses} emptyMessage="No approved gatepasses." />
            <Pagination page={page} pages={pages} onPageChange={fetchData} />
          </>
        )}
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Gatepass Verification" size="md">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500 dark:text-gray-400">Name:</span> <span className="ml-1 font-medium text-gray-900 dark:text-white">{detail.student?.name}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Roll No:</span> <span className="ml-1 font-mono text-gray-900 dark:text-white">{detail.student?.rollNumber}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Phone:</span> <span className="ml-1 text-gray-900 dark:text-white">{detail.student?.phone || "—"}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Hostel:</span> <span className="ml-1 text-gray-900 dark:text-white">{detail.hostel?.name}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Parent:</span> <span className="ml-1 text-gray-900 dark:text-white">{detail.student?.parentName || "—"}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Parent Phone:</span> <span className="ml-1 text-gray-900 dark:text-white">{detail.student?.parentPhone || "—"}</span></div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm space-y-1">
              <p><span className="text-gray-500 dark:text-gray-400">Valid:</span> <span className="text-gray-900 dark:text-white">{new Date(detail.fromDate).toLocaleString()} — {new Date(detail.toDate).toLocaleString()}</span></p>
              <p><span className="text-gray-500 dark:text-gray-400">Reason:</span> <span className="text-gray-900 dark:text-white">{detail.reason}</span></p>
              <p><span className="text-gray-500 dark:text-gray-400">Approved by:</span> <span className="text-gray-900 dark:text-white">{detail.approvedBy?.name || "—"}</span></p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {!detail.outTime && (
                <Button onClick={markOut} loading={actionLoading}>
                  <LogOut size={16} /> Mark OUT
                </Button>
              )}
              {detail.outTime && !detail.inTime && (
                <Button variant="success" onClick={markIn} loading={actionLoading}>
                  <LogIn size={16} /> Mark IN
                </Button>
              )}
              {detail.inTime && (
                <Badge variant="completed" className="text-base px-4 py-2">Completed</Badge>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
