import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card, { CardHeader } from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import toast from "react-hot-toast";

export default function MyFees() {
  const [fees, setFees] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  const fetchData = async () => {
    try {
      const res = await API.get("/student/fees");
      setFees(res.data.data.fees);
      setTotalPending(res.data.data.totalPending);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handlePay = async (id) => {
    setPaying(id);
    try {
      await API.post(`/student/fees/${id}/pay`);
      toast.success("Fee paid successfully!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed.");
    }
    setPaying(null);
  };

  const columns = [
    { key: "type", label: "Type", render: (r) => <span className="capitalize font-medium">{r.type}</span> },
    { key: "description", label: "Description", render: (r) => r.description || "—" },
    { key: "amount", label: "Amount", render: (r) => `₹${r.amount.toLocaleString()}` },
    { key: "dueDate", label: "Due Date", render: (r) => new Date(r.dueDate).toLocaleDateString() },
    { key: "status", label: "Status", render: (r) => <Badge variant={r.status}>{r.status}</Badge> },
    {
      key: "action", label: "", render: (r) =>
        r.status !== "paid" ? (
          <Button size="sm" onClick={() => handlePay(r._id)} loading={paying === r._id}>
            Pay Now
          </Button>
        ) : (
          <span className="text-xs text-gray-400">Paid {new Date(r.paidAt).toLocaleDateString()}</span>
        ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      {totalPending > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            You have ₹{totalPending.toLocaleString()} in pending fees.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Fee History</h3>
        </CardHeader>
        <Table columns={columns} data={fees} emptyMessage="No fees found." />
      </Card>
    </div>
  );
}
