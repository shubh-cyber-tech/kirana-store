import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import UploadSlip from "./pages/UploadSlip.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import Payment from "./pages/Payment.jsx";
import Chat from "./pages/Chat.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <CustomerDashboard /> },
          { path: "/upload-slip", element: <UploadSlip /> },
          { path: "/orders", element: <Orders /> },
          { path: "/orders/:id", element: <OrderDetails /> },
          { path: "/orders/:id/payment", element: <Payment /> },
          { path: "/orders/:id/chat", element: <Chat /> }
        ]
      },
      {
        element: <ProtectedRoute role="admin" />,
        children: [
          { path: "/admin", element: <AdminDashboard /> },
          { path: "/admin/orders", element: <AdminOrders /> }
        ]
      },
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);
