
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiEye,
  FiTruck,
  FiX,
  FiSave,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";
const LIMIT = 20;

const STATUSES = [
  "pending",
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];

const emptyShippingForm = {
  status: "shipped",
  tracking_number: "",
  shipping_company: "",
  note: "",
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

/* =========================
   Statistics Card
========================= */

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="  items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-500">
            {title}
          </p>

         
        </div>
       
        <div className='flex  items-center justify-between gap-3 '>
  
         <h3 className="text-xl font-bold tracking-tight text-gray-900">
            {Number(value || 0).toLocaleString()}
          </h3>
  
  <div className="flex  size-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Icon size={15} />
        </div>




        </div>

      

      </div>
    </div>
  );
}

export default function AllOrders() {
  const { t, i18n } = useTranslation();

  const isArabic = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  ).startsWith("ar");

  const dir = isArabic ? "rtl" : "ltr";
  const locale = isArabic ? "ar-EG" : "en-GB";

  const tr = (key, fallback) =>
    t(`adminOrders.${key}`, { defaultValue: fallback });

  /* =========================
     States
  ========================= */

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    lastPage: 1,
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingOrder, setShippingOrder] = useState(null);

  const [shippingForm, setShippingForm] = useState(
    emptyShippingForm
  );

  const [actionId, setActionId] = useState(null);

  /* =========================
     Authentication
  ========================= */

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  };

  /* =========================
     Get All Orders
  ========================= */

  const getOrders = useCallback(
    async (currentPage = 1) => {
      setLoading(true);

      try {
        const response = await axios.get(
          `${API_URL}/orders/admin/all`,
          {
            params: {
              page: currentPage,
              limit: LIMIT,
            },
            ...getAuthConfig(),
          }
        );

        const result = response?.data;
        const data = result?.data;

        const ordersData = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(result?.orders)
          ? result.orders
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const paginationData =
          data?.pagination ||
          result?.pagination ||
          data?.meta ||
          result?.meta ||
          {};

        const total = Number(
          paginationData.total ??
            paginationData.total_items ??
            paginationData.totalItems ??
            result?.total ??
            ordersData.length
        );

        const lastPage = Math.max(
          1,
          Number(
            paginationData.last_page ??
              paginationData.lastPage ??
              paginationData.last_page_number ??
              Math.ceil(total / LIMIT) ??
              1
          )
        );

        setOrders(ordersData);

        setPagination({
          total,
          lastPage,
        });
      } catch (error) {
        console.error("Get orders error:", error);

        toast.error(
          error?.response?.data?.message ||
            tr("loadError", "Failed to load orders")
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [isArabic]
  );

  useEffect(() => {
    getOrders(page);
  }, [page, getOrders]);

  /* =========================
     Format Helpers
  ========================= */

  const formatPrice = (price) => {
    const amount = Number(price ?? 0);

    return `${amount.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} SAR`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /* =========================
     Order Status
  ========================= */

  const statusText = (status) => {
    if (!status) return "—";

    const key = String(status).toLowerCase();

    const statusLabels = {
      pending: tr("statusPending", "Pending"),
      processing: tr("statusProcessing", "Processing"),
      confirmed: tr("statusConfirmed", "Confirmed"),
      shipped: tr("statusShipped", "Shipped"),
      delivered: tr("statusDelivered", "Delivered"),
      completed: tr("statusCompleted", "Completed"),
      cancelled: tr("statusCancelled", "Cancelled"),
      canceled: tr("statusCancelled", "Cancelled"),
      paid: tr("statusPaid", "Paid"),
      failed: tr("statusFailed", "Failed"),
      refunded: tr("statusRefunded", "Refunded"),
    };

    return statusLabels[key] || status;
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      ["completed", "delivered", "paid"].includes(value)
    ) {
      return "bg-green-50 text-green-700 ring-1 ring-inset ring-green-100";
    }

    if (
      ["cancelled", "canceled", "failed", "refunded"].includes(
        value
      )
    ) {
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100";
    }

    if (
      [
        "pending",
        "processing",
        "confirmed",
        "shipped",
      ].includes(value)
    ) {
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100";
    }

    return "bg-gray-100 text-gray-700";
  };

  /* =========================
     Order Information
  ========================= */

  const orderTotal = (order) =>
    order?.total ??
    order?.total_amount ??
    order?.grand_total ??
    0;

  const customerName = (order) =>
    order?.user?.name ||
    order?.customer?.name ||
    order?.customer_name ||
    order?.name ||
    "—";

  const customerEmail = (order) =>
    order?.user?.email ||
    order?.customer?.email ||
    order?.customer_email ||
    order?.email ||
    "—";

  const orderNumber = (order) =>
    order?.order_number ||
    order?.order_no ||
    order?.number ||
    `#${order?.id ?? "—"}`;

  /* =========================
     Order Statistics
  ========================= */

  const countStatus = (...statuses) =>
    orders.filter((order) =>
      statuses.includes(
        String(order?.status || "").toLowerCase()
      )
    ).length;

  const totalOrders = pagination.total || orders.length;

  const pendingCount = countStatus("pending");

  const processingCount = countStatus(
    "processing",
    "confirmed"
  );

  const shippedCount = countStatus("shipped");

  const deliveredCount = countStatus(
    "delivered",
    "completed"
  );

  const cancelledCount = countStatus(
    "cancelled",
    "canceled"
  );

  /* =========================
     Search
  ========================= */

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    const values = [
      order?.id,
      order?.order_number,
      order?.order_no,
      order?.status,
      order?.payment_status,
      order?.payment_method,
      customerName(order),
      customerEmail(order),
    ];

    return values.some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(query)
    );
  });

  /* =========================
     Update Order Status
  ========================= */

  const openShippingForm = (order) => {
    setShippingOrder(order);

    setShippingForm({
      status: "shipped",
      tracking_number: order?.tracking_number || "",
      shipping_company: order?.shipping_company || "",
      note: "",
    });
  };

  const updateOrderStatus = async (orderId, payload) => {
    setActionId(orderId);

    try {
      await axios.patch(
        `${API_URL}/orders/admin/${orderId}/status`,
        payload,
        getAuthConfig()
      );

      toast.success(
        tr(
          "updateSuccess",
          "Order status updated successfully"
        )
      );

      setShippingOrder(null);
      setSelectedOrder(null);
      setShippingForm(emptyShippingForm);

      await getOrders(page);
    } catch (error) {
      console.error("Update order status error:", error);

      toast.error(
        error?.response?.data?.message ||
          tr("updateError", "Failed to update order status")
      );
    } finally {
      setActionId(null);
    }
  };

  const handleStatusChange = (order, status) => {
    if (status === "shipped") {
      openShippingForm(order);
      return;
    }

    updateOrderStatus(order.id, {
      status,
      tracking_number: order?.tracking_number || "",
      shipping_company: order?.shipping_company || "",
      note: "",
    });
  };

  /* =========================
     Shipping Form
  ========================= */

  const submitShippingForm = (event) => {
    event.preventDefault();

    if (
      !shippingForm.tracking_number.trim() ||
      !shippingForm.shipping_company.trim()
    ) {
      toast.error(
        tr(
          "enterShippingInfo",
          "Please enter the tracking number and shipping company"
        )
      );

      return;
    }

    if (!shippingOrder?.id) return;

    updateOrderStatus(shippingOrder.id, {
      status: shippingForm.status,
      tracking_number: shippingForm.tracking_number.trim(),
      shipping_company: shippingForm.shipping_company.trim(),
      note: shippingForm.note.trim(),
    });
  };

  /* =========================
     Order Items
  ========================= */

  const getItems = (order) => {
    if (Array.isArray(order?.items)) return order.items;

    if (Array.isArray(order?.order_items)) {
      return order.order_items;
    }

    if (Array.isArray(order?.products)) {
      return order.products;
    }

    return [];
  };

  const getItemName = (item) =>
    item?.product?.name_en ||
    item?.product?.name_ar ||
    item?.product_name ||
    item?.name ||
    tr("product", "Product");

  const getItemQuantity = (item) =>
    item?.quantity ?? item?.qty ?? 1;

  const getItemPrice = (item) =>
    item?.unit_price ??
    item?.price ??
    item?.total ??
    0;

  /* =========================
     Pagination
  ========================= */

  const goToPreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const goToNextPage = () => {
    setPage((current) =>
      Math.min(pagination.lastPage, current + 1)
    );
  };

  /* =========================
     Details Component
  ========================= */

  const Detail = ({ label, value }) => (
    <div className="min-w-0 rounded-xl bg-gray-50 p-3">
      <p className="mb-1 text-xs text-gray-500">
        {label}
      </p>

      <p className="break-words text-sm font-medium text-gray-800">
        {value ?? "—"}
      </p>
    </div>
  );

  /* =========================
     Render
  ========================= */

  return (
    <div
      dir={dir}
      className="min-w-0 w-full space-y-4 p-5  text-gray-900"
    >
      {/* Header */}

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {tr("title", "All Orders")}
          </h1>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            {tr(
              "subtitle",
              "Manage customer orders, payments, and shipping."
            )}
          </p>
        </div>
      </div>

      {/* Order Statistics */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          title={isArabic ? "إجمالي الطلبات" : "Total Orders"}
          value={totalOrders}
          icon={FiShoppingBag}
        />

        <StatCard
          title={isArabic ? "طلبات معلقة" : "Pending Orders"}
          value={pendingCount}
          icon={FiClock}
        />

        <StatCard
          title={isArabic ? "قيد التجهيز" : "Processing Orders"}
          value={processingCount}
          icon={FiRefreshCw}
        />

        <StatCard
          title={isArabic ? "طلبات تم شحنها" : "Shipped Orders"}
          value={shippedCount}
          icon={FiTruck}
        />

        <StatCard
          title={isArabic ? "طلبات تم تسليمها" : "Delivered Orders"}
          value={deliveredCount}
          icon={FiCheckCircle}
        />

        <StatCard
          title={isArabic ? "طلبات ملغاة" : "Cancelled Orders"}
          value={cancelledCount}
          icon={FiXCircle}
        />
      </div>

      {/* Search and Refresh */}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative grow">
          <FiSearch
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              isArabic ? "right-3" : "left-3"
            }`}
            size={18}
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tr(
              "searchPlaceholder",
              "Search by order number, customer, email, or status..."
            )}
            className={`${inputClass} ${
              isArabic ? "pr-10 pl-4" : "pl-10 pr-4"
            }`}
          />
        </div>

        <button
          type="button"
          onClick={() => getOrders(page)}
          disabled={loading}
          className={`${secondaryButton} w-full shrink-0 sm:w-auto`}
        >
          <FiRefreshCw
            className={loading ? "animate-spin" : ""}
            size={17}
          />
          {tr("refresh", "Refresh")}
        </button>
      </div>

      {/* Orders Heading */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
            <FiShoppingBag size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              {tr("ordersList", "Orders List")}
            </h2>

            <p className="text-xs text-gray-500">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? tr("order", "order")
                : tr("orders", "orders")}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          {tr("page", "Page")} {page} {tr("of", "of")}{" "}
          {pagination.lastPage}
        </p>
      </div>

      {/* Desktop Table */}

{/* Desktop Table - No Horizontal Scroll */}

<div className="hidden min-w-0 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
  <table className="w-full table-fixed border-collapse text-center text-xs lg:text-sm">
    <thead className="bg-gray-50 text-gray-600">
      <tr>
        <th className="w-[6%] border-b border-gray-200 px-1 py-4 font-semibold">
          {tr("orderId", "ID")}
        </th>
        <th className="w-[11%] border-b border-gray-200 px-1 py-4 font-semibold">
          {tr("orderNumber", "Order Number")}
        </th>
        <th className="w-[16%] border-b border-gray-200 px-2 py-4 font-semibold">
          {tr("customer", "Customer")}
        </th>
        <th className="w-[10%] border-b border-gray-200 px-1 py-4 font-semibold">
          {tr("total", "Total")}
        </th>
        <th className="w-[11%] border-b border-gray-200 px-1 py-4 font-semibold">
          {tr("payment", "Payment")}
        </th>
        <th className="w-[10%] border-b border-gray-200 px-1 py-4 font-semibold">
          {tr("status", "Status")}
        </th>
        <th className="w-[14%] border-b border-gray-200 px-1 py-4 font-semibold">
          {tr("updateStatus", "Update Status")}
        </th>
        <th className="w-[12%] border-b border-gray-200 px-1 py-4 font-semibold">
          {tr("date", "Date")}
        </th>
        <th className="w-[6%] border-b border-gray-200 px-1 py-4 font-semibold">
          {tr("details", "Details")}
        </th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-100">
      {loading ? (
        <tr>
          <td colSpan={9} className="py-14 text-center text-gray-500">
            <FiRefreshCw className="mx-auto mb-3 animate-spin" size={22} />
            {tr("loading", "Loading orders...")}
          </td>
        </tr>
      ) : filteredOrders.length === 0 ? (
        <tr>
          <td colSpan={9} className="py-14 text-center">
            <FiPackage className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="font-medium text-gray-700">
              {tr("empty", "No orders found")}
            </p>
          </td>
        </tr>
      ) : (
        filteredOrders.map((order) => (
          <tr key={order.id} className="transition hover:bg-gray-50">
            <td className="break-words px-1 py-4 font-medium text-gray-700">
              #{order.id}
            </td>

            <td className="break-words px-1 py-4 font-medium text-gray-900">
              {orderNumber(order)}
            </td>

            <td className="min-w-0 px-2 py-4">
              <p className="break-words font-medium text-gray-800">
                {customerName(order)}
              </p>
              <p className="mt-1 break-all text-[10px] text-gray-500 lg:text-xs">
                {customerEmail(order)}
              </p>
            </td>

            <td className="break-words px-1 py-4 font-semibold text-gray-900">
              {formatPrice(orderTotal(order))}
            </td>

            <td className="break-words px-1 py-4">
              <p className="text-gray-700">
                {order.payment_method || "—"}
              </p>
              {order.payment_status && (
                <p className="mt-1 break-words text-[10px] text-gray-400">
                  {statusText(order.payment_status)}
                </p>
              )}
            </td>

            <td className="px-1 py-4">
              <span
                className={`inline-flex max-w-full justify-center whitespace-normal break-words rounded-full px-2 py-1 text-[10px] lg:text-xs ${getStatusClass(order.status)}`}
              >
                {statusText(order.status)}
              </span>
            </td>

            <td className="px-1 py-4">
              <select
                aria-label={tr("updateStatus", "Update Status")}
                value={order.status || "pending"}
                disabled={actionId === order.id}
                onChange={(event) =>
                  handleStatusChange(order, event.target.value)
                }
                className="w-full min-w-0 rounded-lg border border-gray-200 bg-white px-1 py-2 text-[10px] outline-none focus:border-gray-400 disabled:opacity-50 lg:text-xs"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusText(status)}
                  </option>
                ))}
              </select>

              {actionId === order.id && (
                <FiRefreshCw
                  className="mx-auto mt-1 animate-spin text-gray-400"
                  size={13}
                />
              )}
            </td>

            <td className="break-words px-1 py-4 text-gray-500">
              {formatDate(order.created_at || order.createdAt)}
            </td>

            <td className="px-1 py-4">
              <button
                type="button"
                onClick={() => setSelectedOrder(order)}
                aria-label={tr("details", "Details")}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <FiEye size={15} />
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      {/* Mobile Order Cards */}

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            <FiRefreshCw
              className="mx-auto mb-3 animate-spin"
              size={22}
            />
            {tr("loading", "Loading orders...")}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <FiPackage
              className="mx-auto mb-3 text-gray-300"
              size={32}
            />

            <p className="font-medium text-gray-700">
              {tr("empty", "No orders found")}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {tr("trySearch", "Try another search term.")}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <article
              key={order.id}
              className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    {tr("orderNumber", "Order Number")}
                  </p>

                  <h3 className="mt-1 break-words font-semibold text-gray-900">
                    {orderNumber(order)}
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    #{order.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <FiEye size={16} />
                  {tr("details", "Details")}
                </button>
              </div>

              <div className="my-4 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                <div className="min-w-0">
                  <p className="mb-1 text-xs text-gray-500">
                    {tr("customer", "Customer")}
                  </p>

                  <p className="break-words text-sm font-medium text-gray-800">
                    {customerName(order)}
                  </p>

                  <p className="mt-1 break-all text-xs text-gray-500">
                    {customerEmail(order)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-gray-500">
                    {tr("total", "Total")}
                  </p>

                  <p className="font-semibold text-gray-900">
                    {formatPrice(orderTotal(order))}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(
                      order.created_at || order.createdAt
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 py-3">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClass(
                    order.status
                  )}`}
                >
                  {statusText(order.status)}
                </span>

                {order.payment_method && (
                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
                    {order.payment_method}
                  </span>
                )}

                {order.payment_status && (
                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
                    {statusText(order.payment_status)}
                  </span>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {tr("updateStatus", "Update Status")}
                </label>

                <select
                  value={order.status || "pending"}
                  disabled={actionId === order.id}
                  onChange={(event) =>
                    handleStatusChange(
                      order,
                      event.target.value
                    )
                  }
                  className={inputClass}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusText(status)}
                    </option>
                  ))}
                </select>

                {actionId === order.id && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <FiRefreshCw className="animate-spin" />
                    {tr("updating", "Updating order...")}
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination */}

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-sm text-gray-500 sm:text-start">
          {tr("page", "Page")} {page} {tr("of", "of")}{" "}
          {pagination.lastPage}

          {pagination.total > 0 && (
            <span>
              {" "}
              · {pagination.total}{" "}
              {tr("totalOrders", "total orders")}
            </span>
          )}
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={page <= 1 || loading}
            className={secondaryButton}
          >
            {isArabic ? (
              <FiChevronRight size={17} />
            ) : (
              <FiChevronLeft size={17} />
            )}

            {tr("previous", "Previous")}
          </button>

          <button
            type="button"
            onClick={goToNextPage}
            disabled={page >= pagination.lastPage || loading}
            className={secondaryButton}
          >
            {tr("next", "Next")}

            {isArabic ? (
              <FiChevronLeft size={17} />
            ) : (
              <FiChevronRight size={17} />
            )}
          </button>
        </div>
      </div>

      {/* Order Details Modal */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h2
                  id="order-details-title"
                  className="text-lg font-bold text-gray-900"
                >
                  {tr("orderDetails", "Order Details")}
                </h2>

                <p className="mt-1 break-words text-sm text-gray-500">
                  {orderNumber(selectedOrder)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label={tr("close", "Close")}
                className="shrink-0 rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <FiX size={21} />
              </button>
            </div>

            <div className="space-y-5 p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                <Detail
                  label={tr("customer", "Customer")}
                  value={customerName(selectedOrder)}
                />

                <Detail
                  label={tr("email", "Email")}
                  value={customerEmail(selectedOrder)}
                />

                <Detail
                  label={tr("orderStatus", "Order Status")}
                  value={statusText(selectedOrder.status)}
                />

                <Detail
                  label={tr("paymentMethod", "Payment Method")}
                  value={selectedOrder.payment_method}
                />

                <Detail
                  label={tr("paymentStatus", "Payment Status")}
                  value={statusText(selectedOrder.payment_status)}
                />

                <Detail
                  label={tr("total", "Total")}
                  value={formatPrice(orderTotal(selectedOrder))}
                />

                <Detail
                  label={tr("trackingNumber", "Tracking Number")}
                  value={selectedOrder.tracking_number}
                />

                <Detail
                  label={tr("shippingCompany", "Shipping Company")}
                  value={selectedOrder.shipping_company}
                />

                <Detail
                  label={tr("orderDate", "Order Date")}
                  value={formatDate(
                    selectedOrder.created_at ||
                      selectedOrder.createdAt
                  )}
                />
              </div>

              {/* Order Items */}

              <section>
                <h3 className="mb-3 font-semibold text-gray-900">
                  {tr("orderItems", "Order Items")}
                </h3>

                {getItems(selectedOrder).length > 0 ? (
                  <div className="space-y-3">
                    {getItems(selectedOrder).map((item, index) => (
                      <div
                        key={item.id || item.product_id || index}
                        className="flex min-w-0 flex-col gap-2 rounded-xl border border-gray-100 p-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <FiPackage size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium text-gray-800">
                              {getItemName(item)}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {tr("quantity", "Quantity")}:{" "}
                              {getItemQuantity(item)}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-gray-900 min-[420px]:ps-0">
                          {formatPrice(getItemPrice(item))}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                    {tr(
                      "noItems",
                      "No order items available."
                    )}
                  </p>
                )}
              </section>

              {/* Order Notes */}

              {selectedOrder.notes && (
                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {tr("orderNotes", "Order Notes")}
                  </h3>

                  <p className="whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                    {selectedOrder.notes}
                  </p>
                </section>
              )}

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className={`${secondaryButton} w-full`}
              >
                {tr("close", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}

      {shippingOrder && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShippingOrder(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipping-title"
            className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <FiTruck size={20} />
                </div>

                <div className="min-w-0">
                  <h2
                    id="shipping-title"
                    className="font-bold text-gray-900"
                  >
                    {tr("shippingDetails", "Shipping Details")}
                  </h2>

                  <p className="mt-1 break-words text-xs text-gray-500">
                    {tr("order", "Order")} #{shippingOrder.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShippingOrder(null)}
                aria-label={tr("close", "Close")}
                className="shrink-0 rounded-xl p-2 text-gray-500 hover:bg-gray-100"
              >
                <FiX size={21} />
              </button>
            </div>

            <form
              onSubmit={submitShippingForm}
              className="space-y-4 p-4 sm:p-6"
            >
              {/* Status */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {tr("status", "Status")}
                </label>

                <select
                  value={shippingForm.status}
                  onChange={(event) =>
                    setShippingForm((previous) => ({
                      ...previous,
                      status: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusText(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tracking Number */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {tr("trackingNumber", "Tracking Number")}
                </label>

                <input
                  type="text"
                  value={shippingForm.tracking_number}
                  onChange={(event) =>
                    setShippingForm((previous) => ({
                      ...previous,
                      tracking_number: event.target.value,
                    }))
                  }
                  placeholder={tr(
                    "trackingPlaceholder",
                    "e.g. AE9876543210"
                  )}
                  className={inputClass}
                  required
                />
              </div>

              {/* Shipping Company */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {tr("shippingCompany", "Shipping Company")}
                </label>

                <input
                  type="text"
                  value={shippingForm.shipping_company}
                  onChange={(event) =>
                    setShippingForm((previous) => ({
                      ...previous,
                      shipping_company: event.target.value,
                    }))
                  }
                  placeholder={tr(
                    "companyPlaceholder",
                    "e.g. Aramex"
                  )}
                  className={inputClass}
                  required
                />
              </div>

              {/* Note */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {tr("note", "Note")}
                </label>

                <textarea
                  value={shippingForm.note}
                  onChange={(event) =>
                    setShippingForm((previous) => ({
                      ...previous,
                      note: event.target.value,
                    }))
                  }
                  placeholder={tr(
                    "notePlaceholder",
                    "Add a shipping note..."
                  )}
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Actions */}

              <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShippingOrder(null)}
                  className={secondaryButton}
                >
                  {tr("cancel", "Cancel")}
                </button>

                <button
                  type="submit"
                  disabled={actionId === shippingOrder.id}
                  className={primaryButton}
                >
                  {actionId === shippingOrder.id ? (
                    <FiRefreshCw
                      className="animate-spin"
                      size={17}
                    />
                  ) : (
                    <FiSave size={17} />
                  )}

                  {actionId === shippingOrder.id
                    ? tr("saving", "Saving...")
                    : tr("saveShipping", "Save Shipping")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
