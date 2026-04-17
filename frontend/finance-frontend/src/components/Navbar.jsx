import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-700 hover:bg-slate-100"
  }`;

function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-900">Finance Tracker</h1>
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          ) : null}
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
