import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiRefreshCw,
  FiStar,
  FiMessageSquare,
  FiCheckCircle,
  FiTrash2,
  FiEye,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiUser,
  FiGlobe,
  FiCalendar,
  FiHash,
} from "react-icons/fi";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";
const LIMIT = 10;

// ==================== Helpers ====================

const getReviewId = (review) => review?.id ?? review?.review_id;

const getReviewList = (response) => {
  const data = response?.data;

  if (Array.isArray(data?.reviews)) return data.reviews;
  if (Array.isArray(data?.data?.reviews)) return data.data.reviews;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(response?.reviews)) return response.reviews;

  return [];
};

const getPagination = (response) => {
  const data = response?.data;

  const pagination =
    data?.pagination ??
    data?.data?.pagination ??
    response?.pagination ??
    data?.meta ??
    response?.meta ??
    {};

  const total =
    Number(
      pagination?.total ??
        pagination?.total_items ??
        data?.total ??
        data?.data?.total ??
        response?.total ??
        0
    ) || 0;

  const lastPage =
    Number(
      pagination?.last_page ??
        pagination?.lastPage ??
        pagination?.total_pages ??
        pagination?.last_page_number ??
        data?.last_page ??
        data?.data?.last_page ??
        response?.last_page ??
        0
    ) || Math.max(1, Math.ceil(total / LIMIT));

  return {
    total,
    lastPage: Math.max(1, lastPage),
  };
};

const getCustomerName = (review) =>
  review?.reviewer_name ??
  review?.customer?.name ??
  review?.user?.name ??
  review?.user_name ??
  review?.customer_name ??
  review?.name ??
  "Guest";

const getCustomerEmail = (review) =>
  review?.customer?.email ??
  review?.user?.email ??
  review?.email ??
  "";

const getProductName = (review, isArabic = false) =>
  (isArabic
    ? review?.product?.name_ar ?? review?.product?.name_en
    : review?.product?.name_en ?? review?.product?.name) ??
  review?.product?.name ??
  review?.product_name ??
  review?.product?.name_ar ??
  "Unknown product";

const getComment = (review, isArabic = false) =>
  (isArabic
    ? review?.body_ar ?? review?.body_en
    : review?.body_en ?? review?.body_ar) ??
  review?.comment ??
  review?.review ??
  review?.body ??
  "";

const getRating = (review) =>
  Number(review?.rating ?? review?.stars ?? review?.rate ?? 0);

const isApproved = (review) =>
  review?.is_approved === true ||
  review?.is_approved === 1 ||
  review?.approved === true ||
  review?.status === "approved";

const getDate = (review, isArabic = false) => {
  const value = review?.created_at ?? review?.createdAt ?? review?.date;

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(isArabic ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ==================== Styles ====================

const inputClass =
  "w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 sm:px-4";

const secondaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4";

const primaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gray-800 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4";

// ==================== Main Component ====================

export default function AllReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [submittedProductId, setSubmittedProductId] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    lastPage: 1,
  });

  const [selectedReview, setSelectedReview] = useState(null);

  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en"
  );

  const isArabic = language === "ar";

  // ==================== Translations ====================

  const t = {
    title: isArabic ? "مراجعات العملاء" : "Customer Reviews",
    subtitle: isArabic
      ? "إدارة مراجعات العملاء والموافقة عليها"
      : "Manage, review, and approve customer feedback",

    language: isArabic ? "English" : "العربية",
    filters: isArabic ? "البحث والتصفية" : "Search and Filter",
    search: isArabic
      ? "ابحث عن العميل أو المنتج أو التعليق..."
      : "Search customer, product, or comment...",
    productId: isArabic ? "رقم المنتج" : "Product ID",
    searchBtn: isArabic ? "بحث" : "Search",
    reset: isArabic ? "إعادة ضبط" : "Reset",
    refresh: isArabic ? "تحديث" : "Refresh",

    total: isArabic ? "إجمالي المراجعات" : "Total Reviews",
    approved: isArabic ? "المراجعات المقبولة" : "Approved Reviews",
    pending: isArabic ? "المراجعات المعلقة" : "Pending Reviews",

    allReviews: isArabic ? "جميع المراجعات" : "All Reviews",
    customer: isArabic ? "العميل" : "Customer",
    product: isArabic ? "المنتج" : "Product",
    rating: isArabic ? "التقييم" : "Rating",
    review: isArabic ? "التعليق" : "Review",
    status: isArabic ? "الحالة" : "Status",
    actions: isArabic ? "الإجراءات" : "Actions",

    approvedLabel: isArabic ? "مقبولة" : "Approved",
    pendingLabel: isArabic ? "قيد الانتظار" : "Pending",

    loading: isArabic
      ? "جاري تحميل المراجعات..."
      : "Loading reviews...",
    noData: isArabic ? "لا توجد مراجعات" : "No reviews found",
    noDataDesc: isArabic
      ? "جربي تغيير كلمات البحث أو رقم المنتج."
      : "Try changing your search or product filter.",

    previous: isArabic ? "السابق" : "Previous",
    next: isArabic ? "التالي" : "Next",
    page: isArabic ? "صفحة" : "Page",
    of: isArabic ? "من" : "of",
    showing: isArabic ? "عرض" : "Showing",
    results: isArabic ? "نتيجة" : "results",

    details: isArabic ? "تفاصيل المراجعة" : "Review Details",
    close: isArabic ? "إغلاق" : "Close",
    comment: isArabic ? "التعليق" : "Comment",
    noComment: isArabic ? "لا يوجد تعليق" : "No comment provided",
    approve: isArabic ? "قبول المراجعة" : "Approve Review",
    delete: isArabic ? "حذف" : "Delete",
    guest: isArabic ? "زائر" : "Guest",
    unknownProduct: isArabic ? "منتج غير معروف" : "Unknown product",
    reviewId: isArabic ? "رقم المراجعة" : "Review ID",
    date: isArabic ? "التاريخ" : "Date",
    productNumber: isArabic ? "رقم المنتج" : "Product ID",
    email: isArabic ? "البريد الإلكتروني" : "Email",
    confirmDelete: isArabic
      ? "هل أنتِ متأكدة من حذف هذه المراجعة؟"
      : "Are you sure you want to delete this review?",
    missingId: isArabic
      ? "رقم المراجعة غير موجود"
      : "Review ID not found",
    approveSuccess: isArabic
      ? "تم قبول المراجعة بنجاح"
      : "Review approved successfully",
    deleteSuccess: isArabic
      ? "تم حذف المراجعة بنجاح"
      : "Review deleted successfully",
    approveError: isArabic
      ? "فشل قبول المراجعة"
      : "Failed to approve review",
    deleteError: isArabic
      ? "فشل حذف المراجعة"
      : "Failed to delete review",
    loadError: isArabic
      ? "فشل تحميل المراجعات"
      : "Failed to load reviews",
    loginRequired: isArabic
      ? "يرجى تسجيل الدخول بصلاحيات المسؤول"
      : "Please log in with administrator access",
  };

  // ==================== Authentication ====================

  const authHeaders = () => {
    const token = localStorage.getItem("token");

    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  };

  // ==================== Fetch Reviews ====================

  async function getReviews(
    currentPage = 1,
    searchValue = submittedSearch,
    productValue = submittedProductId
  ) {
    setLoading(true);

    try {
      const params = {
        page: currentPage,
        limit: LIMIT,
      };

      if (productValue.trim()) {
        params.product_id = productValue.trim();
      }

      const response = await axios.get(`${API_URL}/reviews`, {
        params,
        headers: authHeaders(),
      });

      const list = getReviewList(response.data);
      const pageInfo = getPagination(response.data);

      setReviews(list);
      setPagination(pageInfo);
      setPage(currentPage);
    } catch (error) {
      console.error(
        "Error fetching reviews:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message || t.loadError
      );

      setReviews([]);
      setPagination({
        total: 0,
        lastPage: 1,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getReviews(1, "", "");
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== Search & Reset ====================

  function handleSearch(event) {
    event.preventDefault();

    const nextSearch = search.trim();
    const nextProductId = productId.trim();

    setSubmittedSearch(nextSearch);
    setSubmittedProductId(nextProductId);

    getReviews(1, nextSearch, nextProductId);
  }

  function handleReset() {
    setSearch("");
    setProductId("");
    setSubmittedSearch("");
    setSubmittedProductId("");

    getReviews(1, "", "");
  }

 
  // ==================== Approve Review ====================

  async function handleApprove(review) {
    const reviewId = getReviewId(review);

    if (!reviewId) {
      toast.error(t.missingId);
      return;
    }

    if (processingId !== null) return;

    try {
      setProcessingId(reviewId);

      await axios.patch(
        `${API_URL}/reviews/admin/${reviewId}/approve`,
        {},
        { headers: authHeaders() }
      );

      toast.success(t.approveSuccess);

      const updateReview = (item) =>
        getReviewId(item) === reviewId
          ? {
              ...item,
              is_approved: true,
              approved: true,
              status: "approved",
            }
          : item;

      setReviews((previous) => previous.map(updateReview));

      setSelectedReview((previous) =>
        previous && getReviewId(previous) === reviewId
          ? {
              ...previous,
              is_approved: true,
              approved: true,
              status: "approved",
            }
          : previous
      );
    } catch (error) {
      console.error(
        "Approve review error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message || t.approveError
      );
    } finally {
      setProcessingId(null);
    }
  }

  // ==================== Delete Review ====================

  async function handleDelete(review) {
    const reviewId = getReviewId(review);

    if (!reviewId) {
      toast.error(t.missingId);
      return;
    }

    if (processingId !== null) return;

    const confirmed = window.confirm(t.confirmDelete);

    if (!confirmed) return;

    try {
      setProcessingId(reviewId);

      await axios.delete(
        `${API_URL}/reviews/admin/${reviewId}`,
        { headers: authHeaders() }
      );

      toast.success(t.deleteSuccess);

      if (getReviewId(selectedReview) === reviewId) {
        setSelectedReview(null);
      }

      const nextPage =
        reviews.length === 1 && page > 1
          ? page - 1
          : page;

      await getReviews(
        nextPage,
        submittedSearch,
        submittedProductId
      );
    } catch (error) {
      console.error(
        "Delete review error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message || t.deleteError
      );
    } finally {
      setProcessingId(null);
    }
  }

  // ==================== Local Search ====================

  const filteredReviews = reviews.filter((review) => {
    const searchValue = submittedSearch.toLowerCase();

    if (!searchValue) return true;

    const searchableText = [
      getCustomerName(review),
      getCustomerEmail(review),
      getProductName(review, isArabic),
      getComment(review, isArabic),
      review?.id,
      review?.review_id,
      review?.user?.email,
      review?.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchValue);
  });

  const approvedCount = reviews.filter(isApproved).length;
  const pendingCount = reviews.length - approvedCount;

  // ==================== Review Card ====================

  const renderReviewCard = (review, index) => {
    const reviewId = getReviewId(review);
    const approved = isApproved(review);
    const rating = getRating(review);
    const comment = getComment(review, isArabic);
    const busy = processingId === reviewId;

    return (
      <article
        key={reviewId ?? index}
        className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white  shadow-sm transition hover:border-gray-300"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600">
              <FiUser size={19} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-sm font-semibold text-gray-900">
                {getCustomerName(review)}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                #{reviewId ?? "—"}
              </p>
            </div>
          </div>

          <StatusBadge approved={approved} t={t} />
        </div>

        <div className="my-4 border-t border-gray-100" />

        <div className="space-y-4">
          <div className="flex min-w-0 items-start gap-2.5">
            <FiPackage className="mt-0.5 shrink-0 text-gray-400" size={17} />

            <div className="min-w-0">
              <p className="mb-1 text-xs text-gray-400">{t.product}</p>
              <p className="break-words text-sm font-medium text-gray-700">
                {getProductName(review, isArabic)}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-400">{t.rating}</p>

            <div className="flex flex-wrap items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  size={16}
                  className={
                    star <= rating
                      ? "fill-gray-500 text-gray-600"
                      : "text-gray-300"
                  }
                />
              ))}

              <span className="ms-1 text-sm font-semibold text-gray-800">
                {rating || "—"} / 5
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-1.5 text-xs text-gray-400">{t.review}</p>

            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
              {comment || t.noComment}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FiCalendar size={14} />
            <span>{getDate(review, isArabic)}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            title={t.details}
            onClick={() => setSelectedReview(review)}
            className={`${secondaryButton} min-w-0 flex-1`}
          >
            <FiEye size={16} />
            {t.details}
          </button>

          {!approved && (
            <button
              type="button"
              title={t.approve}
              aria-label={t.approve}
              disabled={processingId !== null}
              onClick={() => handleApprove(review)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
            >
              <FiCheckCircle size={17} />
            </button>
          )}

          <button
            type="button"
            title={t.delete}
            aria-label={t.delete}
            disabled={processingId !== null}
            onClick={() => handleDelete(review)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
          >
            {busy ? (
              <Spinner />
            ) : (
              <FiTrash2 size={16} />
            )}
          </button>
        </div>
      </article>
    );
  };

  // ==================== Main UI ====================

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
      className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-100 p-3 text-gray-800 sm:p-5 lg:p-7"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 sm:space-y-6">

        {/* Header */}
        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm">
              <FiMessageSquare size={22} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                {t.title}
              </h1>

              <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                {t.subtitle}
              </p>
            </div>
          </div>

       
        </header>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label={t.total}
            value={pagination.total}
            icon={<FiMessageSquare size={20} />}
          />

          <StatCard
            label={t.approved}
            value={approvedCount}
            icon={<FiCheckCircle size={20} />}
          />

          <StatCard
            label={t.pending}
            value={pendingCount}
            icon={<FiStar size={20} />}
          />
        </section>

        {/* Search and Filters */}
        <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <FiSearch size={18} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                {t.filters}
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                {t.searchBtn}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_auto_auto]"
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              className={inputClass}
            />

            <input
              type="number"
              min="1"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              placeholder={t.productId}
              aria-label={t.productId}
              className={inputClass}
            />

            <button
              type="submit"
              disabled={loading}
              className={`${primaryButton} w-full xl:w-auto`}
            >
              <FiSearch size={16} />
              {t.searchBtn}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className={`${secondaryButton} w-full xl:w-auto`}
            >
              <FiX size={16} />
              {t.reset}
            </button>
          </form>
        </section>

        {/* Reviews Section */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900">
                {t.allReviews}
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                {pagination.total} {t.total.toLowerCase()}
              </p>
            </div>

            <span className="w-fit rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
              {t.page} {page} {t.of} {pagination.lastPage}
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 py-12">
              <Spinner large />
              <p className="text-sm text-gray-500">{t.loading}</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-400">
                <FiMessageSquare size={28} />
              </div>

              <h3 className="font-semibold text-gray-800">
                {t.noData}
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
                {t.noDataDesc}
              </p>

              <button
                type="button"
                onClick={() =>
                  getReviews(page, submittedSearch, submittedProductId)
                }
                className={`${secondaryButton} mt-4`}
              >
                <FiRefreshCw size={15} />
                {t.refresh}
              </button>
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table */}
              <div className="hidden w-full overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-start text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        {t.customer}
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        {t.product}
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        {t.rating}
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        {t.review}
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        {t.status}
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredReviews.map((review, index) => {
                      const reviewId = getReviewId(review);
                      const approved = isApproved(review);
                      const rating = getRating(review);
                      const comment = getComment(review, isArabic);
                      const busy = processingId === reviewId;

                      return (
                        <tr
                          key={reviewId ?? index}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500">
                                <FiUser size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-44 break-words font-medium text-gray-800">
                                  {getCustomerName(review)}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  #{reviewId ?? "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <FiPackage
                                className="shrink-0 text-gray-400"
                                size={16}
                              />

                              <span className="max-w-44 break-words text-gray-700">
                                {getProductName(review, isArabic)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <FiStar
                                className="shrink-0 fill-amber-500 text-amber-500"
                                size={16}
                              />

                              <span className="font-semibold text-gray-800">
                                {rating || "—"}
                              </span>

                              <span className="text-xs text-gray-400">
                                / 5
                              </span>
                            </div>
                          </td>

                          <td className="max-w-56 px-5 py-4">
                            <p
                              className="break-words text-gray-600"
                              title={comment}
                            >
                              {comment || t.noComment}
                            </p>
                          </td>

                          <td className="px-5 py-4 ">
                            <StatusBadge  approved={approved} t={t} />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 ">
                              <ActionButton
                                title={t.details}
                                onClick={() => setSelectedReview(review)}
                              >
                                <FiEye size={16} className='text-blue-500 cursor-pointer' />
                              </ActionButton>

                              {!approved && (
                                <ActionButton
                                  title={t.approve}
                                  disabled={processingId !== null}
                                  onClick={() => handleApprove(review)}
                                >
                                  <FiCheckCircle  size={16} />
                                </ActionButton>
                              )}

                              <ActionButton
                                title={t.delete}
                                disabled={processingId !== null}
                                onClick={() => handleDelete(review)}
                              >
                                {busy ? (
                                  <Spinner />
                                ) : (
                                  <FiTrash2  className='text-red-500 cursor-pointer' size={16} />
                                )}
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Review Cards */}
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 md:hidden">
                {filteredReviews.map(renderReviewCard)}
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-center text-sm text-gray-500 sm:text-start">
                  {t.page}{" "}
                  <span className="font-semibold text-gray-800">
                    {page}
                  </span>{" "}
                  {t.of}{" "}
                  <span className="font-semibold text-gray-800">
                    {pagination.lastPage}
                  </span>
                </p>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() =>
                      getReviews(
                        page - 1,
                        submittedSearch,
                        submittedProductId
                      )
                    }
                    className={`${secondaryButton} w-full sm:w-auto`}
                  >
                    {isArabic ? (
                      <FiChevronRight size={16} />
                    ) : (
                      <FiChevronLeft size={16} />
                    )}

                    {t.previous}
                  </button>

                  <button
                    type="button"
                    disabled={page >= pagination.lastPage || loading}
                    onClick={() =>
                      getReviews(
                        page + 1,
                        submittedSearch,
                        submittedProductId
                      )
                    }
                    className={`${secondaryButton} w-full sm:w-auto`}
                  >
                    {t.next}

                    {isArabic ? (
                      <FiChevronLeft size={16} />
                    ) : (
                      <FiChevronRight size={16} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/50 p-3 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReview(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h2
                  id="review-modal-title"
                  className="text-lg font-bold text-gray-900"
                >
                  {t.details}
                </h2>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  {t.reviewId}: {getReviewId(selectedReview) ?? "—"}
                </p>
              </div>

              <button
                type="button"
                aria-label={t.close}
                onClick={() => setSelectedReview(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[65dvh] space-y-5 overflow-y-auto p-4 sm:max-h-[70dvh] sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailCard
                  icon={<FiUser size={16} />}
                  label={t.customer}
                  value={getCustomerName(selectedReview)}
                />

                <DetailCard
                  icon={<FiPackage size={16} />}
                  label={t.product}
                  value={getProductName(selectedReview, isArabic)}
                />
              </div>

              {getCustomerEmail(selectedReview) && (
                <DetailCard
                  icon={<FiGlobe size={16} />}
                  label={t.email}
                  value={getCustomerEmail(selectedReview)}
                />
              )}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-medium text-gray-500">
                  {t.rating}
                </p>

                <div className="flex flex-wrap items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      size={21}
                      className={
                        star <= getRating(selectedReview)
                          ? "fill-gray-500 text-gray-600"
                          : "text-gray-300"
                      }
                    />
                  ))}

                  <span className="ms-2 font-semibold text-gray-800">
                    {getRating(selectedReview)} / 5
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  {t.comment}
                </p>

                <div className="min-h-24 whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-700">
                  {getComment(selectedReview, isArabic) || t.noComment}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailCard
                  icon={<FiHash size={16} />}
                  label={t.productNumber}
                  value={
                    selectedReview?.product_id ??
                    selectedReview?.product?.id ??
                    "—"
                  }
                />

                <DetailCard
                  icon={<FiCalendar size={16} />}
                  label={t.date}
                  value={getDate(selectedReview, isArabic)}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  {t.status}
                </p>

                <StatusBadge
                  approved={isApproved(selectedReview)}
                  t={t}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className={secondaryButton}
              >
                {t.close}
              </button>

              {!isApproved(selectedReview) && (
                <button
                  type="button"
                  disabled={processingId !== null}
                  onClick={() => handleApprove(selectedReview)}
                  className={primaryButton}
                >
                  <FiCheckCircle size={16} />
                  {t.approve}
                </button>
              )}

              <button
                type="button"
                disabled={processingId !== null}
                onClick={() => handleDelete(selectedReview)}
                className={secondaryButton}
              >
                <FiTrash2 size={16} />
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Reusable Components ====================

function StatCard({ label, value, icon }) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium leading-6 text-gray-500">
          {label}
        </p>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 break-words text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ approved, t }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
        approved
          ? "border border-gray-200 bg-gray-200 text-gray-800"
          : "border border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          approved ? "bg-gray-700" : "bg-gray-400"
        }`}
      />

      {approved ? t.approvedLabel : t.pendingLabel}
    </span>
  );
}

function ActionButton({ title, onClick, disabled = false, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function DetailCard({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
        {icon}
        <span>{label}</span>
      </div>

      <p className="break-words text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Spinner({ large = false }) {
  return (
    <span
      className={`block shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800 ${
        large ? "h-9 w-9 border-4" : "h-4 w-4"
      }`}
    />
  );
}
