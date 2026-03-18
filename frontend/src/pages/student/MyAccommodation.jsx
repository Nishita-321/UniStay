import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Loader from "../../components/ui/Loader";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function MyAccommodation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    visitorName: "", visitorRelation: "father", visitorPhone: "",
    visitorIdProof: "", fromDate: "", toDate: "", purpose: "",
  });

  const fetchData = async () => {
    try {
      const res = await API.get("/student/accommodation");
      setData(res.data.data.accommodations);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/student/accommodation", form);
      toast.success("Accommodation request submitted!");
      setShowForm(false);
      setForm({ visitorName: "", visitorRelation: "father", visitorPhone: "", visitorIdProof: "", fromDate: "", toDate: "", purpose: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit.");
    }
    setSubmitting(false);
  };

  const columns = [
    { key: "visitorName", label: "Visitor" },
    { key: "visitorRelation", label: "Relation", render: (r) => <span className="capitalize">{r.visitorRelation}</span> },
    { key: "fromDate", label: "From", render: (r) => new Date(r.fromDate).toLocaleDateString() },
    { key: "toDate", label: "To", render: (r) => new Date(r.toDate).toLocaleDateString() },
    { key: "roomAssigned", label: "Room", render: (r) => r.roomAssigned || "—" },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{data.length} requests</p>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Request Accommodation
        </Button>
      </div>

      <Card>
        {loading ? <Loader /> : <Table columns={columns} data={data} emptyMessage="No accommodation requests." />}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Request Parent/Visitor Accommodation" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Visitor Name" value={form.visitorName} onChange={(e) => setForm({ ...form, visitorName: e.target.value })} required />
            <Select label="Relation" value={form.visitorRelation} onChange={(e) => setForm({ ...form, visitorRelation: e.target.value })}
              options={[
                { value: "father", label: "Father" }, { value: "mother", label: "Mother" },
                { value: "guardian", label: "Guardian" }, { value: "sibling", label: "Sibling" }, { value: "other", label: "Other" },
              ]} />
            <Input label="Visitor Phone" type="tel" value={form.visitorPhone} onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })} required placeholder="10-digit number" />
            <Input label="ID Proof" value={form.visitorIdProof} onChange={(e) => setForm({ ...form, visitorIdProof: e.target.value })} placeholder="e.g. Aadhaar / PAN" />
            <Input label="From Date" type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required />
            <Input label="To Date" type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required />
          </div>
          <Textarea label="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Reason for visit..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
