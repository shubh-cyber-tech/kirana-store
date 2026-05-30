import { CheckCircle2, Circle } from "lucide-react";

const statuses = [
  "Order Placed",
  "Slip Under Review",
  "Bill Generated",
  "Payment Pending",
  "Payment Completed",
  "Order Packed",
  "Order Dispatched",
  "Out for Delivery",
  "Order Delivered"
];

export default function OrderTimeline({ order }) {
  const index = statuses.indexOf(order?.status);
  const timeline = order?.timeline || [];

  return (
    <div className="space-y-3">
      <div className="h-2 overflow-hidden rounded-full bg-green-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-saffron transition-all" style={{ width: `${Math.max(8, ((index + 1) / statuses.length) * 100)}%` }} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {statuses.map((status, i) => {
          const done = i <= index;
          const entry = timeline.find((item) => item.status === status);
          return (
            <div key={status} className={`rounded-lg border p-3 ${done ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"}`}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {done ? <CheckCircle2 className="text-leaf" size={18} /> : <Circle className="text-slate-400" size={18} />}
                {status}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {entry?.at ? new Date(entry.at).toLocaleString() : "Awaiting update"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
