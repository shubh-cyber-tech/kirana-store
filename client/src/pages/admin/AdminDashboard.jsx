import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../api/axios.js";
import StatCard from "../../components/StatCard.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleEmail, setRoleEmail] = useState("bhardwajshubhankit@gmail.com");
  const [roleSaving, setRoleSaving] = useState(false);

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then(({ data }) => setStats(data))
      .catch((err) => {
        const message = err.response?.data?.message || "Unable to load admin dashboard";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const promote = async (event) => {
    event.preventDefault();
    setRoleSaving(true);
    try {
      const { data } = await api.patch("/admin/users/role", { email: roleEmail, role: "admin" });
      toast.success(`${data.user.email} is now admin`);
      setRoleEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update role");
    } finally {
      setRoleSaving(false);
    }
  };

  if (loading) return <section className="container-page py-10">Loading admin dashboard...</section>;

  if (error) {
    return (
      <section className="container-page py-10">
        <div className="panel max-w-2xl p-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-3 text-red-600">{error}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Make sure you are logged in with a user whose MongoDB `role` is `admin`, then refresh this page.
          </p>
          <Link className="btn-primary mt-5" to="/login">Login Again</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Review slips, upload invoices, manage payments, and track delivery operations.</p>
        </div>
        <Link className="btn-primary" to="/admin/orders">Manage Orders</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} accent="bg-orange-100 text-orange-800" />
        <StatCard label="Delivered" value={stats.deliveredOrders} />
        <StatCard label="Revenue" value={`Rs. ${stats.revenue}`} accent="bg-slate-100 text-slate-800" />
      </div>
      <form onSubmit={promote} className="panel mt-6 grid gap-3 p-5 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-lg font-bold">Admin Access</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Promote a registered user email to admin access.</p>
          <input className="field mt-3" type="email" value={roleEmail} onChange={(e) => setRoleEmail(e.target.value)} placeholder="user@example.com" required />
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full md:w-auto" disabled={roleSaving}>{roleSaving ? "Updating..." : "Make Admin"}</button>
        </div>
      </form>
      <div className="panel mt-6 overflow-hidden">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-xl font-bold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr className="border-t border-slate-100 dark:border-slate-800" key={order._id}>
                  <td className="p-4 font-semibold">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4">{order.customer?.name}</td>
                  <td className="p-4">{order.status}</td>
                  <td className="p-4">Rs. {order.invoice?.amount || 0}</td>
                  <td className="p-4"><Link className="text-leaf" to="/admin/orders">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
