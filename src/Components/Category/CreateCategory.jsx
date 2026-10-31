
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiSearch,
  FiRefreshCw,
  FiFolder,
  FiStar,
  FiImage,
} from "react-icons/fi";
import DashboardHeader from "../HeaderDash/HeaderDash";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";

const emptyForm = {
  name_ar: "",
  name_en: "",
  slug: "",
  description_ar: "",
  description_en: "",
  image_url: "",
  is_featured: false,
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-100";

const isFeatured = (category) =>
  category?.is_featured === true ||
  category?.is_featured === 1 ||
  category?.is_featured === "1";

export default function AllCategories() {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";
  const isArabic = currentLanguage.startsWith("ar");
  const direction = isArabic ? "rtl" : "ltr";

  const tr = (key, fallback = key) =>
    t(`adminCategories.${key}`, { defaultValue: fallback });

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const getCategories = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/categories`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        params: { page: 1, limit: 100 },
      });

      const responseData = response.data;
      const data = responseData?.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.categories)
        ? data.categories
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(responseData?.categories)
        ? responseData.categories
        : Array.isArray(responseData?.data?.data)
        ? responseData.data.data
        : [];

      setCategories(list);
    } catch (error) {
      console.error("Get categories error:", error);
      toast.error(
        error.response?.data?.message || tr("errorLoad", "Failed to load categories.")
      );
    } finally {
      setLoading(false);
    }
  }, [token]); // Avoid refetching every time the language changes.

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleAdd() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  }

  function handleEdit(category) {
    setEditingId(category.id);

    setForm({
      name_ar: category.name_ar || "",
      name_en: category.name_en || "",
      slug: category.slug || "",
      description_ar: category.description_ar || "",
      description_en: category.description_en || "",
      image_url: category.image_url || "",
      is_featured: isFeatured(category),
    });

    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name_en.trim() || !form.name_ar.trim()) {
      toast.error(
        tr("required", "Please enter the category name in both English and Arabic.")
      );
      return;
    }

    if (!token) {
      toast.error(
        tr("loginRequired", "Please log in as an administrator first.")
      );
      return;
    }

    const payload = {
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim(),
      slug: form.slug.trim(),
      description_ar: form.description_ar.trim(),
      description_en: form.description_en.trim(),
      image_url: form.image_url.trim(),
      is_featured: form.is_featured,
    };

    try {
      setSaving(true);

      let response;

      if (editingId !== null) {
        response = await axios.put(
          `${API_URL}/categories/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(
          response.data?.message ||
            tr("successUpdate", "Category updated successfully.")
        );
      } else {
        response = await axios.post(`${API_URL}/categories`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success(
          response.data?.message ||
            tr("successCreate", "Category created successfully.")
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await getCategories();
    } catch (error) {
      console.error("Save category error:", error);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          tr("errorSave", "Failed to save category.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      tr("confirmDelete", "Are you sure you want to delete this category?")
    );

    if (!confirmed) return;

    if (!token) {
      toast.error(
        tr("loginRequired", "Please log in as an administrator first.")
      );
      return;
    }

    try {
      setDeletingId(id);

      const response = await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(
        response.data?.message ||
          tr("successDelete", "Category deleted successfully.")
      );

      await getCategories();
    } catch (error) {
      console.error("Delete category error:", error);

      toast.error(
        error.response?.data?.message ||
          tr("errorDelete", "Failed to delete category.")
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredCategories = categories.filter((category) => {
    const keyword = search.trim().toLowerCase();

    return (
      String(category.name_en || "").toLowerCase().includes(keyword) ||
      String(category.name_ar || "").includes(search.trim()) ||
      String(category.slug || "").toLowerCase().includes(keyword)
    );
  });

  const featuredCount = categories.filter(isFeatured).length;

  const renderTextField = ({
    name,
    label,
    placeholder,
    dir = "auto",
    multiline = false,
    required = false,
  }) => (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
        {required ? " *" : ""}
      </label>

      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={form[name]}
          onChange={handleChange}
          rows={4}
          dir={dir}
          placeholder={placeholder}
          className={`${inputClass} resize-y`}
          required={required}
        />
      ) : (
        <input
          id={name}
          name={name}
          value={form[name]}
          onChange={handleChange}
          dir={dir}
          placeholder={placeholder}
          maxLength={255}
          className={inputClass}
          required={required}
        />
      )}
    </div>
  );

  return (
    <div
      dir={direction}
      className="min-h-screen min-w-0 bg-gray-100  text-gray-900  p-5"
    >
      {/* Header */}

      <div className="mb-6 flex min-w-0 flex-col  justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold md:text-3xl">
            {tr("title", "Categories Management")}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {tr("subtitle", "Manage your store categories")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 sm:w-auto"
        >
          <FiPlus size={19} />
          {tr("add", "Add Category")}
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <FiFolder size={25} />
          </div>
          <div>
            <p className="text-sm text-gray-500">
              {tr("total", "Total Categories")}
            </p>
            <h2 className="mt-1 text-2xl font-bold">{categories.length}</h2>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <FiStar size={25} />
          </div>
          <div>
            <p className="text-sm text-gray-500">
              {tr("featuredTotal", "Featured Categories")}
            </p>
            <h2 className="mt-1 text-2xl font-bold">{featuredCount}</h2>
          </div>
        </div>
      </div>

      {/* Search and Refresh */}
      <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <FiSearch
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              isArabic ? "right-4" : "left-4"
            }`}
            size={19}
          />
          <input
            type="text"
            placeholder={tr("search", "Search categories...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} ${isArabic ? "pr-11" : "pl-11"}`}
          />
        </div>

        <button
          type="button"
          onClick={getCategories}
          disabled={loading}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          {tr("refresh", "Refresh")}
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed text-start">
            <thead className="bg-gray-50">
              <tr className="text-sm text-gray-500">
                <th className="w-[7%] px-3 py-4 font-semibold">
                  {tr("id", "ID")}
                </th>
                <th className="w-[18%] px-3 py-4 font-semibold">
                  {tr("nameEn", "English Name")}
                </th>
                <th className="w-[18%] px-3 py-4 font-semibold">
                  {tr("nameAr", "Arabic Name")}
                </th>
                <th className="w-[18%] px-3 py-4 font-semibold">
                  {tr("slug", "Slug")}
                </th>
                <th className="w-[14%] px-3 py-4 font-semibold">
                  {tr("featured", "Featured")}
                </th>
                <th className="w-[25%] px-3 py-4 text-center font-semibold">
                  {tr("actions", "Actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <FiRefreshCw className="mx-auto animate-spin text-2xl" />
                    <p className="mt-2">
                      {tr("loading", "Loading categories...")}
                    </p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    {tr("empty", "No categories found")}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="transition hover:bg-gray-50">
                    <td className="break-words px-3 py-4 text-sm text-gray-500">
                      {category.id}
                    </td>
                    <td
                      dir="ltr"
                      className="break-words px-3 py-4 text-sm font-medium text-gray-800"
                    >
                      {category.name_en || "-"}
                    </td>
                    <td
                      dir="rtl"
                      className="break-words px-3 py-4 text-sm text-gray-700"
                    >
                      {category.name_ar || "-"}
                    </td>
                    <td
                      dir="ltr"
                      className="break-words px-3 py-4 text-sm text-gray-500"
                    >
                      {category.slug || "-"}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          isFeatured(category)
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isFeatured(category)
                          ? tr("yes", "Yes")
                          : tr("no", "No")}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          title={tr("edit", "Edit")}
                          aria-label={tr("edit", "Edit")}
                          className="rounded-lg bg-blue-50 p-2.5 text-blue-600 transition hover:bg-blue-100"
                        >
                          <FiEdit2 size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          disabled={deletingId === category.id}
                          title={tr("delete", "Delete")}
                          aria-label={tr("delete", "Delete")}
                          className="rounded-lg bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === category.id ? (
                            <FiRefreshCw className="animate-spin" size={17} />
                          ) : (
                            <FiTrash2 size={17} />
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
      </div>

      {/* Mobile cards */}
      <div className="grid min-w-0 grid-cols-1 gap-4 md:hidden">
        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
            <FiRefreshCw className="mx-auto animate-spin text-2xl" />
            <p className="mt-2">{tr("loading", "Loading categories...")}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
            {tr("empty", "No categories found")}
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-gray-500">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name_en || "Category"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiFolder size={22} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    dir="ltr"
                    className="break-words text-start font-semibold text-gray-900"
                  >
                    {category.name_en || "-"}
                  </h3>
                  <p
                    dir="rtl"
                    className="mt-1 break-words text-start text-sm text-gray-600"
                  >
                    {category.name_ar || "-"}
                  </p>
                  <p
                    dir="ltr"
                    className="mt-2 break-all text-start text-xs text-gray-400"
                  >
                    {category.slug || "-"}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-gray-400">
                  #{category.id}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    isFeatured(category)
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isFeatured(category)
                    ? tr("featured", "Featured")
                    : tr("notFeatured", "Not Featured")}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    title={tr("edit", "Edit")}
                    aria-label={tr("edit", "Edit")}
                    className="rounded-lg bg-blue-50 p-2.5 text-blue-600 transition hover:bg-blue-100"
                  >
                    <FiEdit2 size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    title={tr("delete", "Delete")}
                    aria-label={tr("delete", "Delete")}
                    className="rounded-lg bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {deletingId === category.id ? (
                      <FiRefreshCw className="animate-spin" size={17} />
                    ) : (
                      <FiTrash2 size={17} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div
          dir={direction}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="my-auto flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  {editingId !== null
                    ? tr("edit", "Edit Category")
                    : tr("add", "Add Category")}
                </h2>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  {editingId !== null
                    ? tr("editSubtitle", "Update category information")
                    : tr("addSubtitle", "Create a new category")}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label={tr("close", "Close")}
                className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                <FiX size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* English fields */}
                  <section
                    dir="ltr"
                    className="min-w-0 space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
                  >
                    <div className="border-b border-gray-200 pb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {tr("english", "English Information")}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {tr("englishHelp", "Enter category details in English")}
                      </p>
                    </div>

                    {renderTextField({
                      name: "name_en",
                      label: tr("nameEn", "English Name"),
                      placeholder: "e.g. Best Sellers",
                      dir: "ltr",
                      required: true,
                    })}

                    {renderTextField({
                      name: "description_en",
                      label: tr("descriptionEn", "English Description"),
                      placeholder: "Category description...",
                      dir: "ltr",
                      multiline: true,
                    })}
                  </section>

                  {/* Arabic fields */}
                  <section
                    dir="rtl"
                    className="min-w-0 space-y-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5"
                  >
                    <div className="border-b border-amber-200 pb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {tr("arabic", "البيانات باللغة العربية")}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {tr("arabicHelp", "أدخل بيانات التصنيف باللغة العربية")}
                      </p>
                    </div>

                    {renderTextField({
                      name: "name_ar",
                      label: tr("nameAr", "الاسم بالعربية"),
                      placeholder: "مثال: الأكثر مبيعًا",
                      dir: "rtl",
                      required: true,
                    })}

                    {renderTextField({
                      name: "description_ar",
                      label: tr("descriptionAr", "الوصف بالعربية"),
                      placeholder: "وصف التصنيف...",
                      dir: "rtl",
                      multiline: true,
                    })}
                  </section>
                </div>

                {/* Shared fields */}
                <div className="space-y-5 rounded-xl border border-gray-200 p-4 sm:p-5">
                  <h3 className="font-bold text-gray-900">
                    {tr("additionalInfo", "Additional Information")}
                  </h3>

                  {renderTextField({
                    name: "slug",
                    label: tr("slug", "Slug"),
                    placeholder: "best-sellers",
                    dir: "ltr",
                  })}

                  <p className="-mt-3 text-xs text-gray-400">
                    {tr("slugHelp", "Used in the category URL.")}
                  </p>

                  <div>
                    <label
                      htmlFor="image_url"
                      className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
                    >
                      <FiImage />
                      {tr("image", "Image URL")}
                    </label>

                    <input
                      id="image_url"
                      type="url"
                      name="image_url"
                      value={form.image_url}
                      onChange={handleChange}
                      dir="ltr"
                      placeholder="https://example.com/category.jpg"
                      className={inputClass}
                    />

                    {form.image_url.trim() && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                        <img
                          src={form.image_url}
                          alt={tr("imagePreview", "Category preview")}
                          className="h-16 w-16 rounded-lg bg-gray-100 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700">
                            {tr("imagePreview", "Image Preview")}
                          </p>
                          <p
                            dir="ltr"
                            className="break-all text-xs text-gray-400"
                          >
                            {form.image_url}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={form.is_featured}
                      onChange={handleChange}
                      className="h-5 w-5 shrink-0 accent-amber-600"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold text-gray-800">
                        {tr("featured", "Featured Category")}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500 sm:text-sm">
                        {tr("featuredHelp", "Show this category in featured sections.")}
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-white p-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiX size={17} />
                  {tr("cancel", "Cancel")}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <FiRefreshCw className="animate-spin" size={17} />
                  ) : (
                    <FiSave size={17} />
                  )}
                  {saving
                    ? tr("saving", "Saving...")
                    : editingId !== null
                    ? tr("update", "Update Category")
                    : tr("save", "Save Category")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
