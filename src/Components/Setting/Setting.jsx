
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  FiSettings,
  FiGlobe,
  FiCheck,
  FiRefreshCw,
  FiSave,
  FiEdit2,
  FiX,
  FiShield,
  FiSearch,
  FiInfo,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  Accept: "application/json",
  ...(getToken()
    ? { Authorization: `Bearer ${getToken()}` }
    : {}),
});

const getErrorMessage = (error, isArabic) => {
  const message = error.response?.data?.message;

  if (typeof message === "string") return message;

  if (Array.isArray(message)) return message.join(", ");

  return isArabic
    ? "حدث خطأ. يرجى المحاولة مرة أخرى."
    : "Something went wrong. Please try again.";
};

function normalizeSettings(responseData) {
  const data = responseData?.data ?? responseData;
  const raw = data?.settings ?? data;

  if (Array.isArray(raw)) {
    return raw.map((item, index) => ({
      ...item,
      id: item.id ?? index,
      key:
        item.key ??
        item.name ??
        item.setting_key ??
        item.slug ??
        `setting_${index}`,
      value:
        item.value ??
        item.setting_value ??
        "",
    }));
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw).map(([key, value], index) => ({
      id: index,
      key,
      value:
        value !== null && typeof value === "object"
          ? JSON.stringify(value)
          : String(value ?? ""),
    }));
  }

  return [];
}

export default function Setting() {
  const { t, i18n } = useTranslation();

  const [settings, setSettings] = useState([]);
  const [originalSettings, setOriginalSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");

  const language =
    i18n.resolvedLanguage ||
    i18n.language ||
    localStorage.getItem("language") ||
    "en";

  const isArabic = language.startsWith("ar");

  const tr = (key, english, arabic) =>
    t(`settings.${key}`, {
      defaultValue: isArabic ? arabic : english,
    });

  // Update document direction
  useEffect(() => {
    document.documentElement.lang = isArabic ? "ar" : "en";
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [isArabic]);

  // Get settings
  const getSettings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/settings`,
        { headers: getHeaders() }
      );

      console.log("GET settings:", response.data);

      const normalized = normalizeSettings(response.data);

      setSettings(normalized);
      setOriginalSettings(
        normalized.map((item) => ({ ...item }))
      );
    } catch (error) {
      console.error(
        "Get settings error:",
        error.response?.data || error
      );

      toast.error(getErrorMessage(error, isArabic));
    } finally {
      setLoading(false);
    }
  }, [isArabic]);

  useEffect(() => {
    getSettings();
  }, [getSettings]);

  // Change application language
  const changeLanguage = async (nextLanguage) => {
    if (nextLanguage === (isArabic ? "ar" : "en")) return;

    try {
      await i18n.changeLanguage(nextLanguage);

      localStorage.setItem("language", nextLanguage);

      document.documentElement.lang = nextLanguage;
      document.documentElement.dir =
        nextLanguage === "ar" ? "rtl" : "ltr";

      toast.success(
        nextLanguage === "ar"
          ? "تم تغيير اللغة بنجاح"
          : "Language changed successfully"
      );
    } catch {
      toast.error(
        isArabic
          ? "تعذر تغيير اللغة"
          : "Could not change language"
      );
    }
  };

  // Update a setting value locally
  const updateField = (index, value) => {
    setSettings((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, value } : item
      )
    );
  };

  // Cancel editing
  const cancelEditing = () => {
    setSettings(
      originalSettings.map((item) => ({ ...item }))
    );
    setEditing(false);
    setSearch("");
  };

  // Update settings
  const updateSettings = async () => {
    try {
      setSaving(true);

      // Match this payload to your API documentation if necessary.
      const payload = {
        settings: settings.map((item) => ({
          key: item.key,
          value: item.value,
        })),
      };

      console.log("PUT settings payload:", payload);

      const response = await axios.put(
        `${API_URL}/settings`,
        payload,
        {
          headers: {
            ...getHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      console.log("PUT settings response:", response.data);

      toast.success(
        response.data?.message ||
          (isArabic
            ? "تم تحديث الإعدادات بنجاح"
            : "Settings updated successfully")
      );

      setEditing(false);
      setSearch("");

      await getSettings();
    } catch (error) {
      console.error(
        "Update settings error:",
        error.response?.data || error
      );

      toast.error(getErrorMessage(error, isArabic));
    } finally {
      setSaving(false);
    }
  };

  const filteredSettings = settings.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      String(item.key ?? "").toLowerCase().includes(query) ||
      String(item.value ?? "").toLowerCase().includes(query)
    );
  });

  const isDirty =
    JSON.stringify(
      settings.map(({ key, value }) => ({ key, value }))
    ) !==
    JSON.stringify(
      originalSettings.map(({ key, value }) => ({
        key,
        value,
      }))
    );

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-gray-100 p-4 text-gray-500 sm:p-6 lg:p-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-500 text-white shadow-sm">
              <FiSettings size={24} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">
                OUD ELITE / ADMIN
              </p>

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {tr("title", "Settings", "الإعدادات")}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {tr(
                  "subtitle",
                  "Manage your application preferences",
                  "إدارة إعدادات وتفضيلات التطبيق"
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={getSettings}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:self-auto"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
              size={16}
            />
            {tr("refresh", "Refresh", "تحديث")}
          </button>
        </header>

        {/* Intro banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gray-500 p-5 text-white sm:p-7">
          <div className="absolute -end-12 -top-16 h-52 w-52 rounded-full border border-white/10" />
          <div className="absolute -end-4 -top-8 h-36 w-36 rounded-full border border-white/10" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <FiShield size={22} />
            </div>

            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold sm:text-xl">
                {tr(
                  "welcome",
                  "Application preferences",
                  "تفضيلات التطبيق"
                )}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-300">
                {tr(
                  "welcomeDescription",
                  "Manage application settings and select your preferred dashboard language.",
                  "تحكمي في إعدادات التطبيق واختاري اللغة المناسبة للوحة التحكم."
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Language Card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <FiGlobe size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {tr(
                  "languageTitle",
                  "Language",
                  "اللغة"
                )}
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                {tr(
                  "languageDescription",
                  "Choose the language used throughout the interface.",
                  "اختاري اللغة المستخدمة في واجهة التطبيق."
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => changeLanguage("en")}
              aria-pressed={!isArabic}
              className={`flex min-h-20 items-center justify-between gap-3 rounded-xl border p-4 text-start transition ${
                !isArabic
                  ? "border-gray-500 bg-gray-100 ring-1 ring-gray-500"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇬🇧</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    English
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Left to right · LTR
                  </p>
                </div>
              </div>

              {!isArabic && (
                <FiCheck
                  size={20}
                  className="shrink-0 text-gray-500"
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => changeLanguage("ar")}
              aria-pressed={isArabic}
              className={`flex min-h-20 items-center justify-between gap-3 rounded-xl border p-4 text-start transition ${
                isArabic
                  ? "border-gray-500 bg-gray-100 ring-1 ring-gray-500"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇪🇬</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    العربية
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    من اليمين إلى اليسار · RTL
                  </p>
                </div>
              </div>

              {isArabic && (
                <FiCheck
                  size={20}
                  className="shrink-0 text-gray-800"
                />
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4">
            <span className="text-sm text-gray-600">
              {tr(
                "currentLanguage",
                "Current language",
                "اللغة الحالية"
              )}
            </span>

            <span className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-semibold text-white">
              {isArabic ? "العربية · RTL" : "English · LTR"}
            </span>
          </div>
        </section>

        {/* API Settings */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {tr(
                  "apiTitle",
                  "Application Settings",
                  "إعدادات التطبيق"
                )}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {tr(
                  "apiDescription",
                  "Settings retrieved from the server",
                  "الإعدادات التي تم جلبها من الخادم"
                )}
              </p>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={loading || settings.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiEdit2 size={16} />
                {tr("edit", "Edit settings", "تعديل الإعدادات")}
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <FiX size={16} />
                  {tr("cancel", "Cancel", "إلغاء")}
                </button>

                <button
                  type="button"
                  onClick={updateSettings}
                  disabled={saving || !isDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <FiRefreshCw
                      className="animate-spin"
                      size={16}
                    />
                  ) : (
                    <FiSave size={16} />
                  )}

                  {saving
                    ? tr("saving", "Saving...", "جارٍ الحفظ...")
                    : tr("save", "Save changes", "حفظ التغييرات")}
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="border-b border-gray-100 p-4 sm:px-6">
            <div className="relative max-w-lg">
              <FiSearch
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                  isArabic ? "right-3" : "left-3"
                }`}
                size={18}
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={tr(
                  "search",
                  "Search settings...",
                  "ابحثي في الإعدادات..."
                )}
                className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm outline-none transition focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-200 ${
                  isArabic ? "pr-10 pl-4" : "pl-10 pr-4"
                }`}
              />
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-gray-500">
              <FiRefreshCw
                className="animate-spin"
                size={25}
              />
              <p className="text-sm">
                {tr(
                  "loading",
                  "Loading settings...",
                  "جارٍ تحميل الإعدادات..."
                )}
              </p>
            </div>
          ) : settings.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <FiInfo size={22} />
              </div>

              <p className="mt-3 font-semibold text-gray-800">
                {tr(
                  "emptyTitle",
                  "No settings found",
                  "لا توجد إعدادات"
                )}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {tr(
                  "emptyDescription",
                  "The API returned no settings.",
                  "لم يُرجع الخادم أي إعدادات."
                )}
              </p>
            </div>
          ) : filteredSettings.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              {tr(
                "noResults",
                "No matching settings found.",
                "لا توجد إعدادات مطابقة للبحث."
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full table-fixed text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="w-16 px-4 py-4 text-center font-semibold">
                        #
                      </th>
                      <th className="w-1/3 break-words px-4 py-4 text-start font-semibold">
                        {tr("key", "Setting", "الإعداد")}
                      </th>
                      <th className="px-4 py-4 text-start font-semibold">
                        {tr("value", "Value", "القيمة")}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredSettings.map((item, index) => {
                      const actualIndex = settings.findIndex(
                        (setting) => setting.id === item.id
                      );

                      return (
                        <tr
                          key={`${item.key}-${index}`}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 text-center text-gray-400">
                            {index + 1}
                          </td>

                          <td className="break-words px-4 py-4 font-medium text-gray-800">
                            {item.key}
                          </td>

                          <td className="break-words px-4 py-4">
                            {editing ? (
                              <textarea
                                rows={2}
                                value={String(item.value ?? "")}
                                onChange={(event) =>
                                  updateField(
                                    actualIndex,
                                    event.target.value
                                  )
                                }
                                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
                              />
                            ) : (
                              <span className="whitespace-pre-wrap text-gray-600">
                                {String(item.value ?? "—")}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredSettings.map((item, index) => {
                  const actualIndex = settings.findIndex(
                    (setting) => setting.id === item.id
                  );

                  return (
                    <article
                      key={`${item.key}-${index}`}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">
                            {tr("key", "Setting", "الإعداد")} #
                            {index + 1}
                          </p>

                          <h3 className="mt-1 break-words font-semibold text-gray-800">
                            {item.key}
                          </h3>
                        </div>

                        <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500">
                          {index + 1}
                        </span>
                      </div>

                      {editing ? (
                        <textarea
                          rows={3}
                          value={String(item.value ?? "")}
                          onChange={(event) =>
                            updateField(
                              actualIndex,
                              event.target.value
                            )
                          }
                          className="w-full resize-y rounded-xl border border-gray-300 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-gray-600 focus:bg-white focus:ring-2 focus:ring-gray-200"
                        />
                      ) : (
                        <div className="break-words rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600">
                          {String(item.value ?? "—")}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              {editing && (
                <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-xs text-gray-500">
                    {tr(
                      "editNotice",
                      "Remember to save your changes.",
                      "تذكري حفظ التغييرات بعد الانتهاء."
                    )}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 sm:flex-none"
                    >
                      {tr("cancel", "Cancel", "إلغاء")}
                    </button>

                    <button
                      type="button"
                      onClick={updateSettings}
                      disabled={saving || !isDirty}
                      className="flex-1 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    >
                      {saving
                        ? tr("saving", "Saving...", "جارٍ الحفظ...")
                        : tr("save", "Save changes", "حفظ التغييرات")}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-gray-200 pt-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Oud Elite.{" "}
            {tr(
              "rights",
              "All rights reserved.",
              "جميع الحقوق محفوظة."
            )}
          </p>

          <p>
            {tr(
              "footer",
              "Admin settings",
              "إعدادات المسؤول"
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
