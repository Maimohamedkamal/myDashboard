
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiTag,
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiX,
  FiSave,
  FiPercent,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiGlobe,
  FiAlertCircle,
} from "react-icons/fi";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";

const initialForm = {
  code: "",
  name_ar: "",
  description_ar: "",
  type: "percentage",
  value: "",
  min_order: "0",
  max_discount: "",
  uses_limit: "",
  per_user_limit: "1",
  is_active: true,
  expires_at: "",
};

const translations = {
  en: {
    title: "Coupons Management",
    subtitle: "Manage your discount coupons",
    refresh: "Refresh",
    add: "Add Coupon",
    total: "Total Coupons",
    active: "Active Coupons",
    inactive: "Inactive Coupons",
    expired: "Expired Coupons",
    all: "All Coupons",
    found: "coupons found",
    search: "Search by code, name or description...",
    coupon: "Coupon",
    discount: "Discount",
    minOrder: "Minimum Order",
    usage: "Usage",
    perUser: "Per User",
    expiration: "Expiration",
    status: "Status",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    noExpiration: "No expiration",
    unlimited: "Unlimited",
    max: "Max",
    egp: "EGP",
    noCoupons: "No coupons found",
    emptyHint: "Add a coupon or change your search.",
    loading: "Loading coupons...",
    showing: "Showing",
    of: "of",
    dashboard: "Oud Elite Admin Dashboard",
    update: "Update Coupon",
    create: "Create Coupon",
    addTitle: "Add Coupon",
    updateTitle: "Update Coupon",
    formHint: "Enter coupon information below.",
    codeLabel: "Coupon Code",
    nameLabel: "Arabic Name",
    typeLabel: "Discount Type",
    valueLabel: "Discount Value",
    minLabel: "Minimum Order",
    maxLabel: "Maximum Discount",
    limitLabel: "Total Usage Limit",
    perUserLabel: "Limit Per User",
    expiryLabel: "Expiration Date",
    descLabel: "Description (Arabic)",
    descPlaceholder: "Enter coupon description...",
    percentage: "Percentage (%)",
    fixed: "Fixed Amount",
    statusLabel: "Coupon Status",
    statusHint: "Enable this coupon for customers.",
    cancel: "Cancel",
    saving: "Saving...",
    deleteConfirm: "Are you sure you want to delete coupon",
    deleteSuccess: "Coupon deleted successfully",
    createSuccess: "Coupon created successfully",
    updateSuccess: "Coupon updated successfully",
    loadError: "Failed to load coupons",
    saveError: "Failed to save coupon",
    deleteError: "Failed to delete coupon",
    login: "Please log in as an administrator",
    enterCode: "Please enter the coupon code",
    enterName: "Please enter the Arabic coupon name",
    validValue: "Please enter a valid discount value",
    percentageError: "Percentage cannot exceed 100",
    minError: "Minimum order cannot be negative",
    maxError: "Maximum discount cannot be negative",
    usageError: "Usage limit must be a positive whole number",
    userLimitError: "Per-user limit must be at least 1",
    activeStatus: "Active",
    inactiveStatus: "Inactive",
    expiredStatus: "Expired",
    limitReached: "Limit reached",
    noData: "No coupons to display",
    language: "العربية",
    allFields: "Required fields are marked with *.",
  },

  ar: {
    title: "إدارة الكوبونات",
    subtitle: "إدارة كوبونات الخصم الخاصة بك",
    refresh: "تحديث",
    add: "إضافة كوبون",
    total: "إجمالي الكوبونات",
    active: "الكوبونات النشطة",
    inactive: "الكوبونات غير النشطة",
    expired: "الكوبونات المنتهية",
    all: "جميع الكوبونات",
    found: "كوبون مطابق",
    search: "ابحث بالكود أو الاسم أو الوصف...",
    coupon: "الكوبون",
    discount: "الخصم",
    minOrder: "الحد الأدنى للطلب",
    usage: "الاستخدام",
    perUser: "لكل مستخدم",
    expiration: "تاريخ الانتهاء",
    status: "الحالة",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    noExpiration: "بدون تاريخ انتهاء",
    unlimited: "غير محدود",
    max: "الحد الأقصى",
    egp: "جنيه",
    noCoupons: "لا توجد كوبونات",
    emptyHint: "أضف كوبونًا جديدًا أو غيّر كلمات البحث.",
    loading: "جارٍ تحميل الكوبونات...",
    showing: "عرض",
    of: "من",
    dashboard: "لوحة تحكم Oud Elite",
    update: "تحديث الكوبون",
    create: "إنشاء الكوبون",
    addTitle: "إضافة كوبون",
    updateTitle: "تعديل الكوبون",
    formHint: "أدخل بيانات الكوبون التالية.",
    codeLabel: "كود الكوبون",
    nameLabel: "الاسم بالعربية",
    typeLabel: "نوع الخصم",
    valueLabel: "قيمة الخصم",
    minLabel: "الحد الأدنى للطلب",
    maxLabel: "الحد الأقصى للخصم",
    limitLabel: "إجمالي عدد الاستخدامات",
    perUserLabel: "عدد الاستخدامات لكل مستخدم",
    expiryLabel: "تاريخ انتهاء الصلاحية",
    descLabel: "الوصف بالعربية",
    descPlaceholder: "أدخل وصف الكوبون...",
    percentage: "نسبة مئوية (%)",
    fixed: "مبلغ ثابت",
    statusLabel: "حالة الكوبون",
    statusHint: "فعّل الكوبون ليتمكن العملاء من استخدامه.",
    cancel: "إلغاء",
    saving: "جارٍ الحفظ...",
    deleteConfirm: "هل أنت متأكد من حذف الكوبون",
    deleteSuccess: "تم حذف الكوبون بنجاح",
    createSuccess: "تم إنشاء الكوبون بنجاح",
    updateSuccess: "تم تحديث الكوبون بنجاح",
    loadError: "فشل تحميل الكوبونات",
    saveError: "فشل حفظ الكوبون",
    deleteError: "فشل حذف الكوبون",
    login: "يرجى تسجيل الدخول بحساب مسؤول",
    enterCode: "يرجى إدخال كود الكوبون",
    enterName: "يرجى إدخال اسم الكوبون بالعربية",
    validValue: "يرجى إدخال قيمة خصم صحيحة",
    percentageError: "لا يمكن أن تتجاوز نسبة الخصم 100%",
    minError: "لا يمكن أن يكون الحد الأدنى للطلب سالبًا",
    maxError: "لا يمكن أن يكون الحد الأقصى للخصم سالبًا",
    usageError: "يجب أن يكون حد الاستخدام عددًا صحيحًا موجبًا",
    userLimitError: "يجب أن يكون حد الاستخدام لكل مستخدم 1 على الأقل",
    activeStatus: "نشط",
    inactiveStatus: "غير نشط",
    expiredStatus: "منتهي",
    limitReached: "اكتمل حد الاستخدام",
    noData: "لا توجد بيانات للعرض",
    language: "English",
    allFields: "الحقول المطلوبة محددة بعلامة *.",
  },
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100 sm:px-4";

const labelClass = "mb-2 block text-sm font-medium text-gray-700";

function getDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function StatCard({ title, value, icon, iconClass }) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-xs font-medium text-gray-500 sm:text-sm">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, valueClass = "" }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 break-words text-sm text-gray-800 ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

export default function AllCoupons() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en"
  );

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...initialForm });

  const isArabic = language === "ar";
  const t = translations[language];
  const dir = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    localStorage.setItem("language", language);
  }, [language, dir]);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getCoupons = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/coupons`, {
        headers: getHeaders(),
      });

      const data = response.data?.data;

      setCoupons(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.coupons)
          ? data.coupons
          : Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error("Get coupons error:", error);
      toast.error(error.response?.data?.message || t.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCoupons();
    // Load the coupons when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...initialForm });
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm({ ...initialForm });
    setShowForm(true);
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);

    setForm({
      code: coupon.code || "",
      name_ar: coupon.name_ar || "",
      description_ar: coupon.description_ar || "",
      type: coupon.type || "percentage",
      value: coupon.value ?? "",
      min_order: coupon.min_order ?? "0",
      max_discount: coupon.max_discount ?? "",
      uses_limit: coupon.uses_limit ?? "",
      per_user_limit: coupon.per_user_limit ?? "1",
      is_active:
        coupon.is_active === true ||
        coupon.is_active === 1 ||
        coupon.is_active === "1",
      expires_at: getDateInputValue(coupon.expires_at),
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error(t.enterCode);
      return;
    }

    if (!form.name_ar.trim()) {
      toast.error(t.enterName);
      return;
    }

    if (
      form.value === "" ||
      !Number.isFinite(Number(form.value)) ||
      Number(form.value) <= 0
    ) {
      toast.error(t.validValue);
      return;
    }

    if (form.type === "percentage" && Number(form.value) > 100) {
      toast.error(t.percentageError);
      return;
    }

    if (form.min_order !== "" && Number(form.min_order) < 0) {
      toast.error(t.minError);
      return;
    }

    if (form.max_discount !== "" && Number(form.max_discount) < 0) {
      toast.error(t.maxError);
      return;
    }

    if (
      form.uses_limit !== "" &&
      (!Number.isInteger(Number(form.uses_limit)) ||
        Number(form.uses_limit) < 1)
    ) {
      toast.error(t.usageError);
      return;
    }

    if (
      !Number.isInteger(Number(form.per_user_limit)) ||
      Number(form.per_user_limit) < 1
    ) {
      toast.error(t.userLimitError);
      return;
    }

    if (!localStorage.getItem("token")) {
      toast.error(t.login);
      return;
    }

    let expiresAt = null;

    if (form.expires_at) {
      const parsed = new Date(form.expires_at);

      if (Number.isNaN(parsed.getTime())) {
        toast.error(t.validValue);
        return;
      }

      expiresAt = parsed.toISOString();
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      name_ar: form.name_ar.trim(),
      description_ar: form.description_ar.trim(),
      type: form.type,
      value: Number(form.value),
      min_order: form.min_order === "" ? 0 : Number(form.min_order),
      max_discount:
        form.type === "percentage" && form.max_discount !== ""
          ? Number(form.max_discount)
          : null,
      uses_limit: form.uses_limit === "" ? null : Number(form.uses_limit),
      per_user_limit: Number(form.per_user_limit),
      is_active: Boolean(form.is_active),
      expires_at: expiresAt,
    };

    setSaving(true);

    try {
      const response =
        editingId !== null
          ? await axios.put(`${API_URL}/coupons/${editingId}`, payload, {
              headers: getHeaders(),
            })
          : await axios.post(`${API_URL}/coupons`, payload, {
              headers: getHeaders(),
            });

      if (response.data?.success) {
        toast.success(editingId !== null ? t.updateSuccess : t.createSuccess);
        closeForm();
        await getCoupons();
      } else {
        toast.error(response.data?.message || t.saveError);
      }
    } catch (error) {
      console.error("Save coupon error:", error);

      const validationErrors = error.response?.data?.errors;
      const firstError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      toast.error(firstError || error.response?.data?.message || t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `${t.deleteConfirm} "${coupon.code}"?`
    );

    if (!confirmed) return;

    if (!localStorage.getItem("token")) {
      toast.error(t.login);
      return;
    }

    setDeletingId(coupon.id);

    try {
      const response = await axios.delete(`${API_URL}/coupons/${coupon.id}`, {
        headers: getHeaders(),
      });

      if (response.data?.success) {
        toast.success(t.deleteSuccess);

        setCoupons((prev) =>
          prev.filter((item) => item.id !== coupon.id)
        );

        if (editingId === coupon.id) closeForm();
      } else {
        toast.error(response.data?.message || t.deleteError);
      }
    } catch (error) {
      console.error("Delete coupon error:", error);
      toast.error(error.response?.data?.message || t.deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatus = (coupon) => {
    const active =
      coupon.is_active === true ||
      coupon.is_active === 1 ||
      coupon.is_active === "1";

    if (!active) {
      return {
        label: t.inactiveStatus,
        key: "inactive",
        className: "bg-gray-100 text-gray-600",
      };
    }

    if (
      coupon.expires_at &&
      new Date(coupon.expires_at).getTime() < Date.now()
    ) {
      return {
        label: t.expiredStatus,
        key: "expired",
        className: "bg-red-50 text-red-700",
      };
    }

    if (
      coupon.uses_limit != null &&
      Number(coupon.uses_count || 0) >= Number(coupon.uses_limit)
    ) {
      return {
        label: t.limitReached,
        key: "limit",
        className: "bg-orange-50 text-orange-700",
      };
    }

    return {
      label: t.activeStatus,
      key: "active",
      className: "bg-green-50 text-green-700",
    };
  };

  const formatDate = (date) => {
    if (!date) return t.noExpiration;

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString(isArabic ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const money = (value) =>
    `${Number(value || 0).toLocaleString(
      isArabic ? "ar-EG" : "en-GB",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )} ${t.egp}`;

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return coupons;

    return coupons.filter((coupon) =>
      [
        coupon.id,
        coupon.code,
        coupon.name_ar,
        coupon.description_ar,
        coupon.type,
      ].some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [coupons, search]);

  const activeCount = coupons.filter(
    (coupon) => getStatus(coupon).key === "active"
  ).length;

  const inactiveCount = coupons.filter(
    (coupon) => getStatus(coupon).key === "inactive"
  ).length;

  const expiredCount = coupons.filter(
    (coupon) => getStatus(coupon).key === "expired"
  ).length;

  const renderStatus = (coupon) => {
    const status = getStatus(coupon);

    return (
      <span
        className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${status.className}`}
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
        {status.label}
      </span>
    );
  };

  const renderCouponCard = (coupon) => (
    <article
      key={coupon.id}
      className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <FiTag size={20} />
          </div>

          <div className="min-w-0">
            <p className="break-all text-sm font-bold text-gray-900">
              {coupon.code}
            </p>
            <p className="mt-1 break-words text-sm text-gray-500" dir="rtl">
              {coupon.name_ar || "—"}
            </p>
          </div>
        </div>

        {renderStatus(coupon)}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-gray-100 pt-4">
        <InfoItem
          label={t.discount}
          value={
            coupon.type === "percentage"
              ? `${Number(coupon.value)}%`
              : money(coupon.value)
          }
          valueClass="font-bold text-amber-700"
        />

        <InfoItem
          label={t.minOrder}
          value={money(coupon.min_order)}
        />

        <InfoItem
          label={t.usage}
          value={`${coupon.uses_count ?? 0} / ${
            coupon.uses_limit ?? "∞"
          }`}
        />

        <InfoItem
          label={t.perUser}
          value={coupon.per_user_limit ?? "—"}
        />

        <InfoItem
          label={t.expiration}
          value={formatDate(coupon.expires_at)}
        />

        {coupon.type === "percentage" && coupon.max_discount != null && (
          <InfoItem
            label={t.max}
            value={money(coupon.max_discount)}
          />
        )}
      </div>

      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => handleEdit(coupon)}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800"
        >
          <FiEdit2 size={16} />
          {t.edit}
        </button>

        <button
          type="button"
          onClick={() => handleDelete(coupon)}
          disabled={deletingId === coupon.id}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {deletingId === coupon.id ? (
            <FiRefreshCw className="animate-spin" size={16} />
          ) : (
            <FiTrash2 size={16} />
          )}
          {t.delete}
        </button>
      </div>
    </article>
  );

  return (
    <div
      dir={dir}
      className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-100 p-3 text-gray-900 sm:p-5 lg:p-8"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 sm:space-y-6">
        {/* HEADER */}
        <header className="flex min-w-0 flex-col gap-4  p-4  sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-600 text-white">
              <FiTag size={24} />
            </div>

            <div className="min-w-0 ">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {t.title}
              </h1>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          
            <button
              type="button"
              onClick={handleAdd}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gray-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 sm:col-span-1 sm:px-5"
            >
              <FiPlus size={18} />
              {t.add}
            </button>
          </div>
        </header>

        {/* STATISTICS */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
          <StatCard
            title={t.total}
            value={coupons.length}
            icon={<FiTag size={22} />}
            iconClass="bg-amber-50 text-amber-700"
          />

          <StatCard
            title={t.active}
            value={activeCount}
            icon={<FiCheckCircle size={22} />}
            iconClass="bg-green-50 text-green-700"
          />

          <StatCard
            title={t.inactive}
            value={inactiveCount}
            icon={<FiX size={22} />}
            iconClass="bg-gray-100 text-gray-600"
          />

          <StatCard
            title={t.expired}
            value={expiredCount}
            icon={<FiClock size={22} />}
            iconClass="bg-red-50 text-red-600"
          />
        </section>

           <div className="relative w-full min-w-0 lg:max-w-md">
             

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search}
                className={`${inputClass} ${
                  isArabic ? "pr-10" : "pl-10"
                }`}
              />
            </div>

        {/* COUPONS TABLE AND CARDS */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:hidden">
            {loading ? (
              <div className="col-span-full flex flex-col items-center gap-3 py-12 text-gray-500">
                <FiRefreshCw className="animate-spin text-amber-600" size={26} />
                <p className="text-sm">{t.loading}</p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="col-span-full flex flex-col items-center gap-3 py-12 text-gray-400">
                {search ? (
                  <FiSearch size={30} />
                ) : (
                  <FiAlertCircle size={30} />
                )}
                <p className="text-sm font-semibold text-gray-700">
                  {t.noCoupons}
                </p>
                <p className="text-center text-xs">{t.emptyHint}</p>
              </div>
            ) : (
              filteredCoupons.map(renderCouponCard)
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden w-full overflow-x-auto lg:block">
            <table className="w-full min-w-220 table-auto">
              <thead>
                <tr className="bg-gray-50 text-start text-xs text-gray-500">
                  <th className="px-4 py-4 font-semibold">{t.coupon}</th>
                  <th className="px-4 py-4 font-semibold">{t.discount}</th>
                  <th className="px-4 py-4 font-semibold">{t.minOrder}</th>
                  <th className="px-4 py-4 font-semibold">{t.usage}</th>
                  <th className="px-4 py-4 font-semibold">{t.perUser}</th>
                  <th className="px-4 py-4 font-semibold">{t.expiration}</th>
                  <th className="px-4 py-4 font-semibold">{t.status}</th>
                  <th className="px-4 py-4 text-center font-semibold">{t.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex flex-col items-center gap-3 py-14 text-gray-500">
                        <FiRefreshCw className="animate-spin text-amber-600" size={26} />
                        <p className="text-sm">{t.loading}</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex flex-col items-center gap-3 py-14 text-gray-400">
                        <FiTag size={30} />
                        <p className="text-sm font-semibold text-gray-700">
                          {t.noCoupons}
                        </p>
                        <p className="text-xs">{t.emptyHint}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="transition hover:bg-gray-50/80"
                    >
                      <td className="px-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <FiTag size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="break-all text-sm font-bold text-gray-900">
                              {coupon.code}
                            </p>
                            <p
                              className="mt-1 max-w-52 break-words text-xs text-gray-500"
                              dir="rtl"
                            >
                              {coupon.name_ar || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-amber-700">
                          {coupon.type === "percentage"
                            ? `${Number(coupon.value)}%`
                            : money(coupon.value)}
                        </span>

                        {coupon.type === "percentage" &&
                          coupon.max_discount != null && (
                            <p className="mt-1 text-xs text-gray-400">
                              {t.max}: {money(coupon.max_discount)}
                            </p>
                          )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                        {money(coupon.min_order)}
                      </td>

                      <td className="min-w-32 px-4 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {coupon.uses_count ?? 0} /{" "}
                          {coupon.uses_limit ?? "∞"}
                        </p>

                        {coupon.uses_limit != null &&
                          Number(coupon.uses_limit) > 0 && (
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-amber-500 transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (Number(coupon.uses_count || 0) /
                                      Number(coupon.uses_limit)) *
                                      100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {coupon.per_user_limit ?? "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                        {formatDate(coupon.expires_at)}
                      </td>

                      <td className="px-4 py-4">{renderStatus(coupon)}</td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(coupon)}
                            title={t.edit}
                            aria-label={t.edit}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-gray-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <FiEdit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(coupon)}
                            disabled={deletingId === coupon.id}
                            title={t.delete}
                            aria-label={t.delete}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === coupon.id ? (
                              <FiRefreshCw className="animate-spin" size={16} />
                            ) : (
                              <FiTrash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          {!loading && filteredCoupons.length > 0 && (
            <footer className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p>
                {t.showing}{" "}
                <span className="font-semibold text-gray-800">
                  {filteredCoupons.length}
                </span>{" "}
                {t.of}{" "}
                <span className="font-semibold text-gray-800">
                  {coupons.length}
                </span>{" "}
                {t.all.toLowerCase()}
              </p>
              <p>{t.dashboard}</p>
            </footer>
          )}
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-gray-950/50 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) closeForm();
          }}
        >
          <section className="my-auto flex max-h-[94vh] w-full max-w-4xl min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:max-h-[90vh]">
            {/* MODAL HEADER */}
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-amber-400">
                  {editingId !== null ? (
                    <FiEdit2 size={19} />
                  ) : (
                    <FiPlus size={20} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    {editingId !== null ? t.updateTitle : t.addTitle}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">{t.formHint}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label={t.cancel}
                className="shrink-0 rounded-xl p-2 text-gray-500 transition hover:bg-gray-200 hover:text-red-600 disabled:opacity-50"
              >
                <FiX size={22} />
              </button>
            </header>

            {/* MODAL FORM */}
            <form
              onSubmit={handleSubmit}
              className="min-h-0 space-y-5 overflow-y-auto p-4 sm:p-6"
            >
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="min-w-0">
                  <label className={labelClass}>
                    {t.codeLabel} *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="WELCOME10"
                    dir="ltr"
                    autoComplete="off"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>
                    {t.nameLabel} *
                  </label>
                  <input
                    type="text"
                    name="name_ar"
                    value={form.name_ar}
                    onChange={handleChange}
                    placeholder="خصم الترحيب"
                    dir="rtl"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>
                    {t.typeLabel} *
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="percentage">{t.percentage}</option>
                    <option value="fixed">{t.fixed}</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>
                    {t.valueLabel} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="value"
                      value={form.value}
                      onChange={handleChange}
                      placeholder="10"
                      min="0.01"
                      max={form.type === "percentage" ? "100" : undefined}
                      step="0.01"
                      dir="ltr"
                      className={`${inputClass} pe-12`}
                      required
                    />

                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {form.type === "percentage" ? (
                        <FiPercent size={17} />
                      ) : (
                        <span className="text-xs font-bold">EGP</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>{t.minLabel}</label>
                  <input
                    type="number"
                    name="min_order"
                    value={form.min_order}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    dir="ltr"
                    className={inputClass}
                  />
                </div>

                {form.type === "percentage" && (
                  <div className="min-w-0">
                    <label className={labelClass}>{t.maxLabel}</label>
                    <input
                      type="number"
                      name="max_discount"
                      value={form.max_discount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="150"
                      dir="ltr"
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="min-w-0">
                  <label className={labelClass}>{t.limitLabel}</label>
                  <input
                    type="number"
                    name="uses_limit"
                    value={form.uses_limit}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    placeholder={t.unlimited}
                    dir="ltr"
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>{t.perUserLabel}</label>
                  <input
                    type="number"
                    name="per_user_limit"
                    value={form.per_user_limit}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    dir="ltr"
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>{t.expiryLabel}</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="expires_at"
                      value={form.expires_at}
                      onChange={handleChange}
                      dir="ltr"
                      className={`${inputClass} pe-10`}
                    />
                    <FiCalendar
                      className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                  </div>
                </div>

                <div className="min-w-0 sm:col-span-2 lg:col-span-3">
                  <label className={labelClass}>{t.descLabel}</label>
                  <textarea
                    name="description_ar"
                    value={form.description_ar}
                    onChange={handleChange}
                    placeholder={t.descPlaceholder}
                    rows={3}
                    dir="rtl"
                    className={`${inputClass} resize-y`}
                  />
                </div>

                {/* STATUS SWITCH */}
                <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2 lg:col-span-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {t.statusLabel}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t.statusHint}
                    </p>
                  </div>

                  <label className="flex shrink-0 cursor-pointer items-center gap-3">
                    <span
                      className={`text-sm font-semibold ${
                        form.is_active ? "text-green-700" : "text-gray-500"
                      }`}
                    >
                      {form.is_active ? t.activeStatus : t.inactiveStatus}
                    </span>

                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      className="peer sr-only"
                    />

                    <span
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        form.is_active ? "bg-green-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                          form.is_active
                            ? isArabic
                              ? "right-1"
                              : "left-6"
                            : isArabic
                            ? "right-6"
                            : "left-1"
                        }`}
                      />
                    </span>
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-amber-400 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <FiRefreshCw className="animate-spin" size={17} />
                  ) : (
                    <FiSave size={17} />
                  )}

                  {saving
                    ? t.saving
                    : editingId !== null
                    ? t.update
                    : t.create}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
