
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiEdit,
  FiGlobe,
  FiCheckCircle,
} from "react-icons/fi";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  Accept: "application/json",
});

const parseValue = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// Convert API response into editable rows.
// Each row keeps its original group and field names.
const normalizeSettings = (responseData) => {
  let source = responseData?.data ?? responseData;

  if (source?.settings) {
    source = source.settings;
  }

  if (Array.isArray(source)) {
    const result = [];

    source.forEach((group) => {
      if (!group || typeof group !== "object") return;

      const groupKey = group.key ?? group.group ?? group.name;
      if (!groupKey) return;

      const parsedValue = parseValue(group.value);

      if (
        parsedValue &&
        typeof parsedValue === "object" &&
        !Array.isArray(parsedValue)
      ) {
        Object.entries(parsedValue).forEach(([fieldKey, fieldValue]) => {
          result.push({
            id: `${groupKey}_${fieldKey}`,
            groupKey,
            fieldKey,
            key: fieldKey,
            value:
              fieldValue === null || fieldValue === undefined
                ? ""
                : String(fieldValue),
          });
        });
      } else {
        result.push({
          id: String(groupKey),
          groupKey,
          fieldKey: "value",
          key: "value",
          value:
            parsedValue === null || parsedValue === undefined
              ? ""
              : String(parsedValue),
        });
      }
    });

    return result;
  }

  if (source && typeof source === "object") {
    const result = [];

    Object.entries(source).forEach(([groupKey, rawValue]) => {
      const parsedValue = parseValue(rawValue);

      if (
        parsedValue &&
        typeof parsedValue === "object" &&
        !Array.isArray(parsedValue)
      ) {
        Object.entries(parsedValue).forEach(([fieldKey, fieldValue]) => {
          result.push({
            id: `${groupKey}_${fieldKey}`,
            groupKey,
            fieldKey,
            key: fieldKey,
            value:
              fieldValue === null || fieldValue === undefined
                ? ""
                : String(fieldValue),
          });
        });
      } else {
        result.push({
          id: String(groupKey),
          groupKey,
          fieldKey: "value",
          key: "value",
          value:
            parsedValue === null || parsedValue === undefined
              ? ""
              : String(parsedValue),
        });
      }
    });

    return result;
  }

  return [];
};

const groupLabels = {
  contact: "Contact Information",
  general: "General Settings",
  seo: "SEO Settings",
  social: "Social Media",
  store: "Store Settings",
};

const fieldLabels = {
  whatsapp_phone: "WhatsApp Phone",
  support_email: "Support Email",
  address_ar: "Address Arabic",
  address_en: "Address English",
  site_name_ar: "Website Name Arabic",
  site_name_en: "Website Name English",
  site_logo: "Website Logo",
  site_favicon: "Website Favicon",
  meta_title_ar: "Meta Title Arabic",
  meta_desc_ar: "Meta Description Arabic",
  meta_title_en: "Meta Title English",
  meta_desc_en: "Meta Description English",
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "Twitter",
  snapchat: "Snapchat",
  tiktok: "TikTok",
  currency: "Currency",
  tax_rate: "Tax Rate",
};

export default function Setting() {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language?.startsWith("ar");

  const [settings, setSettings] = useState([]);
  const [originalSettings, setOriginalSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);

  const text = {
    title: isArabic ? "إعدادات الموقع" : "Website Settings",
    subtitle: isArabic
      ? "إدارة وتحديث إعدادات المتجر"
      : "Manage and update your store settings",
    search: isArabic ? "ابحث في الإعدادات..." : "Search settings...",
    save: isArabic ? "حفظ التغييرات" : "Save Changes",
    cancel: isArabic ? "إلغاء" : "Cancel",
    edit: isArabic ? "تعديل الإعدادات" : "Edit Settings",
    refresh: isArabic ? "تحديث" : "Refresh",
    loading: isArabic ? "جاري تحميل الإعدادات..." : "Loading settings...",
    empty: isArabic ? "لا توجد إعدادات" : "No settings found",
    field: isArabic ? "الإعداد" : "Setting",
    value: isArabic ? "القيمة" : "Value",
    group: isArabic ? "القسم" : "Group",
    success: isArabic
      ? "تم تحديث الإعدادات بنجاح"
      : "Settings updated successfully",
    loadError: isArabic
      ? "فشل تحميل الإعدادات"
      : "Failed to load settings",
    saveError: isArabic
      ? "فشل تحديث الإعدادات"
      : "Failed to update settings",
    noChanges: isArabic ? "لا توجد تغييرات" : "No changes to save",
    welcome: isArabic
      ? "مرحباً بك في إعدادات المتجر"
      : "Welcome to your store settings",
    language: isArabic ? "اللغة الحالية" : "Current language",
  };

  const getErrorMessage = (error) => {
    const serverMessage = error.response?.data?.message;

    if (serverMessage) return serverMessage;

    return error.message || text.saveError;
  };

  const normalizeResponse = useCallback((data) => {
    return normalizeSettings(data);
  }, []);

  // Fetch settings
  const getSettings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/settings`, {
        headers: getHeaders(),
      });

      console.log("GET SETTINGS RESPONSE:", response.data);

      const normalized = normalizeResponse(response.data);

      setSettings(normalized);
      setOriginalSettings(normalized);
    } catch (error) {
      console.error("GET SETTINGS ERROR:", error);
      console.error("SERVER RESPONSE:", error.response?.data);

      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [normalizeResponse]);

  useEffect(() => {
    getSettings();
  }, [getSettings]);

  // Detect changes
  const isDirty = useMemo(() => {
    if (settings.length !== originalSettings.length) return true;

    return settings.some((item) => {
      const original = originalSettings.find(
        (oldItem) =>
          oldItem.groupKey === item.groupKey &&
          oldItem.fieldKey === item.fieldKey
      );

      return !original || original.value !== item.value;
    });
  }, [settings, originalSettings]);

  // Update a field
  const updateField = (id, value) => {
    setSettings((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, value } : item
      )
    );
  };

  // Cancel changes
  const cancelEditing = () => {
    setSettings(originalSettings);
    setEditing(false);
    setSearch("");
  };

  // Build grouped payload
  const buildPayload = () => {
    const groupedSettings = {};

    settings.forEach((item) => {
      if (!item.groupKey || !item.fieldKey) return;

      if (!groupedSettings[item.groupKey]) {
        groupedSettings[item.groupKey] = {};
      }

      groupedSettings[item.groupKey][item.fieldKey] = item.value;
    });

    return {
      settings: Object.entries(groupedSettings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
      })),
    };
  };

  // Save settings
  const updateSettings = async () => {
    if (!isDirty) {
      toast(text.noChanges);
      return;
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      console.log("PUT SETTINGS PAYLOAD:", payload);

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

      console.log("UPDATE SETTINGS RESPONSE:", response.data);

      if (response.data?.success === false) {
        throw new Error(
          response.data?.message || text.saveError
        );
      }

      toast.success(response.data?.message || text.success);

      await getSettings();
      setEditing(false);
    } catch (error) {
      console.error("UPDATE SETTINGS ERROR:", error);
      console.error("SERVER RESPONSE:", error.response?.data);
      console.error("REQUEST PAYLOAD:", buildPayload());

      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  // Search
  const filteredSettings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return settings
      .map((item) => item)
      .filter((item) => {
        if (!query) return true;

        const groupName =
          groupLabels[item.groupKey] || item.groupKey;

        const fieldName =
          fieldLabels[item.fieldKey] || item.fieldKey;

        return (
          String(item.groupKey).toLowerCase().includes(query) ||
          String(item.fieldKey).toLowerCase().includes(query) ||
          String(item.value).toLowerCase().includes(query) ||
          String(groupName).toLowerCase().includes(query) ||
          String(fieldName).toLowerCase().includes(query)
        );
      });
  }, [settings, search]);

  const getGroupLabel = (groupKey) => {
    const label = groupLabels[groupKey] || groupKey;

    if (isArabic) {
      const arabicLabels = {
        contact: "معلومات التواصل",
        general: "الإعدادات العامة",
        seo: "إعدادات محركات البحث",
        social: "التواصل الاجتماعي",
        store: "إعدادات المتجر",
      };

      return arabicLabels[groupKey] || label;
    }

    return label;
  };

  const getFieldLabel = (fieldKey) => {
    if (isArabic) {
      const arabicLabels = {
        whatsapp_phone: "رقم الواتساب",
        support_email: "البريد الإلكتروني للدعم",
        address_ar: "العنوان بالعربية",
        address_en: "العنوان بالإنجليزية",
        site_name_ar: "اسم الموقع بالعربية",
        site_name_en: "اسم الموقع بالإنجليزية",
        site_logo: "شعار الموقع",
        site_favicon: "أيقونة الموقع",
        meta_title_ar: "عنوان محركات البحث بالعربية",
        meta_desc_ar: "وصف محركات البحث بالعربية",
        meta_title_en: "عنوان محركات البحث بالإنجليزية",
        meta_desc_en: "وصف محركات البحث بالإنجليزية",
        facebook: "فيسبوك",
        instagram: "إنستجرام",
        twitter: "تويتر",
        snapchat: "سناب شات",
        tiktok: "تيك توك",
        currency: "العملة",
        tax_rate: "نسبة الضريبة",
      };

      return arabicLabels[fieldKey] || fieldKey;
    }

    return fieldLabels[fieldKey] || fieldKey;
  };

  const renderInput = (item) => {
    const isLongText =
      item.fieldKey.includes("desc") ||
      item.fieldKey.includes("address");

    const isUrl =
      item.fieldKey.includes("url") ||
      [
        "facebook",
        "instagram",
        "twitter",
        "snapchat",
        "tiktok",
        "site_logo",
        "site_favicon",
      ].includes(item.fieldKey);

    return (
      <input
        type={isUrl ? "text" : "text"}
        value={item.value}
        disabled={!editing}
        onChange={(e) => updateField(item.id, e.target.value)}
        dir="auto"
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
          ${
            editing
              ? "border-amber-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }`}
        placeholder={getFieldLabel(item.fieldKey)}
      />
    );
  };

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-gray-100 p-4 sm:p-6 lg:p-8"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#171717] text-xl text-[#D4AF37]">
            <FiSettings />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {text.title}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {text.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={getSettings}
            disabled={loading || saving}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            {text.refresh}
          </button>

          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={loading || settings.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-semibold text-[#D4AF37] transition hover:bg-black disabled:opacity-50"
            >
              <FiEdit />
              {text.edit}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <FiX />
                {text.cancel}
              </button>

              <button
                type="button"
                onClick={updateSettings}
                disabled={saving || !isDirty}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-2.5 text-sm font-semibold text-[#D4AF37] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <FiRefreshCw className="animate-spin" />
                ) : (
                  <FiSave />
                )}

                {saving
                  ? isArabic
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : text.save}
              </button>
            </>
          )}
        </div>
      </div>

     
      {/* Search */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="relative">
          <FiSearch
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              isArabic ? "right-4" : "left-4"
            }`}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={text.search}
            className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white ${
              isArabic ? "pr-11 pl-4" : "pl-11 pr-4"
            }`}
          />
        </div>
      </div>

      {/* Settings */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3 text-gray-500">
            <FiRefreshCw className="animate-spin text-xl text-amber-500" />
            {text.loading}
          </div>
        </div>
      ) : filteredSettings.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
          <FiSettings className="mb-3 text-4xl" />
          <p>{text.empty}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(
            filteredSettings.reduce((groups, item) => {
              if (!groups[item.groupKey]) {
                groups[item.groupKey] = [];
              }

              groups[item.groupKey].push(item);
              return groups;
            }, {})
          ).map(([groupKey, groupItems]) => (
            <section
              key={groupKey}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg text-amber-600">
                  <FiSettings />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    {getGroupLabel(groupKey)}
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    {groupItems.length}{" "}
                    {isArabic ? "إعدادات" : "settings"}
                  </p>
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-5 py-4 text-start font-semibold">
                        {text.field}
                      </th>

                      <th className="px-5 py-4 text-start font-semibold">
                        {text.value}
                      </th>

                      <th className="px-5 py-4 text-start font-semibold">
                        {text.group}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {groupItems.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="w-1/4 px-5 py-4 font-medium text-gray-700">
                          {getFieldLabel(item.fieldKey)}
                          <p className="mt-1 text-xs font-normal text-gray-400">
                            {item.fieldKey}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {renderInput(item)}
                        </td>

                        <td className="px-5 py-4 text-gray-500">
                          <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs">
                            {item.groupKey}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-4 p-4 md:hidden">
                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <label className="text-sm font-semibold text-gray-700">
                        {getFieldLabel(item.fieldKey)}
                      </label>

                      <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-500">
                        {item.fieldKey}
                      </span>
                    </div>

                    {renderInput(item)}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Bottom save bar */}
      {editing && (
        <div className="sticky bottom-4 z-20 mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiCheckCircle
              className={isDirty ? "text-amber-500" : "text-green-500"}
            />

            {isDirty
              ? isArabic
                ? "لديك تغييرات غير محفوظة"
                : "You have unsaved changes"
              : isArabic
                ? "كل التغييرات محفوظة"
                : "All changes are saved"}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 sm:flex-none"
            >
              {text.cancel}
            </button>

            <button
              type="button"
              onClick={updateSettings}
              disabled={saving || !isDirty}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-2.5 text-sm font-semibold text-[#D4AF37] hover:bg-black disabled:opacity-50 sm:flex-none"
            >
              <FiSave />
              {saving ? "..." : text.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
