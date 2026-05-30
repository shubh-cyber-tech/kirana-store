import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/axios.js";

export default function Payment() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order));
  }, [id]);

  const pay = async () => {
    const { data } = await api.post(`/payments/razorpay/${id}`);
    const options = {
      key: data.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.razorpayOrder.amount,
      currency: "INR",
      name: "Shambhoo Dayal and Sons",
      description: `Order ${id.slice(-8)}`,
      order_id: data.razorpayOrder.id,
      handler: async (response) => {
        await api.post("/payments/razorpay/verify", response);
        toast.success("Payment successful");
        navigate(`/orders/${id}`);
      },
      theme: { color: "#15803d" }
    };
    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", () => toast.error("Payment failed"));
    razorpay.open();
  };

  if (!order) return <section className="container-page py-10">Loading payment...</section>;

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-10">
      <div className="panel w-full max-w-lg p-6">
        <h1 className="text-2xl font-bold">Payment</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Pay securely using UPI, card, net banking, or wallet through Razorpay.</p>
        <p className="mt-6 text-4xl font-black">Rs. {order.invoice?.amount}</p>
        <button className="btn-primary mt-6 w-full" onClick={pay}>Pay Now</button>
      </div>
    </section>
  );
}
