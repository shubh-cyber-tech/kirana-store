import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Send } from "lucide-react";
import { api } from "../api/axios.js";
import { getSocket } from "../api/socket.js";

export default function Chat() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    api.get(`/chats/orders/${id}`).then(({ data }) => setMessages(data.chat.messages || []));
    const socket = getSocket();
    socket?.emit("order:join", id);
    const onMessage = ({ order, message }) => {
      if (order === id) setMessages((items) => [...items, message]);
    };
    socket?.on("chat:message", onMessage);
    return () => socket?.off("chat:message", onMessage);
  }, [id]);

  const send = (event) => {
    event.preventDefault();
    if (!body.trim()) return;
    getSocket()?.emit("chat:send", { orderId: id, body });
    setBody("");
  };

  return (
    <section className="container-page py-10">
      <div className="panel mx-auto max-w-3xl overflow-hidden">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h1 className="text-2xl font-bold">Order Chat</h1>
        </div>
        <div className="h-[55vh] space-y-3 overflow-y-auto p-5">
          {messages.map((message) => {
            const mine = (message.sender?._id || message.sender) === user.id;
            return (
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`} key={message._id || message.createdAt}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${mine ? "bg-leaf text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                  <p className="text-sm">{message.body}</p>
                  <p className="mt-1 text-[11px] opacity-70">{message.sender?.name || "User"}</p>
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={send} className="flex gap-3 border-t border-slate-200 p-4 dark:border-slate-800">
          <input className="field" placeholder="Type a message" value={body} onChange={(e) => setBody(e.target.value)} />
          <button className="btn-primary px-3"><Send size={18} /></button>
        </form>
      </div>
    </section>
  );
}
