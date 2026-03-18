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
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageFees() {
  const [fees, setFees] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hostels, setHostels] = useState([]);

  const [form, setForm] = useState({ student: "", type: "hostel", description: "", amount: "", dueDate: "", semester: "" });
  const [bulkForm, setBulkForm] = useState({ hostelId: "", type: "hostel", description: "", amount: "", dueDate: "", semester: "" });

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      let url = `/admin/fees?page=${p}&limit=15`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (typeFilter) url += `&type=${typeFilter}`;
      const res = await API.get(url);
      setFees(res.data.data.fees);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    API.get("/admin/hostels").then((res) => setHostels(res.data.data.hostels)).catch(() => {});
  }, [statusFilter, typeFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/admin/fees", form);
      toast.success("Fee created!");
      setShowCreate(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
    setSubmitting(false);
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post("/admin/fees/bulk", bulkForm);
      toast.success(res.data.message);
      setShowBulk(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this fee record?")) return;
    try {
      await API.delete(`/admin/fees/${id}`);
      toast.success("Deleted.");
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
    { key: "type", label: "Type", render: (r) => <span className="capitalize">{r.type}</span> },
    { key: "description", label: "Description", render: (r) => r.description || "—" },
    { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString()}` },
    { key: "dueDate", label: "Due", render: (r) => new Date(r.dueDate).toLocaleDateString() },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status}>{r.status}</Badge> },
    { key: "action", label: "", render: (r) => (
      <Button size="sm" variant="ghost" onClick={() => handleDelete(r._id)}>
        <Trash2 size={14} className="text-red-500" />
      </Button>
    )},
  ];

  const feeTypeOptions = [
    { value: "hostel", label: "Hostel" }, { value: "mess", label: "Mess" },
    { value: "fine", label: "Fine" }, { value: "other", label: "Other" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36"
            options={[{ value: "", label: "All Status" }, { value: "pending", label: "Pending" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" }]} />
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-36"
            options={[{ value: "", label: "All Types" }, ...feeTypeOptions]} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulk(true)}>Bulk (Hostel)</Button>
          <Button onClick={() => setShowCreate(true)}><Plus size={16} /> Add Fee</Button>
        </div>
      </div>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={fees} emptyMessage="No fees found." />
            <Pagination page={page} pages={pages} onPageChange={fetchData} />
          </>
        )}
      </Card>

      {/* Single Fee */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Fee / Fine">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Student ID" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required placeholder="Paste student MongoDB ID" />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={feeTypeOptions} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (₹)" type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          </div>
          <Input label="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="e.g. 2025-Spring" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create Fee</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Fee */}
      <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Bulk Create Fees (Hostel-wide)">
        <form onSubmit={handleBulkCreate} className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This will create a fee for every student assigned to the selected hostel.
          </p>
          <Select label="Hostel" value={bulkForm.hostelId} onChange={(e) => setBulkForm({ ...bulkForm, hostelId: e.target.value })}
            options={[{ value: "", label: "Select Hostel" }, ...hostels.map((h) => ({ value: h._id, label: h.name }))]} />
          <Select label="Type" value={bulkForm.type} onChange={(e) => setBulkForm({ ...bulkForm, type: e.target.value })} options={feeTypeOptions} />
          <Input label="Description" value={bulkForm.description} onChange={(e) => setBulkForm({ ...bulkForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (₹)" type="number" min="1" value={bulkForm.amount} onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })} required />
            <Input label="Due Date" type="date" value={bulkForm.dueDate} onChange={(e) => setBulkForm({ ...bulkForm, dueDate: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowBulk(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} disabled={!bulkForm.hostelId}>Create for All Students</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
