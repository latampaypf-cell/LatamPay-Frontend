import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  CreditCard,
  Settings,
  CircleUser,
} from "lucide-react";
import logoLatamPay from "../../assets/Logo.svg";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { ReceiveModal } from "../receiveModal/ReceiveModal";
import { paths } from "../../routes/paths";
import { privateNavItems } from "../../routes/nav";
import type { NavItem } from "../../routes/nav";

export type PrivateNavbarProps = {
  items?: NavItem[];
  brand?: string;
};

export function PrivateNavbar({
  items = privateNavItems,
  brand = "LatamPay",
}: PrivateNavbarProps) {
  const { user, logout } = useAuth();
  const { cbu, alias } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCbuModalOpen, setIsCbuModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isUserMenuOpen]);

  const openCbuModal = () => {
    setIsUserMenuOpen(false);
    closeMenu();
    setIsCbuModalOpen(true);
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-slate-950">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to={paths.dashboard}
          onClick={closeMenu}
          className="flex items-center"
          aria-label={brand}
        >
          <img
            src={logoLatamPay}
            alt={brand}
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `transition-colors ${isActive ? "text-cyan-400" : "text-slate-300 hover:text-white"}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop user */}
        <div className="hidden items-center gap-4 md:flex">
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 transition-all hover:bg-white/5 hover:text-white"
            >
               <CircleUser
    size={20}
    className="text-cyan-400"
  />
              
              <ChevronDown
                size={16}
                className={`transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isUserMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-lg backdrop-blur-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={openCbuModal}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5 hover:text-cyan-400"
                >
                  <CreditCard size={16} />
                  Mi CBU
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5 hover:text-cyan-400"
                >
                  <Settings size={16} />
                  Configuración
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition-all hover:border-red-500/30 hover:text-red-400"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="text-white md:hidden"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col p-6">
            {items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block py-3 ${isActive ? "text-cyan-400" : "text-slate-300"}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 p-6 pt-0">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <button
              type="button"
              onClick={openCbuModal}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300"
            >
              <CreditCard size={16} />
              Mi CBU
            </button>
            <button
              type="button"
              onClick={closeMenu}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300"
            >
              <Settings size={16} />
              Configuración
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 py-3 text-sm text-red-400"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <ReceiveModal
        open={isCbuModalOpen}
        onClose={() => setIsCbuModalOpen(false)}
        alias={alias ?? undefined}
        cbu={cbu ?? undefined}
        title="Mi CBU"
        subtitle="Tus datos para recibir transferencias."
      />
    </nav>
  );
}

export default PrivateNavbar;
