import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card, { CardHeader } from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader";
import { Search } from "lucide-react";

export default function HostelStudents() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (p = 1, q = search) => {
    setLoading(true);
    try {
      const res = await API.get(`/warden/students?page=${p}&limit=15&search=${q}`);
      setStudents(res.data.data.students);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setPage(p);
    } catch { /* */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchData(1, e.target.value);
  };

  const columns = [
    { key: "rollNumber", label: "Roll No", render: (r) => <span className="font-mono text-xs">{r.rollNumber}</span> },
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
    { key: "roomNumber", label: "Room", render: (r) => r.roomNumber || "—" },
    { key: "year", label: "Year", render: (r) => r.year || "—" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{total} students</p>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or roll no..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
              text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      <Card>
        {loading ? <Loader /> : (
          <>
            <Table columns={columns} data={students} emptyMessage="No students found." />
            <Pagination page={page} pages={pages} onPageChange={fetchData} />
          </>
        )}
      </Card>
    </div>
  );
}
