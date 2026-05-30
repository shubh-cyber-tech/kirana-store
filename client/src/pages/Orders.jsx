import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data.orders));
  }, []);

  return (
    <section className="container-page py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Link className="btn-primary" to="/upload-slip">New Order</Link>
      </div>
      <div className="grid gap-4">
        {orders.map((order) => (
          <Link to={`/orders/${order._id}`} className="panel grid gap-3 p-5 transition hover:border-green-300 md:grid-cols-[1fr_auto]" key={order._id}>
            <div>
              <p className="font-semibold">Order #{order._id.slice(-8).toUpperCase()}</p>
              <p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-left md:text-right">
              <span className="rounded-md bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">{order.status}</span>
              <p className="mt-2 text-sm text-slate-600">Rs. {order.invoice?.amount || "Pending"}</p>
            </div>
          </Link>
        ))}
        {!orders.length && <div className="panel p-8 text-center text-slate-500">No orders yet.</div>}
      </div>
    </section>
  );
}
