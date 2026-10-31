import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  FiGlobe,
  FiUser,
  FiChevronDown,
  FiShield,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";
const DEFAULT_LOGO = "/logo.png";

export default function DashboardHeader({
  logoSrc = DEFAULT_LOGO,
  brandNameEn = "Oud Elite",
  brandNameAr = "نخبة العود",
}) {
  const { i18n } = useTranslation();

  const isArabic = i18n.language?.startsWith("ar");

  const [adminInfo, setAdminInfo] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [logoFailed, setLogoFailed] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const token = localStorage.getItem("token");

  const tr = (en, ar) => (isArabic ? ar : en);
  const brandName = isArabic ? brandNameAr : brandNameEn;

  useEffect(() => {
    let active = true;

    const getAdminInfo = async () => {
      if (!token) {
        setProfileLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!active) return;

        const data = response?.data?.data;
        setAdminInfo(data?.user || data?.admin || data || {});
      } catch (error) {
        console.error("Admin profile error:", error);
      } finally {
        if (active) setProfileLoading(false);
      }
    };

    getAdminInfo();

    return () => {
      active = false;
    };
  }, [token]);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);

    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";

    setLanguageOpen(false);
  };

  const adminName =
    adminInfo?.name ||
    adminInfo?.full_name ||
    adminInfo?.username ||
    tr("Administrator", "المسؤول");

  return (
<header className={`fixed top-0 z-40 w-full p-2 border-b border-gray-200 bg-white shadow-sm ${
  isArabic
    ? "left-0 lg:left-auto lg:right-[280px] lg:w-[calc(100%-280px)]"
    : "right-0 lg:w-[calc(100%-280px)]"
}`}>      <div className="flex min-h-[72px] items-center justify-between gap-2 px-3 py-2 sm:px-5 lg:px-6">

        {/* LOGO AND BRAND */}
        <div className={`flex min-w-0 items-center gap-2 sm:gap-3 ${
          isArabic ? "flex-row" : "flex-row"
        }`}>

          {logoSrc && !logoFailed ? (
            <img
              src={logoSrc}
              alt={brandName}
              onError={() => setLogoFailed(true)}
              className="h-9 w-9 shrink-0 rounded-lg border border-gray-100 object-contain p-1 sm:h-12 sm:w-12"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D4AF6A]/20 font-bold sm:h-12 sm:w-12">
              O
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold text-gray-900 sm:text-xl lg:text-2xl">
              {brandName}
            </h1>

            <p className="mt-0.5 hidden items-center gap-2 text-xs text-gray-500 sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {tr("Administration Portal", "بوابة إدارة المتجر")}
            </p>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* LANGUAGE */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen((prev) => !prev)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-2 text-xs font-semibold text-gray-700 transition hover:border-[#D4AF6A] hover:bg-yellow-50 sm:h-11 sm:gap-2 sm:px-3 sm:text-sm"
            >
              <FiGlobe size={16} />
              <span>{isArabic ? "العربية" : "EN"}</span>
              <FiChevronDown size={13} />
            </button>

            {languageOpen && (
              <div className="absolute end-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => changeLanguage("en")}
                  className="w-full rounded-lg px-3 py-2.5 text-start text-sm text-gray-700 hover:bg-gray-50"
                >
                  English
                </button>

                <button
                  type="button"
                  onClick={() => changeLanguage("ar")}
                  className="w-full rounded-lg px-3 py-2.5 text-start text-sm text-gray-700 hover:bg-gray-50"
                >
                  العربية
                </button>
              </div>
            )}
          </div>

          {/* ADMIN PROFILE */}
          {token ? (
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1.5 sm:gap-3 sm:px-3 sm:py-2">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4AF6A]/20 sm:h-9 sm:w-9">
                <FiUser size={17} />
              </div>

              <div className="hidden min-w-0 sm:block">
                <p className="max-w-36 truncate text-sm font-bold text-gray-900">
                  {profileLoading
                    ? tr("Loading...", "جاري التحميل...")
                    : adminName}
                </p>

                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <FiShield size={11} />
                  {tr("Administrator", "مدير النظام")}
                </p>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700"
            >
              <FiUser size={18} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
