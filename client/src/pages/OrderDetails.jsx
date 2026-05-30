import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, MessageCircle, Wallet } from "lucide-react";
import { api } from "../api/axios.js";
import { downloadFile } from "../api/download.js";
import { getSocket } from "../api/socket.js";
import OrderTimeline from "../components/OrderTimeline.jsx";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order));
    const socket = getSocket();
    socket?.emit("order:join", id);
    socket?.on("order:updated", setOrder);
    return () => socket?.off("order:updated", setOrder);
  }, [id]);

  if (!order) return <section className="container-page py-10">Loading order...</section>;

  const downloadInvoice = () =>
    downloadFile(
      `/orders/${id}/invoice/download`,
      `invoice-${id}.pdf`
    );

  const downloadSlip = () =>
    downloadFile(
      `/orders/${id}/slip/download`,
      `slip-${id}.pdf`
    );

  return (
    <section className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <Link className="btn-secondary" to={`/orders/${id}/chat`}><MessageCircle size={18} /> Chat</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div className="panel p-6">
          <h2 className="mb-5 text-xl font-bold">Tracking</h2>
          <OrderTimeline order={order} />
        </div>
        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-xl font-bold">Invoice</h2>
            {order.invoice?.url ? (
              <div className="mt-4 space-y-3">
                <p className="text-3xl font-bold">Rs. {order.invoice.amount}</p>
                <button className="btn-secondary w-full" onClick={downloadInvoice}><Download size={18} /> Download PDF</button>
                {order.paymentMethod === "online" && order.paymentStatus !== "paid" && (
                  <Link className="btn-primary w-full" to={`/orders/${id}/payment`}><Wallet size={18} /> Pay Online</Link>
                )}
              </div>
            ) : (
              <p className="mt-3 text-slate-500">Bill is being prepared by admin.</p>
            )}
          </div>
          <div className="panel p-6">
            <h2 className="text-xl font-bold">{order.orderType === "manual" ? "Written Grocery List" : "Uploaded Slip"}</h2>
            {order.orderType === "manual" ? (
              <div className="mt-4 space-y-2">
                {order.manualItems?.map((item) => (
                  <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900" key={item._id || item.name}>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-slate-600 dark:text-slate-300">{item.quantity} {item.unit}{item.note ? ` - ${item.note}` : ""}</p>
                  </div>
                ))}
              </div>
            ) : (
              <button className="mt-4 inline-flex text-leaf" onClick={downloadSlip} type="button">Download slip</button>
            )}
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{order.notes || "No notes added."}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
