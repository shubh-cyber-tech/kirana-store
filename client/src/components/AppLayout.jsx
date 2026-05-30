import { Outlet, Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, Mail, MapPin, Moon, Phone, ShoppingBasket, Sun } from "lucide-react";
import { logout } from "../store/authSlice.js";
import { toggleDark } from "../store/uiSlice.js";

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-green-100 text-green-800 dark:bg-green-900" : "text-slate-700 hover:bg-green-50 dark:text-slate-200 dark:hover:bg-slate-900"}`;

export default function AppLayout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dark } = useSelector((state) => state.ui);

  const handleLogout = () => {
    const shouldLogout = window.confirm("Do you want to log out?");
    if (!shouldLogout) return;

    dispatch(logout());
  };

  return (
    <div className="min-h-screen">
      <div className="hidden border-b border-green-100 bg-green-950 py-2 text-sm text-green-50 md:block">
        <div className="container-page flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <a className="inline-flex items-center gap-2 hover:text-orange-200" href="tel:+919719165106"><Phone size={14} /> +91 9719165106</a>
            <a className="inline-flex items-center gap-2 hover:text-orange-200" href="mailto:bhardwajshubhankit@gmail.com"><Mail size={14} /> bhardwajshubhankit@gmail.com</a>
          </div>
          <span className="inline-flex items-center gap-2"><MapPin size={14} /> Sadar Chauraha, Bewar, Mainpuri, UP 205301</span>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-green-100 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="container-page flex min-h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-green-900 dark:text-green-100">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-leaf text-white">
              <ShoppingBasket size={20} />
            </span>
            <span>Shambhoo Dayal and Sons</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink className={navClass} to="/">Home</NavLink>
            {user && <NavLink className={navClass} to="/upload-slip">Place Order</NavLink>}
            {user && <NavLink className={navClass} to="/orders">Orders</NavLink>}
            {user?.role === "admin" && <NavLink className={navClass} to="/admin">Admin</NavLink>}
          </nav>
          <div className="flex items-center gap-2">
            <button className="btn-secondary px-3" onClick={() => dispatch(toggleDark())} aria-label="Toggle theme">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {user ? (
              <button className="btn-secondary px-3" onClick={handleLogout} aria-label="Logout">
                <LogOut size={17} />
              </button>
            ) : (
              <Link className="btn-primary" to="/login">Login</Link>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-green-100 bg-white px-3 py-2 shadow-soft dark:border-slate-800 dark:bg-slate-950 md:hidden">
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          <NavLink className={navClass} to="/">Home</NavLink>
          <NavLink className={navClass} to={user ? "/upload-slip" : "/login"}>Order</NavLink>
          <NavLink className={navClass} to={user ? "/orders" : "/login"}>Orders</NavLink>
          <NavLink className={navClass} to={user?.role === "admin" ? "/admin" : user ? "/dashboard" : "/login"}>
            {user?.role === "admin" ? "Admin" : "Account"}
          </NavLink>
        </div>
      </nav>
      <footer className="mt-12 border-t border-green-100 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="container-page grid gap-6 pb-14 md:grid-cols-4 md:pb-0">
          <div>
            <p className="font-bold text-green-900 dark:text-green-100">Shambhoo Dayal and Sons</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Fresh groceries, reliable billing, and fast local delivery.</p>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Store Hours</p>
            <p>7:00 AM - 10:00 PM, all days</p>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Contact</p>
            <p>Phone: +91 9719165106</p>
            <p>Email: bhardwajshubhankit@gmail.com</p>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Address</p>
            <p>Sadar Chauraha, Bewar</p>
            <p>Mainpuri, UP 205301</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
