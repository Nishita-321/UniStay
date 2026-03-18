import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function MyGatepasses() {
  const [gatepasses, setGatepasses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ reason: "", type: "day", fromDate: "", toDate: "" });

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/student/gatepasses?page=${p}&limit=10`);
      setGatepasses(res.data.data.gatepasses);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/student/gatepasses", form);
      toast.success("Gatepass submitted!");
      setShowForm(false);
      setForm({ reason: "", type: "day", fromDate: "", toDate: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit.");
    }
    setSubmitting(false);
  };

  const columns = [
    { key: "reason", label: "Reason" },
    { key: "type", label: "Type", render: (r) => <span className="capitalize">{r.type}</span> },
    {
      key: "fromDate", label: "From",
      render: (r) => new Date(r.fromDate).toLocaleDateString(),
    },
    {
      key: "toDate", label: "To",
      render: (r) => new Date(r.toDate).toLocaleDateString(),
    },
    {
      key: "status", label: "Status",
      render: (r) => <Badge variant={r.status}>{r.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{total} total gatepasses</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Apply Gatepass
        </Button>
      </div>

      <Card>
        {loading ? (
          <Loader />
        ) : (
          <>
            <Table columns={columns} data={gatepasses} emptyMessage="No gatepasses found." />
            <Pagination page={page} pages={pages} onPageChange={fetchData} />
          </>
        )}
      </Card>

      {/* Apply Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Apply for Gatepass">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Reason"
            placeholder="Why do you need this gatepass?"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: "day", label: "Day" },
              { value: "overnight", label: "Overnight" },
              { value: "emergency", label: "Emergency" },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Date"
              type="datetime-local"
              value={form.fromDate}
              onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
              required
            />
            <Input
              label="To Date"
              type="datetime-local"
              value={form.toDate}
              onChange={(e) => setForm({ ...form, toDate: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
