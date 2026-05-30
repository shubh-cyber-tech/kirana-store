import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, FileText, MessageCircle, RefreshCw, Search, Upload, XCircle } from "lucide-react";
import { api } from "../../api/axios.js";
import { downloadFile } from "../../api/download.js";

const ORDER_STATUSES = [
  "Order Placed",
  "Slip Under Review",
  "Bill Generated",
  "Payment Pending",
  "Payment Completed",
  "Order Packed",
  "Order Dispatched",
  "Out for Delivery",
  "Order Delivered",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const params = useMemo(() => {
    const next = {};
    if (status) next.status = status;
    if (query.trim()) next.q = query.trim();
    return next;
  }, [query, status]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/orders", { params });
      setOrders(data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [params]);

  const runOrderAction = async (id, action, successMessage) => {
    setSavingId(id);
    try {
      await action();
      toast.success(successMessage);
      await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Order update failed");
    } finally {
      setSavingId("");
    }
  };

  const handleAcceptOrder = (id) =>
    runOrderAction(
      id,
      () => api.patch(`/admin/orders/${id}/review`, { reviewStatus: "accepted" }),
      "Order accepted"
    );

  const handleRejectOrder = (id) => {
    const reason = window.prompt("Reason for rejection", "Rejected by admin");
    if (reason === null) return;

    runOrderAction(
      id,
      () => api.patch(`/admin/orders/${id}/review`, { reviewStatus: "rejected", reason }),
      "Order rejected"
    );
  };

  const handleStatusUpdate = (id, nextStatus) =>
    runOrderAction(
      id,
      () => api.patch(`/admin/orders/${id}/status`, { status: nextStatus }),
      "Status updated"
    );

  const handleInvoiceUpload = (id, file, amount) => {
    if (!file) {
      toast.error("Please choose an invoice file");
      return;
    }

    const invoiceAmount = Number(amount);
    if (!Number.isFinite(invoiceAmount) || invoiceAmount <= 0) {
      toast.error("Enter a valid invoice amount");
      return;
    }

    const formData = new FormData();
    formData.append("invoice", file);
    formData.append("amount", invoiceAmount);

    runOrderAction(
      id,
      () =>
        api.post(`/admin/orders/${id}/invoice`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
      "Invoice uploaded"
    );
  };

  const handleCodReceived = (id) =>
    runOrderAction(
      id,
      () => api.post(`/admin/orders/${id}/cod-received`),
      "COD payment marked received"
    );

  return (
    <section className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Admin Orders</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Review slips, upload invoices, update delivery status, and close COD payments.
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchOrders} disabled={loading}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="panel mb-6 grid gap-3 p-4 md:grid-cols-[1fr_240px]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            className="field pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer name or email"
          />
        </label>
        <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((orderStatus) => (
            <option key={orderStatus} value={orderStatus}>
              {orderStatus}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="panel p-8 text-center text-slate-500">Loading orders...</div>
      ) : orders.length ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              busy={savingId === order._id}
              onAccept={handleAcceptOrder}
              onReject={handleRejectOrder}
              onStatusUpdate={handleStatusUpdate}
              onInvoiceUpload={handleInvoiceUpload}
              onCodReceived={handleCodReceived}
            />
          ))}
        </div>
      ) : (
        <div className="panel p-8 text-center text-slate-500">No orders found.</div>
      )}
    </section>
  );
}

function OrderCard({ order, busy, onAccept, onReject, onStatusUpdate, onInvoiceUpload, onCodReceived }) {
  const [file, setFile] = useState(null);
  const [amount, setAmount] = useState(order.invoice?.amount || "");
  const canMarkCodReceived =
    order.paymentMethod === "cod" &&
    order.invoice?.amount &&
    order.paymentStatus !== "paid";

  return (
    <article className="panel overflow-hidden">
      <div className="grid gap-4 border-b border-slate-200 p-5 dark:border-slate-800 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">Order #{order._id.slice(-8).toUpperCase()}</h2>
            <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
              {order.status}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {order.paymentMethod?.toUpperCase()} / {order.paymentStatus}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {order.customer?.name || "Unknown customer"} - {order.customer?.phone || order.customer?.email || "No contact"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap items-start gap-2 lg:justify-end">
          <Link className="btn-secondary" to={`/orders/${order._id}/chat`}>
            <MessageCircle size={17} /> Chat
          </Link>
          {order.invoice?.url && (
            <button className="btn-secondary" onClick={() => downloadFile(`/orders/${order._id}/invoice/download`, `invoice-${order._id}.pdf`)}>
              <FileText size={17} /> Invoice PDF
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => onAccept(order._id)} disabled={busy || order.reviewStatus === "accepted"}>
              <CheckCircle2 size={17} /> Accept
            </button>
            <button className="btn-secondary border-red-200 text-red-700 hover:bg-red-50" onClick={() => onReject(order._id)} disabled={busy}>
              <XCircle size={17} /> Reject
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Delivery status</span>
            <select
              value={order.status}
              onChange={(event) => onStatusUpdate(order._id, event.target.value)}
              className="field"
              disabled={busy}
            >
              {ORDER_STATUSES.map((orderStatus) => (
                <option key={orderStatus} value={orderStatus}>
                  {orderStatus}
                </option>
              ))}
            </select>
          </label>

          {order.orderType === "manual" ? (
            <div>
              <p className="mb-2 text-sm font-semibold">Manual items</p>
              <div className="space-y-2">
                {order.manualItems?.map((item) => (
                  <div className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900" key={item._id || item.name}>
                    <span className="font-semibold">{item.name}</span> - {item.quantity} {item.unit}
                    {item.note ? <span className="text-slate-500"> ({item.note})</span> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button
              className="inline-flex text-sm font-semibold text-leaf"
              onClick={() => downloadFile(`/orders/${order._id}/slip/download`, `slip-${order._id}.pdf`)}
              type="button"
            >
              Download uploaded slip
            </button>
          )}
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Invoice file</span>
            <input className="field" type="file" accept="application/pdf,image/png,image/jpeg" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Invoice amount</span>
            <input className="field" type="number" min="1" step="0.01" placeholder="Amount" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>

          <button className="btn-primary w-full" onClick={() => onInvoiceUpload(order._id, file, amount)} disabled={busy}>
            <Upload size={17} /> Upload Invoice
          </button>

          {canMarkCodReceived && (
            <button className="btn-secondary w-full" onClick={() => onCodReceived(order._id)} disabled={busy}>
              <CheckCircle2 size={17} /> Mark COD Received
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
