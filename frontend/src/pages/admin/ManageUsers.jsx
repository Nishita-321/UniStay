import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card, { CardHeader } from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import { Plus, Upload, Search, UserX, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = { name: "", email: "", password: "", role: "student", phone: "", rollNumber: "", department: "", year: "", employeeId: "" };
  const [form, setForm] = useState(emptyForm);
  const [bulkJson, setBulkJson] = useState("");

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      let url = `/admin/users?page=${p}&limit=15`;
      if (search) url += `&search=${search}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      const res = await API.get(url);
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [roleFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/admin/users", form);
      toast.success("User created!");
      setShowCreate(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
    setSubmitting(false);
  };

  const handleBulk = async () => {
    setSubmitting(true);
    try {
      const parsed = JSON.parse(bulkJson);
      const res = await API.post("/admin/users/bulk", { users: parsed });
      toast.success(res.data.message);
      setShowBulk(false);
      setBulkJson("");
      fetchData();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error("Invalid JSON format.");
      } else {
        toast.error(err.response?.data?.message || "Bulk creation failed.");
      }
    }
    setSubmitting(false);
  };

  const toggleActive = async (id, isActive) => {
    try {
      await API.patch(`/admin/users/${id}/${isActive ? "deactivate" : "activate"}`);
      toast.success(`User ${isActive ? "deactivated" : "activated"}.`);
      fetchData(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1);
  };

  const columns = [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (r) => <Badge variant="info">{r.role}</Badge> },
    { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
    { key: "isActive", label: "Status", render: (r) => (
      <Badge variant={r.isActive ? "active" : "inactive"}>
        {r.isActive ? "Active" : "Inactive"}
      </Badge>
    )},
    { key: "action", label: "", render: (r) => (
      <Button size="sm" variant="ghost" onClick={() => toggleActive(r._id, r.isActive)}>
        {r.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
      </Button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors w-56" />
          </form>
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-36"
            options={[
              { value: "", label: "All Roles" }, { value: "student", label: "Student" },
              { value: "warden", label: "Warden" }, { value: "security", label: "Security" }, { value: "admin", label: "Admin" },
            ]} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulk(true)}>
            <Upload size={16} /> Bulk Create
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add User
          </Button>
        </div>
      </div>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={users} emptyMessage="No users found." />
            <Pagination page={page} pages={pages} onPageChange={fetchData} />
          </>
        )}
      </Card>

      {/* Create Single User Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New User" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: "student", label: "Student" }, { value: "warden", label: "Warden" },
                { value: "security", label: "Security" }, { value: "admin", label: "Admin" },
              ]} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" />
            {form.role === "student" && (
              <>
                <Input label="Roll Number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} required />
                <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                <Input label="Year" type="number" min="1" max="5" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </>
            )}
            {form.role === "warden" && (
              <Input label="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Create Modal */}
      <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Bulk Create Users" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Paste a JSON array of user objects. Each must have: name, email, password, role. Students also need rollNumber.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{`[
  { "name": "John", "email": "john@uni.edu", "password": "pass123", "role": "student", "rollNumber": "CS001" },
  { "name": "Jane", "email": "jane@uni.edu", "password": "pass123", "role": "student", "rollNumber": "CS002" }
]`}</pre>
          </div>
          <Textarea rows={8} value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} placeholder="Paste JSON array here..." />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowBulk(false)}>Cancel</Button>
            <Button onClick={handleBulk} loading={submitting} disabled={!bulkJson.trim()}>
              Create Users
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
