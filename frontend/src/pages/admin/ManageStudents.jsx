import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import { Search, Building2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [hostelFilter, setHostelFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState([]);
  const [assignModal, setAssignModal] = useState(null);
  const [assignForm, setAssignForm] = useState({ hostelId: "", roomNumber: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      let url = `/admin/students?page=${p}&limit=15`;
      if (search) url += `&search=${search}`;
      if (hostelFilter) url += `&hostel=${hostelFilter}`;
      const res = await API.get(url);
      setStudents(res.data.data.students);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => {
    API.get("/admin/hostels").then((res) => setHostels(res.data.data.hostels)).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [hostelFilter]);

  const handleAssign = async () => {
    setSubmitting(true);
    try {
      await API.patch(`/admin/students/${assignModal._id}/assign-hostel`, assignForm);
      toast.success("Hostel assigned!");
      setAssignModal(null);
      fetchData(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
    setSubmitting(false);
  };

  const columns = [
    { key: "rollNumber", label: "Roll No", render: (r) => <span className="font-mono text-xs">{r.rollNumber}</span> },
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", label: "Email" },
    { key: "department", label: "Dept", render: (r) => r.department || "—" },
    { key: "hostel", label: "Hostel", render: (r) =>
      r.hostel ? (
        <Badge variant="info">{r.hostel.name}</Badge>
      ) : (
        <span className="text-xs text-amber-500 font-medium">Unassigned</span>
      )
    },
    { key: "roomNumber", label: "Room", render: (r) => r.roomNumber || "—" },
    { key: "action", label: "", render: (r) => (
      <Button
        size="sm"
        variant={r.hostel ? "ghost" : "outline"}
        onClick={() => {
          setAssignModal(r);
          setAssignForm({ hostelId: r.hostel?._id || "", roomNumber: r.roomNumber || "" });
        }}
      >
        <Building2 size={14} />
        {r.hostel ? "Reassign" : "Assign Hostel"}
      </Button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchData(1); }} className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search name, roll, email..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors" />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <Select
          value={hostelFilter}
          onChange={(e) => setHostelFilter(e.target.value)}
          className="w-48"
          options={[
            { value: "", label: "All Hostels" },
            ...hostels.map((h) => ({ value: h._id, label: h.name })),
          ]}
        />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">{total} students found</p>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={students} emptyMessage="No students found." />
            <Pagination page={page} pages={pages} onPageChange={fetchData} />
          </>
        )}
      </Card>

      {/* Assign Hostel Modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title={`Assign Hostel — ${assignModal?.name}`}>
        <div className="space-y-4">
          {assignModal?.hostel && (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Currently assigned to</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {assignModal.hostel.name} — Room {assignModal.roomNumber || "N/A"}
              </p>
            </div>
          )}

          <Select
            label="Hostel"
            value={assignForm.hostelId}
            onChange={(e) => setAssignForm({ ...assignForm, hostelId: e.target.value })}
            options={[
              { value: "", label: "— Select Hostel —" },
              ...hostels.map((h) => ({
                value: h._id,
                label: `${h.name} — ${h.type} (${h.occupancy}/${h.capacity} occupied)`,
              })),
            ]}
          />

          <Input
            label="Room Number"
            value={assignForm.roomNumber}
            onChange={(e) => setAssignForm({ ...assignForm, roomNumber: e.target.value })}
            placeholder="e.g. A-201"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Button>
            <Button onClick={handleAssign} loading={submitting} disabled={!assignForm.hostelId}>
              {assignModal?.hostel ? "Reassign Hostel" : "Assign Hostel"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
