import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

export default function ManageAccommodation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [roomAssigned, setRoomAssigned] = useState("");
  const [rejReason, setRejReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get("/warden/accommodation");
      setData(res.data.data.accommodations);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (status) => {
    setSubmitting(true);
    try {
      await API.patch(`/warden/accommodation/${actionModal._id}`, {
        status,
        roomAssigned: status === "approved" ? roomAssigned : undefined,
        rejectionReason: status === "rejected" ? rejReason : undefined,
      });
      toast.success(`Request ${status}!`);
      setActionModal(null);
      setRoomAssigned("");
      setRejReason("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    }
    setSubmitting(false);
  };

  const columns = [
    { key: "student", label: "Student", render: (r) => r.student?.name },
    { key: "visitorName", label: "Visitor" },
    { key: "visitorRelation", label: "Relation", render: (r) => <span className="capitalize">{r.visitorRelation}</span> },
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
      <Card>
        {loading ? <Loader /> : (
          <Table columns={columns} data={data} emptyMessage="No accommodation requests." />
        )}
      </Card>

      <Modal open={!!actionModal} onClose={() => setActionModal(null)} title="Review Accommodation Request">
        {actionModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500 dark:text-gray-400">Student:</span> <span className="ml-1 font-medium text-gray-900 dark:text-white">{actionModal.student?.name}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Visitor:</span> <span className="ml-1 font-medium text-gray-900 dark:text-white">{actionModal.visitorName}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Relation:</span> <span className="ml-1 capitalize text-gray-900 dark:text-white">{actionModal.visitorRelation}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Phone:</span> <span className="ml-1 text-gray-900 dark:text-white">{actionModal.visitorPhone}</span></div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Period:</span>
              <span className="ml-1 text-gray-900 dark:text-white">
                {new Date(actionModal.fromDate).toLocaleDateString()} — {new Date(actionModal.toDate).toLocaleDateString()}
              </span>
            </div>
            {actionModal.purpose && (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Purpose:</span>
                <p className="mt-1 text-gray-900 dark:text-white">{actionModal.purpose}</p>
              </div>
            )}
            <Input label="Room to Assign (if approving)" value={roomAssigned} onChange={(e) => setRoomAssigned(e.target.value)} placeholder="e.g. G-101" />
            <Textarea label="Rejection Reason (if rejecting)" value={rejReason} onChange={(e) => setRejReason(e.target.value)} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="danger" onClick={() => handleAction("rejected")} loading={submitting}>Reject</Button>
              <Button variant="success" onClick={() => handleAction("approved")} loading={submitting}>Approve</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
