
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../Components/Navbar/AdminSidebar";
import DashboardHeader from "../Components/HeaderDash/HeaderDash";

export default function AdminLayout() {
  const { i18n } = useTranslation();

  const isArabic = i18n.language?.startsWith("ar");
  const direction = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = isArabic ? "ar" : "en";
    document.documentElement.dir = direction;
  }, [isArabic, direction]);

  return (
    <div
      dir={direction}
      className="min-h-screen w-full overflow-x-hidden bg-gray-100"
    >
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main
        dir={direction}
        className={`min-h-screen min-w-0 ${
          isArabic ? "lg:mr-[280px]" : "lg:ml-[280px]"
        }`}
      >
        {/* Fixed Header */}
        <DashboardHeader />

        {/* Page Content */}
        <div dir={direction} className="p-4 pt-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
