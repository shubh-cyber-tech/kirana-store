import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { api } from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";

export default function CustomerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data.orders));
  }, []);

  return (
    <section className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Manage your grocery slip orders, invoices, payments, and chats.</p>
        </div>
        <Link className="btn-primary" to="/upload-slip">Upload Slip</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="Pending" value={orders.filter((o) => o.status !== "Order Delivered").length} accent="bg-orange-100 text-orange-800" />
        <StatCard label="Delivered" value={orders.filter((o) => o.status === "Order Delivered").length} />
      </div>
      <div className="panel mt-6 overflow-hidden">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-xl font-bold">Recent Orders</h2>
        </div>
        {orders.slice(0, 5).map((order) => (
          <Link to={`/orders/${order._id}`} className="grid gap-2 border-b border-slate-100 p-5 last:border-0 md:grid-cols-[1fr_auto]" key={order._id}>
            <span className="font-semibold">#{order._id.slice(-8).toUpperCase()}</span>
            <span className="text-sm text-slate-600">{order.status}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
