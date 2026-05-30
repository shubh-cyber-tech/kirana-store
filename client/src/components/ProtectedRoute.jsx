import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../api/axios.js";
import { logout, setUser } from "../store/authSlice.js";

export default function ProtectedRoute({ role }) {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => dispatch(setUser(data.user)))
      .catch(() => dispatch(logout()))
      .finally(() => setChecking(false));
  }, [dispatch, token]);

  if (checking) return <section className="container-page py-10">Checking account access...</section>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
