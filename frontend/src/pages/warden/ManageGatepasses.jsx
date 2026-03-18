import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

export default function ManageGatepasses() {
  const [gatepasses, setGatepasses] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [rejReason, setRejReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/warden/gatepasses?page=${p}&limit=15${filter ? `&status=${filter}` : ""}`);
      setGatepasses(res.data.data.gatepasses);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleAction = async (status) => {
    setSubmitting(true);
    try {
      await API.patch(`/warden/gatepasses/${actionModal._id}`, {
        status,
        rejectionReason: status === "rejected" ? rejReason : undefined,
      });
      toast.success(`Gatepass ${status}!`);
      setActionModal(null);
      setRejReason("");
      fetchData(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    }
    setSubmitting(false);
  };

  const columns = [
    { key: "student", label: "Student", render: (r) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{r.student?.name}</p>
        <p className="text-xs text-gray-500">{r.student?.rollNumber}</p>
      </div>
    )},
    { key: "reason", label: "Reason" },
    { key: "type", label: "Type", render: (r) => <span className="capitalize">{r.type}</span> },
    { key: "fromDate", label: "From", render: (r) => new Date(r.fromDate).toLocaleDateString() },
    { key: "toDate", label: "To", render: (r) => new Date(r.toDate).toLocaleDateString() },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status}>{r.status}</Badge> },
    { key: "action", label: "", render: (r) =>
      r.status === "pending" ? (
        <Button size="sm" variant="outline" onClick={() => setActionModal(r)}>Review</Button>
      ) : null
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: "", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
          className="w-40"
        />
      </div>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={gatepasses} emptyMessage="No gatepasses found." />
            <Pagination page={page} pages={pages} onPageChange={fetchData} />
          </>
        )}
      </Card>

      <Modal open={!!actionModal} onClose={() => setActionModal(null)} title="Review Gatepass">
        {actionModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500 dark:text-gray-400">Student:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{actionModal.student?.name}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Roll No:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{actionModal.student?.rollNumber}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Type:</span> <span className="capitalize font-medium text-gray-900 dark:text-white ml-1">{actionModal.type}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Room:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{actionModal.student?.roomNumber || "—"}</span></div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Reason:</span>
              <p className="mt-1 text-gray-900 dark:text-white">{actionModal.reason}</p>
            </div>
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Period:</span>
              <span className="ml-1 text-gray-900 dark:text-white">
                {new Date(actionModal.fromDate).toLocaleString()} — {new Date(actionModal.toDate).toLocaleString()}
              </span>
            </div>
            <Textarea label="Rejection Reason (if rejecting)" value={rejReason} onChange={(e) => setRejReason(e.target.value)} placeholder="Why is this being rejected?" />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="danger" onClick={() => handleAction("rejected")} loading={submitting} disabled={!rejReason && submitting}>
                Reject
              </Button>
              <Button variant="success" onClick={() => handleAction("approved")} loading={submitting}>
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
