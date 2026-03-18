import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageHostels() {
  const [hostels, setHostels] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Warden assignment
  const [wardenModal, setWardenModal] = useState(null);
  const [selectedWarden, setSelectedWarden] = useState("");
  const [assigningWarden, setAssigningWarden] = useState(false);

  const emptyForm = { name: "", type: "boys", totalRooms: "", capacity: "", address: "" };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [hostelRes, wardenRes] = await Promise.all([
        API.get("/admin/hostels"),
        API.get("/admin/users?role=warden&limit=100"),
      ]);
      setHostels(hostelRes.data.data.hostels);
      setWardens(wardenRes.data.data.users);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (hostel) => {
    setEditing(hostel._id);
    setForm({
      name: hostel.name,
      type: hostel.type,
      totalRooms: hostel.totalRooms,
      capacity: hostel.capacity,
      address: hostel.address || "",
    });
    setShowForm(true);
  };

  const openWardenAssign = (hostel) => {
    setWardenModal(hostel);
    setSelectedWarden(hostel.warden?._id || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await API.patch(`/admin/hostels/${editing}`, form);
        toast.success("Hostel updated!");
      } else {
        await API.post("/admin/hostels", form);
        toast.success("Hostel created!");
      }
      setShowForm(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    }
    setSubmitting(false);
  };

  const handleAssignWarden = async () => {
    if (!selectedWarden) {
      toast.error("Please select a warden.");
      return;
    }
    setAssigningWarden(true);
    try {
      await API.patch(`/admin/hostels/${wardenModal._id}/assign-warden`, {
        wardenId: selectedWarden,
      });
      toast.success("Warden assigned successfully!");
      setWardenModal(null);
      setSelectedWarden("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign warden.");
    }
    setAssigningWarden(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this hostel? This cannot be undone.")) return;
    try {
      await API.delete(`/admin/hostels/${id}`);
      toast.success("Hostel deleted.");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot delete.");
    }
  };

  const columns = [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "type", label: "Type", render: (r) => <Badge variant="info">{r.type}</Badge> },
    { key: "totalRooms", label: "Rooms" },
    { key: "occupancy", label: "Occupancy", render: (r) => (
      <span className={r.occupancy >= r.capacity ? "text-red-500 font-medium" : ""}>
        {r.occupancy}/{r.capacity}
      </span>
    )},
    { key: "warden", label: "Warden", render: (r) =>
      r.warden ? (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{r.warden.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{r.warden.email}</p>
        </div>
      ) : (
        <span className="text-xs text-amber-500 font-medium">Not assigned</span>
      )
    },
    { key: "action", label: "", render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => openWardenAssign(r)} title="Assign Warden">
          <UserPlus size={14} className="text-primary-500" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title="Edit Hostel">
          <Pencil size={14} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => handleDelete(r._id)} title="Delete Hostel">
          <Trash2 size={14} className="text-red-500" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus size={16} /> Add Hostel</Button>
      </div>

      <Card>
        {loading ? <Loader /> : (
          <Table columns={columns} data={hostels} emptyMessage="No hostels found." />
        )}
      </Card>

      {/* Create / Edit Hostel Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Hostel" : "Create Hostel"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Hostel Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[{ value: "boys", label: "Boys" }, { value: "girls", label: "Girls" }]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Rooms" type="number" min="1" value={form.totalRooms} onChange={(e) => setForm({ ...form, totalRooms: e.target.value })} required />
            <Input label="Capacity" type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? "Save Changes" : "Create Hostel"}</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Warden Modal */}
      <Modal open={!!wardenModal} onClose={() => setWardenModal(null)} title={`Assign Warden — ${wardenModal?.name}`}>
        <div className="space-y-4">
          {wardenModal?.warden && (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Currently assigned</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{wardenModal.warden.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{wardenModal.warden.email}</p>
            </div>
          )}

          <Select
            label="Select Warden"
            value={selectedWarden}
            onChange={(e) => setSelectedWarden(e.target.value)}
            options={[
              { value: "", label: "— Choose a warden —" },
              ...wardens.map((w) => ({
                value: w._id,
                label: `${w.name} (${w.email})`,
              })),
            ]}
          />

          {wardens.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No warden users found. Create a warden account first from the Manage Users page.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setWardenModal(null)}>Cancel</Button>
            <Button onClick={handleAssignWarden} loading={assigningWarden} disabled={!selectedWarden}>
              Assign Warden
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
