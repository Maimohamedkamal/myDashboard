import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiTag,
  FiShoppingBag,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiPercent,
  FiStar,
} from "react-icons/fi";

const menuItems = [
  { title: "Dashboard", titleAr: "لوحة التحكم", path: "/home", icon: FiGrid, end: true },
  { title: "Products", titleAr: "المنتجات", path: "/admin/products", icon: FiPackage },
  { title: "Categories", titleAr: "التصنيفات", path: "/admin/categories", icon: FiTag },
  { title: "Orders", titleAr: "الطلبات", path: "/admin/orders", icon: FiShoppingBag },
  { title: "Customers", titleAr: "العملاء", path: "/admin/customers", icon: FiUsers },
  { title: "Customers Reviews", titleAr: "تقييمات العملاء", path: "/admin/customersReview", icon: FiStar },
  { title: "Coupons", titleAr: "الكوبونات", path: "/admin/coupons", icon: FiPercent },
  { title: "Banners", titleAr: "البانرات", path: "/admin/banners", icon: FiBarChart2 },
];

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isArabic = localStorage.getItem("language") === "ar";
  const text = (en, ar) => (isArabic ? ar : en);

  // Close mobile sidebar after navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close with Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
      isActive
        ? "bg-[#D4AF6A]/20 font-semibold text-gray-950"
        : "text-gray-700 hover:bg-gray-100 hover:text-black"
    }`;

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        className={`fixed top-4 z-[100] flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-900 shadow-md transition hover:bg-gray-100 lg:hidden ${
          isArabic ? "right-4" : "left-4"
        }`}
      >
        <FiMenu size={22} />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
   <aside
  dir={isArabic ? "rtl" : "ltr"}
  className={`
    fixed top-0 bottom-0 z-[120]
    flex h-screen w-[280px] max-w-[85vw] flex-col
    overflow-hidden border-gray-200 bg-white
    text-gray-900 shadow-xl transition-transform duration-300 ease-in-out
    ${isArabic ? "right-0 border-l" : "left-0 border-r"}
    ${
      mobileOpen
        ? "translate-x-0"
        : isArabic
          ? "translate-x-full"
          : "-translate-x-full"
    }
    lg:translate-x-0 lg:shadow-none
  `}
>
        {/* SIDEBAR HEADER */}
        <div className="shrink-0 px-3 pb-3 pt-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF6A]/20">
                <FiUsers size={20} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {text("Store Administrator", "مدير المتجر")}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {text("Oud Elite Store", "متجر نخبة العود")}
                </p>
              </div>
            </div>

            {/* MOBILE CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="min-h-0 flex-1  px-3">
            
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            {text("WORKSPACE", "مساحة العمل")}
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={linkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className={`absolute bottom-2 top-2 w-[3px] rounded-full bg-[#D4AF6A] ${
                            isArabic ? "right-0" : "left-0"
                          }`}
                        />
                      )}

                      <Icon
                        size={19}
                        className={`shrink-0 ${
                          isActive ? "text-gray-950" : "text-gray-500"
                        }`}
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {text(item.title, item.titleAr)}
                      </span>

                      {isActive && (
                        <FiChevronLeft
                          size={15}
                          className={`shrink-0 text-gray-500 ${
                            isArabic ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* SETTINGS AND LOGOUT */}
        <div className="shrink-0 border-t border-gray-200 bg-gray-50/70 p-3">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            {text("PREFERENCES", "التفضيلات")}
          </p>

          <NavLink
            to="/admin/settings"
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            <FiSettings size={19} />
            <span>{text("Settings", "الإعدادات")}</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-700 transition hover:bg-red-50 hover:text-red-600"
          >
            <FiLogOut size={19} />
            <span>{text("Sign Out", "تسجيل الخروج")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
