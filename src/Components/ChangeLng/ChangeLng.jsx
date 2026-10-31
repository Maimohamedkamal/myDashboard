
import React from "react";
import { useTranslation } from "react-i18next";
import { FiGlobe } from "react-icons/fi";

export default function LanguageButton() {
  const { i18n } = useTranslation();

  const isArabic = (
    i18n.resolvedLanguage || i18n.language || "en"
  ).startsWith("ar");

  const handleLanguageChange = async () => {
    const newLanguage = isArabic ? "en" : "ar";

    await i18n.changeLanguage(newLanguage);

    localStorage.setItem("language", newLanguage);

    document.documentElement.lang = newLanguage;
    document.documentElement.dir =
      newLanguage === "ar" ? "rtl" : "ltr";
  };

  return (
    <button
      type="button"
      onClick={handleLanguageChange}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
      aria-label={isArabic ? "Change language to English" : "تغيير اللغة إلى العربية"}
    >
      <FiGlobe size={18} />
      {isArabic ? "English" : "العربية"}
    </button>
  );
}
