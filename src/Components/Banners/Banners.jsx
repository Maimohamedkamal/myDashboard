
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiImage,
  FiCheckCircle,
  FiAlertCircle,
  FiGlobe,
  FiLink,
  FiUploadCloud,
  FiLayers,
  FiMonitor,
  FiExternalLink,
  FiEye,
} from "react-icons/fi";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";

const EMPTY_FORM = {
  title_ar: "",
  title_en: "",
  subtitle_ar: "",
  link: "",
  position: "hero",
  sort_order: 0,
  is_active: true,
  image: null,
};

const translations = {
  en: {
    title: "Banners Management",
    subtitle: "Manage your store banners and promotional content.",
    add: "Add Banner",
    search: "Search banners...",
    refresh: "Refresh",
    total: "Total Banners",
    active: "Active Banners",
    inactive: "Inactive Banners",
    all: "All Banners",
    banner: "Banner",
    position: "Position",
    order: "Sort Order",
    status: "Status",
    actions: "Actions",
    activeStatus: "Active",
    inactiveStatus: "Inactive",
    hero: "Hero",
    mid: "Middle",
    edit: "Edit Banner",
    create: "Create Banner",
    titleAr: "Arabic Title",
    titleEn: "English Title",
    subtitleAr: "Arabic Subtitle",
    link: "Banner Link",
    image: "Banner Image",
    upload: "Click to upload an image",
    uploadHint: "PNG, JPG, WEBP supported",
    save: "Save Banner",
    update: "Update Banner",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this banner?",
    noBanners: "No banners found",
    noBannersHint: "Add your first banner to get started.",
    loading: "Loading banners...",
    saving: "Saving...",
    required: "Please enter at least one title.",
    imageRequired: "Please select a banner image.",
    successCreate: "Banner created successfully",
    successUpdate: "Banner updated successfully",
    successDelete: "Banner deleted successfully",
    successToggle: "Banner status updated",
    errorFetch: "Failed to load banners",
    errorSave: "Failed to save banner",
    errorDelete: "Failed to delete banner",
    errorToggle: "Failed to update banner status",
    confirm: "Confirm",
    preview: "Preview",
    showing: "Showing",
    results: "results",
    filterAll: "All",
    filterActive: "Active",
    filterInactive: "Inactive",
    website: "Website",
    sortHint: "Lower numbers appear first",
    uploadNew: "Upload a new image to replace the current one",
  },
  ar: {
    title: "إدارة البنرات",
    subtitle: "إدارة بنرات المتجر والمحتوى الترويجي.",
    add: "إضافة بنر",
    search: "ابحث عن بنر...",
    refresh: "تحديث",
    total: "إجمالي البنرات",
    active: "البنرات النشطة",
    inactive: "البنرات المتوقفة",
    all: "كل البنرات",
    banner: "البنر",
    position: "الموضع",
    order: "ترتيب العرض",
    status: "الحالة",
    actions: "الإجراءات",
    activeStatus: "نشط",
    inactiveStatus: "متوقف",
    hero: "رئيسي",
    mid: "وسطي",
    edit: "تعديل البنر",
    create: "إضافة بنر جديد",
    titleAr: "العنوان بالعربية",
    titleEn: "العنوان بالإنجليزية",
    subtitleAr: "الوصف بالعربية",
    link: "رابط البنر",
    image: "صورة البنر",
    upload: "اضغط لرفع صورة",
    uploadHint: "يدعم PNG و JPG و WEBP",
    save: "حفظ البنر",
    update: "تحديث البنر",
    cancel: "إلغاء",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا البنر؟",
    noBanners: "لا توجد بنرات",
    noBannersHint: "أضف أول بنر للبدء.",
    loading: "جاري تحميل البنرات...",
    saving: "جاري الحفظ...",
    required: "من فضلك أدخل عنوانًا واحدًا على الأقل.",
    imageRequired: "من فضلك اختر صورة للبنر.",
    successCreate: "تم إنشاء البنر بنجاح",
    successUpdate: "تم تعديل البنر بنجاح",
    successDelete: "تم حذف البنر بنجاح",
    successToggle: "تم تحديث حالة البنر",
    errorFetch: "فشل تحميل البنرات",
    errorSave: "فشل حفظ البنر",
    errorDelete: "فشل حذف البنر",
    errorToggle: "فشل تحديث حالة البنر",
    confirm: "تأكيد",
    preview: "معاينة",
    showing: "عرض",
    results: "نتيجة",
    filterAll: "الكل",
    filterActive: "نشط",
    filterInactive: "متوقف",
    website: "الموقع",
    sortHint: "الأرقام الأقل تظهر أولًا",
    uploadNew: "ارفع صورة جديدة لاستبدال الصورة الحالية",
  },
};

const getBannerList = (responseData) => {
  const body = responseData?.data ?? responseData;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.banners)) return body.banners;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.banners)) return body.data.banners;
  if (Array.isArray(body?.data?.data)) return body.data.data;

  return [];
};

const isBannerActive = (value) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  value === "true" ||
  value === "active";

const getBannerImage = (banner) =>
  banner?.image_url || banner?.image || banner?.banner_image || "";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  fallback;

export default function AllBanners() {
  const [language, setLanguage] = useState(() =>
    localStorage.getItem("language") === "ar" ? "ar" : "en"
  );

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isArabic = language === "ar";
  const t = translations[language];
  const direction = isArabic ? "rtl" : "ltr";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getAllBanners = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/banners`);
      setBanners(getBannerList(response.data));
    } catch (error) {
      toast.error(getErrorMessage(error, translations[language].errorFetch));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    getAllBanners();
  }, [getAllBanners]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const stats = useMemo(() => {
    const active = banners.filter((banner) =>
      isBannerActive(banner.is_active)
    ).length;

    return {
      total: banners.length,
      active,
      inactive: banners.length - active,
    };
  }, [banners]);

  const filteredBanners = useMemo(() => {
    const term = search.trim().toLowerCase();

    return banners.filter((banner) => {
      const matchesSearch = [
        banner.title_ar,
        banner.title_en,
        banner.subtitle_ar,
        banner.link,
        banner.position,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));

      const active = isBannerActive(banner.is_active);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [banners, search, statusFilter]);

  const openCreateForm = () => {
    setEditingBanner(null);
    setForm({ ...EMPTY_FORM });
    setPreview("");
    setShowForm(true);
  };

  const openEditForm = (banner) => {
    setEditingBanner(banner);

    setForm({
      title_ar: banner.title_ar || "",
      title_en: banner.title_en || "",
      subtitle_ar: banner.subtitle_ar || "",
      link: banner.link || "",
      position: banner.position || "hero",
      sort_order: banner.sort_order ?? 0,
      is_active: isBannerActive(banner.is_active),
      image: null,
    });

    setPreview(getBannerImage(banner));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBanner(null);
    setForm({ ...EMPTY_FORM });
    setPreview("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        isArabic ? "يرجى اختيار صورة صالحة" : "Please select a valid image"
      );
      return;
    }

    setForm((previous) => ({ ...previous, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title_ar.trim() && !form.title_en.trim()) {
      toast.error(t.required);
      return;
    }

    if (!editingBanner && !form.image) {
      toast.error(t.imageRequired);
      return;
    }

    const formData = new FormData();

    formData.append("title_ar", form.title_ar.trim());
    formData.append("title_en", form.title_en.trim());
    formData.append("subtitle_ar", form.subtitle_ar.trim());
    formData.append("link", form.link.trim());
    formData.append("position", form.position);
    formData.append("sort_order", String(Number(form.sort_order) || 0));
    formData.append("is_active", form.is_active ? "1" : "0");

    if (form.image) {
      formData.append("image", form.image);
    }

    setSaving(true);

    try {
      if (editingBanner) {
        await axios.put(
          `${API_URL}/banners/${editingBanner.id}`,
          formData,
          { headers: getAuthHeaders() }
        );
        toast.success(t.successUpdate);
      } else {
        await axios.post(`${API_URL}/banners`, formData, {
          headers: getAuthHeaders(),
        });
        toast.success(t.successCreate);
      }

      closeForm();
      await getAllBanners();
    } catch (error) {
      toast.error(getErrorMessage(error, t.errorSave));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (banner) => {
    const nextStatus = !isBannerActive(banner.is_active);

    try {
      await axios.put(
        `${API_URL}/banners/${banner.id}`,
        { is_active: nextStatus ? 1 : 0 },
        { headers: getAuthHeaders() }
      );

      toast.success(t.successToggle);
      await getAllBanners();
    } catch (error) {
      toast.error(getErrorMessage(error, t.errorToggle));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(`${API_URL}/banners/${deleteTarget.id}`, {
        headers: getAuthHeaders(),
      });

      toast.success(t.successDelete);
      setDeleteTarget(null);
      await getAllBanners();
    } catch (error) {
      toast.error(getErrorMessage(error, t.errorDelete));
    }
  };

  const getPositionLabel = (position) => {
    if (position === "hero") return t.hero;
    if (position === "mid") return t.mid;
    return position || "—";
  };

  const BannerImage = ({ banner, className = "" }) => {
    const imageUrl = getBannerImage(banner);

    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 ${className}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={banner.title_en || banner.title_ar || "Banner"}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <FiImage className="text-xl text-gray-400" />
        )}
      </div>
    );
  };

  const StatusBadge = ({ active }) => (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      {active ? t.activeStatus : t.inactiveStatus}
    </span>
  );

  const BannerActions = ({ banner }) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => openEditForm(banner)}
        title={t.edit}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
      >
        <FiEdit2 />
      </button>

     

      <button
        type="button"
        onClick={() => setDeleteTarget(banner)}
        title={t.delete}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
      >
        <FiTrash2 />
      </button>
    </div>
  );

  return (
    <div
      dir={direction}
      className="min-h-screen bg-gray-100 p-10 text-gray-800 "
    >
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
          

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {t.title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
        

           

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
            >
              <FiPlus className="text-emerald-300" />
              {t.add}
            </button>
          </div>
        </header>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{t.total}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                <FiLayers />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{t.active}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                <FiCheckCircle />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{t.inactive}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.inactive}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
                <FiAlertCircle />
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <FiSearch
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                  isArabic ? "right-4" : "left-4"
                }`}
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
                className={`h-12 w-full grow rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 ${
                  isArabic ? "pr-11 pl-4" : "pl-11 pr-4"
                }`}
              />
            </div>

             <button
              type="button"
              onClick={getAllBanners}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-60"
            >
              <FiRefreshCw
                className={`text-blue-500 ${loading ? "animate-spin" : ""}`}
              />
              {t.refresh}
            </button>
          </div>
        </section>

        {/* Responsive Table */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <h2 className="font-bold text-gray-900">{t.all}</h2>
            <p className="text-sm text-gray-500">
              {t.showing} {filteredBanners.length} {t.results}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-gray-500">
              <FiRefreshCw className="animate-spin text-2xl text-blue-500" />
              <p className="text-sm">{t.loading}</p>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
              <FiImage className="mb-3 text-4xl text-gray-300" />
              <h3 className="font-semibold text-gray-800">{t.noBanners}</h3>
              <p className="mt-2 text-sm text-gray-500">
                {t.noBannersHint}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-3 bg-gray-50 p-3 md:hidden">
                {filteredBanners.map((banner) => (
                  <article
                    key={banner.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="flex gap-3 p-3 sm:p-4">
                      <BannerImage
                        banner={banner}
                        className="h-20 w-24 sm:h-24 sm:w-32"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-bold text-gray-900">
                          {isArabic
                            ? banner.title_ar || banner.title_en
                            : banner.title_en || banner.title_ar}
                        </h3>

                        {banner.subtitle_ar && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                            {banner.subtitle_ar}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge
                            active={isBannerActive(banner.is_active)}
                          />
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                            {getPositionLabel(banner.position)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-3 py-3 sm:px-4">
                      <span className="text-xs text-gray-500">
                        {t.order}: {banner.sort_order ?? 0}
                      </span>
                      <BannerActions banner={banner} />
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop and Tablet Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px] border-collapse text-start">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-4 text-start font-semibold lg:px-6">
                        {t.banner}
                      </th>
                      <th className="px-4 py-4 text-start font-semibold">
                        {t.position}
                      </th>
                      <th className="px-4 py-4 text-start font-semibold">
                        {t.order}
                      </th>
                      <th className="px-4 py-4 text-start font-semibold">
                        {t.status}
                      </th>
                      <th className="px-4 py-4 text-end font-semibold lg:px-6">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredBanners.map((banner) => (
                      <tr
                        key={banner.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 lg:px-6">
                          <div className="flex items-center gap-3">
                            <BannerImage
                              banner={banner}
                              className="h-12 w-16 lg:h-14 lg:w-20"
                            />

                            <div className="min-w-0">
                              <p className="max-w-[240px] break-words text-sm font-semibold text-gray-900">
                                {isArabic
                                  ? banner.title_ar || banner.title_en
                                  : banner.title_en || banner.title_ar}
                              </p>

                              <p className="mt-1 max-w-[240px] truncate text-xs text-gray-500">
                                {banner.title_ar || banner.title_en || "—"}
                              </p>

                              {banner.link && (
                                <a
                                  href={banner.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 inline-flex max-w-[220px] items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  <FiExternalLink className="shrink-0" />
                                  <span className="truncate">{banner.link}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                            {getPositionLabel(banner.position)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {banner.sort_order ?? 0}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge
                            active={isBannerActive(banner.is_active)}
                          />
                        </td>

                        <td className="px-4 py-4 lg:px-6">
                          <div className="flex justify-end">
                            <BannerActions banner={banner} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!loading && filteredBanners.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 sm:px-5">
              <p className="text-xs text-gray-500">
                {t.showing}{" "}
                <span className="font-semibold text-gray-800">
                  {filteredBanners.length}
                </span>{" "}
                {t.results}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div
          className="fixed  inset-0 z-[200] flex items-end justify-center bg-gray-950/50 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div className="max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingBanner ? t.edit : t.create}
                </h2>
                <p className="mt-1 text-xs text-gray-500">{t.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.titleAr}
                  </label>
                  <input
                    name="title_ar"
                    value={form.title_ar}
                    onChange={handleChange}
                    dir="rtl"
                    placeholder="عنوان البنر"
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.titleEn}
                  </label>
                  <input
                    name="title_en"
                    value={form.title_en}
                    onChange={handleChange}
                    dir="ltr"
                    placeholder="Banner title"
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.subtitleAr}
                </label>
                <textarea
                  name="subtitle_ar"
                  value={form.subtitle_ar}
                  onChange={handleChange}
                  rows={3}
                  dir="rtl"
                  placeholder="وصف البنر..."
                  className="w-full resize-y rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.link}
                </label>
                <div className="relative">
                  <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="url"
                    name="link"
                    value={form.link}
                    onChange={handleChange}
                    dir="ltr"
                    placeholder="https://example.com/products"
                    className="h-11 w-full rounded-xl border border-gray-200 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.position}
                  </label>
                  <select
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="hero">{t.hero}</option>
                    <option value="mid">{t.mid}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.order}
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    min="0"
                    value={form.sort_order}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                  <p className="mt-1.5 text-xs text-gray-400">{t.sortHint}</p>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t.image}
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-indigo-300 hover:bg-indigo-50/40">
                  {preview ? (
                    <div className="relative w-full">
                      <img
                        src={preview}
                        alt="Banner preview"
                        className="max-h-64 w-full object-contain"
                      />
                      <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl bg-gray-900/90 px-4 py-2 text-xs font-medium text-white">
                        <FiUploadCloud className="text-emerald-300" />
                        {t.upload}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center px-5 py-10 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                        <FiUploadCloud />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {t.upload}
                      </span>
                      <span className="mt-2 text-xs text-gray-400">
                        {t.uploadHint}
                      </span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {editingBanner && (
                  <p className="mt-2 text-xs text-gray-500">{t.uploadNew}</p>
                )}
              </div>

              {/* Active Toggle */}
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      form.is_active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {form.is_active ? <FiCheckCircle /> : <FiAlertCircle />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {t.activeStatus}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {isArabic
                        ? "إظهار البنر على الموقع"
                        : "Display this banner on the website"}
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 cursor-pointer accent-emerald-600"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-60"
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <FiRefreshCw className="animate-spin" />
                  ) : (
                    <FiSave className="text-emerald-300" />
                  )}
                  {saving
                    ? t.saving
                    : editingBanner
                      ? t.update
                      : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-500">
              <FiTrash2 />
            </div>

            <h2 className="text-center text-lg font-bold text-gray-900">
              {t.delete}
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-gray-500">
              {t.confirmDelete}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                {t.cancel}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="h-11 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FiTrash2 />
                  {t.confirm}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
