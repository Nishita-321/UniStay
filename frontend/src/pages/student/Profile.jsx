import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

export default function Profile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    API.get("/student/profile").then((res) => {
      setStudent(res.data.data.student);
      setLoading(false);
    });
  }, []);

  const startEdit = () => {
    setForm({
      phone: student.phone || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      parentEmail: student.parentEmail || "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.patch("/student/profile", form);
      setStudent(res.data.data.student);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed.");
    }
    setSaving(false);
  };

  if (loading) return <Loader />;

  const InfoRow = ({ label, value }) => (
    <div className="py-3 flex justify-between border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value || "—"}</span>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* Personal Info */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>
        </CardHeader>
        <CardBody>
          <InfoRow label="Name" value={student.name} />
          <InfoRow label="Email" value={student.email} />
          <InfoRow label="Roll Number" value={student.rollNumber} />
          <InfoRow label="Department" value={student.department} />
          <InfoRow label="Year" value={student.year} />
          <InfoRow label="Phone" value={student.phone} />
        </CardBody>
      </Card>

      {/* Hostel Info */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Hostel Details</h3>
        </CardHeader>
        <CardBody>
          <InfoRow label="Hostel" value={student.hostel?.name} />
          <InfoRow label="Room" value={student.roomNumber} />
          <InfoRow label="Mess Card" value={student.messCardActive ? "Active" : "Inactive"} />
        </CardBody>
      </Card>

      {/* Parent Info */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Parent Details</h3>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={startEdit}>Edit</Button>
          )}
        </CardHeader>
        <CardBody>
          {editing ? (
            <div className="space-y-4">
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="Parent Name" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
              <Input label="Parent Phone" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
              <Input label="Parent Email" type="email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} />
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} loading={saving}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <InfoRow label="Parent Name" value={student.parentName} />
              <InfoRow label="Parent Phone" value={student.parentPhone} />
              <InfoRow label="Parent Email" value={student.parentEmail} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
