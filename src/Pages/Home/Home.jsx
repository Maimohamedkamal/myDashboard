
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiDollarSign,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiAlertCircle,
  FiPlus,
  FiRefreshCw,
  FiBarChart2,
  FiArrowUpRight,
  FiAlertTriangle,
  FiGlobe,
} from "react-icons/fi";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";
const ORDER_LIMIT = 20;
const PRODUCT_LIMIT = 100;
const CUSTOMER_LIMIT = 100;

const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Normalize common API response structures.
function getList(response, resource) {
  const body = response?.data;

  const candidates = [
    body?.[resource],
    body?.data?.[resource],
    body?.data?.data?.[resource],
    body?.data,
    body?.data?.data,
    body,
  ];

  return candidates.find(Array.isArray) || [];
}

// Prefer the server's total count over the current page length.
function getTotal(response, list, resource) {
  const body = response?.data;

  const candidates = [
    body?.pagination?.total,
    body?.meta?.total,
    body?.total,
    body?.total_count,
    body?.totalCount,
    body?.data?.pagination?.total,
    body?.data?.meta?.total,
    body?.data?.total,
    body?.data?.total_count,
    body?.data?.totalCount,
    body?.data?.data?.pagination?.total,
    body?.data?.data?.total,
    body?.[resource]?.total,
    body?.data?.[resource]?.total,
  ];

  const total = candidates.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      Number.isFinite(Number(value))
  );

  return total !== undefined ? Number(total) : list.length;
}

function getStock(product) {
  return Number(product?.stock_qty ?? product?.stock ?? 0);
}

function getStockThreshold(product) {
  return Math.max(
    1,
    Number(product?.low_stock_alert ?? product?.low_stock_threshold ?? 5)
  );
}

function getOrderAmount(order) {
  const value =
    order?.total_amount ??
    order?.grand_total ??
    order?.total ??
    order?.final_total;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function getOrderStatus(order) {
  return String(
    order?.status ?? order?.order_status ?? "unknown"
  ).toLowerCase();
}

function getOrderId(order, index = 0) {
  return (
    order?.order_number ??
    order?.order_code ??
    order?.id ??
    index + 1
  );
}

function getCustomerName(order) {
  return (
    order?.customer?.name ??
    order?.user?.name ??
    order?.customer_name ??
    order?.user_name ??
    order?.shipping_address?.name ??
    order?.address?.name ??
    "—"
  );
}

function formatNumber(value, language) {
  return Number(value || 0).toLocaleString(
    language === "ar" ? "ar-EG" : "en-US"
  );
}

function formatCurrency(value, language) {
  const amount = Number(value || 0).toLocaleString(
    language === "ar" ? "ar-EG" : "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

  return language === "ar"
    ? `${amount} ر.س`
    : `${amount} SAR`;
}

function formatDate(value, language) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-GB",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function getRevenueFromResponse(response) {
  const body = response?.data;

  const candidates = [
    body?.stats?.total_revenue,
    body?.statistics?.total_revenue,
    body?.data?.stats?.total_revenue,
    body?.data?.statistics?.total_revenue,
    body?.data?.data?.stats?.total_revenue,
    body?.data?.total_revenue,
  ];

  const value = candidates.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      item !== "" &&
      Number.isFinite(Number(item))
  );

  return value === undefined ? null : Number(value);
}

const CANCELLED_STATUSES = [
  "cancelled",
  "canceled",
  "failed",
  "rejected",
];

function getRevenueFromOrders(orders) {
  const validOrders = orders.filter((order) => {
    const status = getOrderStatus(order);
    const amount = getOrderAmount(order);

    return (
      amount !== null &&
      !CANCELLED_STATUSES.includes(status)
    );
  });

  if (validOrders.length === 0) {
    return orders.length === 0 ? 0 : null;
  }

  // This fallback only sums orders returned by the current API request.
  return validOrders.reduce(
    (sum, order) => sum + getOrderAmount(order),
    0
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "gold",
  to,
}) {
  const colors = {
    gold: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
  };

  const content = (
    <div className="group h-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words text-xs font-medium leading-5 text-gray-500 sm:text-sm">
            {title}
          </p>

          <p
            className="mt-3 break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
            dir="auto"
          >
            {value}
          </p>

          <p className="mt-2 break-words text-xs leading-5 text-gray-400 sm:text-sm">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
            colors[color] || colors.gold
          }`}
        >
          {Icon && <Icon size={21} />}
        </div>
      </div>
    </div>
  );

  return to ? (
    <Link
      to={to}
      className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

function StatusBadge({ status, isArabic }) {
  const normalized = String(status || "unknown").toLowerCase();

  const labels = {
    pending: isArabic ? "قيد الانتظار" : "Pending",
    processing: isArabic ? "قيد التجهيز" : "Processing",
    confirmed: isArabic ? "تم التأكيد" : "Confirmed",
    shipped: isArabic ? "تم الشحن" : "Shipped",
    shipping: isArabic ? "جارٍ الشحن" : "Shipping",
    out_for_delivery: isArabic ? "خرج للتوصيل" : "Out for delivery",
    delivered: isArabic ? "تم التوصيل" : "Delivered",
    completed: isArabic ? "مكتمل" : "Completed",
    paid: isArabic ? "مدفوع" : "Paid",
    cancelled: isArabic ? "ملغي" : "Cancelled",
    canceled: isArabic ? "ملغي" : "Cancelled",
    failed: isArabic ? "فشل" : "Failed",
    rejected: isArabic ? "مرفوض" : "Rejected",
    unknown: isArabic ? "غير معروف" : "Unknown",
  };

  let style = "bg-gray-100 text-gray-600";

  if (
    ["delivered", "completed", "paid", "success"].includes(normalized)
  ) {
    style = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  } else if (
    ["pending", "processing", "confirmed"].includes(normalized)
  ) {
    style = "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  } else if (
    ["cancelled", "canceled", "failed", "rejected"].includes(normalized)
  ) {
    style = "bg-red-50 text-red-700 ring-1 ring-red-100";
  } else if (
    ["shipped", "shipping", "out_for_delivery"].includes(normalized)
  ) {
    style = "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {labels[normalized] || status || labels.unknown}
    </span>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="min-w-0">
        <h2 className="font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-gray-500">{subtitle}</p>
      </div>

      {action}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        <FiPackage size={22} />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

function LoadingState({ message }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-3 px-4 py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
  color,
  isArabic,
}) {
  const colors = {
    gold: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    green: "bg-emerald-50 text-emerald-700",
  };

  return (
    <Link
      to={to}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          colors[color] || colors.gold
        }`}
      >
        <Icon size={20} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block break-words text-sm font-semibold text-gray-900">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-gray-500">
          {description}
        </span>
      </span>

      <FiArrowUpRight
        size={17}
        className={`shrink-0 text-gray-400 transition group-hover:text-amber-700 ${
          isArabic ? "-rotate-90" : ""
        }`}
      />
    </Link>
  );
}

function InventoryRow({
  icon: Icon,
  title,
  description,
  count,
  loading,
  locale,
  color,
}) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl p-3 transition hover:bg-gray-50">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          colors[color] || colors.green
        }`}
      >
        <Icon size={19} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold text-gray-800">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-gray-400">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-lg font-bold tabular-nums text-gray-900">
        {loading ? "..." : formatNumber(count, locale)}
      </span>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en"
  );

  const isArabic = language.startsWith("ar");
  const locale = isArabic ? "ar" : "en";
  const text = (english, arabic) => (isArabic ? arabic : english);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [stats, setStats] = useState({
    productCount: null,
    orderCount: null,
    customerCount: null,
    revenue: null,
  });

  const changeLanguage = () => {
    const nextLanguage = isArabic ? "en" : "ar";
    localStorage.setItem("language", nextLanguage);
    setLanguage(nextLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [locale, isArabic]);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const results = await Promise.allSettled([
        api.get(`/products?page=1&limit=${PRODUCT_LIMIT}&sort=newest`),
        api.get(`/orders/admin/all?page=1&limit=${ORDER_LIMIT}`),
        api.get(`/users?page=1&limit=${CUSTOMER_LIMIT}`),
      ]);

      try {
        const [productResult, orderResult, customerResult] = results;

        const productList =
          productResult.status === "fulfilled"
            ? getList(productResult.value, "products")
            : [];

        const orderList =
          orderResult.status === "fulfilled"
            ? getList(orderResult.value, "orders")
            : [];

        const customerList =
          customerResult.status === "fulfilled"
            ? getList(customerResult.value, "users")
            : [];

        setProducts(productList);
        setOrders(orderList);
        setCustomers(customerList);

        const productCount =
          productResult.status === "fulfilled"
            ? getTotal(productResult.value, productList, "products")
            : null;

        const orderCount =
          orderResult.status === "fulfilled"
            ? getTotal(orderResult.value, orderList, "orders")
            : null;

        const customerCount =
          customerResult.status === "fulfilled"
            ? getTotal(customerResult.value, customerList, "users")
            : null;

        if (customerResult.status === "fulfilled") {
          console.log("Customers API response:", customerResult.value.data);
          console.log("Customers extracted:", customerList);
          console.log("Customers count:", customerCount);
        } else {
          console.error(
            "Customers API failed:",
            customerResult.reason?.response?.data ||
              customerResult.reason?.message
          );
        }

        let revenue = null;

        if (orderResult.status === "fulfilled") {
          revenue = getRevenueFromResponse(orderResult.value);

          if (revenue === null) {
            revenue = getRevenueFromOrders(orderList);
          }
        }

        setStats({
          productCount,
          orderCount,
          customerCount,
          revenue,
        });

        const failedCount = results.filter(
          (result) => result.status === "rejected"
        ).length;

        if (failedCount === results.length) {
          setError(
            text(
              "Unable to load dashboard data. Check your login token and API endpoints.",
              "تعذر تحميل بيانات لوحة التحكم. تحققي من رمز تسجيل الدخول وروابط API."
            )
          );
        } else if (failedCount > 0) {
          setError(
            text(
              "Some dashboard data could not be loaded. Check the Console for details.",
              "تعذر تحميل بعض البيانات. راجعي Console لمعرفة التفاصيل."
            )
          );

          results.forEach((result, index) => {
            if (result.status === "rejected") {
              console.error(
                `Dashboard request ${index + 1} failed:`,
                result.reason?.response?.data || result.reason
              );
            }
          });
        }
      } catch (err) {
        console.error("Dashboard parsing error:", err);

        setError(
          text(
            "Something went wrong while loading the dashboard.",
            "حدث خطأ أثناء تحميل لوحة التحكم."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isArabic]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const lowStockProducts = useMemo(
    () =>
      products.filter((product) => {
        const stock = getStock(product);
        return stock > 0 && stock <= getStockThreshold(product);
      }),
    [products]
  );

  const outOfStockProducts = useMemo(
    () => products.filter((product) => getStock(product) <= 0),
    [products]
  );

  const inStockProducts = useMemo(
    () =>
      products.filter(
        (product) => getStock(product) > getStockThreshold(product)
      ),
    [products]
  );

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(
          a?.created_at ?? a?.createdAt ?? 0
        ).getTime();

        const dateB = new Date(
          b?.created_at ?? b?.createdAt ?? 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [orders]);

  const orderStatusItems = [
    {
      key: "pending",
      label: text("Pending", "قيد الانتظار"),
      icon: FiClock,
      statuses: ["pending"],
      color: "bg-amber-50 text-amber-700",
    },
    {
      key: "processing",
      label: text("Processing", "قيد التجهيز"),
      icon: FiRefreshCw,
      statuses: ["processing", "confirmed"],
      color: "bg-blue-50 text-blue-700",
    },
    {
      key: "shipped",
      label: text("Shipped", "تم الشحن"),
      icon: FiTruck,
      statuses: ["shipped", "shipping", "out_for_delivery"],
      color: "bg-purple-50 text-purple-700",
    },
    {
      key: "delivered",
      label: text("Delivered", "تم التوصيل"),
      icon: FiCheckCircle,
      statuses: ["delivered", "completed"],
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen overflow-x-hidden bg-gray-100 p-3 text-gray-800 sm:p-5 lg:p-8"
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-6 sm:space-y-8">
   
     
        {/* Quick actions */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              {text("Quick Actions", "إجراءات سريعة")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              {text(
                "Jump directly to the most-used store tools.",
                "انتقلي مباشرة إلى الأدوات الأكثر استخدامًا."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <QuickAction
              to="/admin/products"
              icon={FiPlus}
              title={text("Add Product", "إضافة منتج")}
              description={text("Add a new fragrance", "إضافة عطر جديد")}
              color="gold"
              isArabic={isArabic}
            />

            <QuickAction
              to="/admin/orders"
              icon={FiShoppingBag}
              title={text("Manage Orders", "إدارة الطلبات")}
              description={text(
                "View and update orders",
                "عرض الطلبات وتحديثها"
              )}
              color="blue"
              isArabic={isArabic}
            />

            <QuickAction
              to="/admin/categories"
              icon={FiBarChart2}
              title={text("Categories", "التصنيفات")}
              description={text(
                "Organize your catalog",
                "تنظيم المنتجات"
              )}
              color="purple"
              isArabic={isArabic}
            />

            <QuickAction
              to="/admin/customers"
              icon={FiUsers}
              title={text("Customers", "العملاء")}
              description={text(
                "View registered customers",
                "عرض العملاء المسجلين"
              )}
              color="green"
              isArabic={isArabic}
            />
          </div>
        </section>

        {/* Recent orders and inventory */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-3">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm xl:col-span-2">
            <SectionHeader
              title={text("Recent Orders", "أحدث الطلبات")}
              subtitle={text(
                `Latest orders from the ${ORDER_LIMIT} orders requested`,
                `أحدث الطلبات من أصل ${ORDER_LIMIT} طلبًا مطلوبًا`
              )}
              action={
                <Link
                  to="/admin/orders"
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  {text("View All", "عرض الكل")}
                  <FiArrowUpRight size={16} />
                </Link>
              }
            />

            {loading ? (
              <LoadingState
                message={text("Loading orders...", "جارٍ تحميل الطلبات...")}
              />
            ) : recentOrders.length === 0 ? (
              <EmptyState message={text("No orders found.", "لا توجد طلبات.")} />
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-3 p-3 sm:hidden">
                  {recentOrders.map((order, index) => {
                    const orderId = getOrderId(order, index);
                    const amount = getOrderAmount(order);
                    const date =
                      order?.created_at ??
                      order?.createdAt ??
                      order?.date;

                    return (
                      <div
                        key={order.id ?? orderId}
                        className="rounded-xl border border-gray-100 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              #{orderId}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {formatDate(date, locale)}
                            </p>
                          </div>
                          <StatusBadge
                            status={getOrderStatus(order)}
                            isArabic={isArabic}
                          />
                        </div>

                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-400">
                            {text("Customer", "العميل")}
                          </p>
                          <p className="mt-1 break-words text-sm font-medium text-gray-700">
                            {getCustomerName(order)}
                          </p>

                          <p className="mt-3 text-xs text-gray-400">
                            {text("Amount", "المبلغ")}
                          </p>
                          <p className="mt-1 text-sm font-bold text-gray-900">
                            {amount === null
                              ? "—"
                              : formatCurrency(amount, locale)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tablet and desktop table */}
                <div className="hidden w-full overflow-x-auto sm:block">
                  <table className="w-full min-w-[600px] text-start text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500">
                      <tr>
                        <th className="whitespace-nowrap px-4 py-3 text-start sm:px-5">
                          {text("Order", "الطلب")}
                        </th>
                        <th className="whitespace-nowrap px-4 py-3 text-start sm:px-5">
                          {text("Customer", "العميل")}
                        </th>
                        <th className="whitespace-nowrap px-4 py-3 text-start sm:px-5">
                          {text("Amount", "المبلغ")}
                        </th>
                        <th className="whitespace-nowrap px-4 py-3 text-start sm:px-5">
                          {text("Status", "الحالة")}
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map((order, index) => {
                        const orderId = getOrderId(order, index);
                        const amount = getOrderAmount(order);
                        const date =
                          order?.created_at ??
                          order?.createdAt ??
                          order?.date;

                        return (
                          <tr
                            key={order.id ?? orderId}
                            className="transition hover:bg-gray-50"
                          >
                            <td className="px-4 py-4 sm:px-5">
                              <p className="whitespace-nowrap font-semibold text-gray-900">
                                #{orderId}
                              </p>
                              <p className="mt-1 whitespace-nowrap text-xs text-gray-400">
                                {formatDate(date, locale)}
                              </p>
                            </td>

                            <td className="max-w-48 px-4 py-4 sm:px-5">
                              <span className="block truncate font-medium text-gray-700">
                                {getCustomerName(order)}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-800 sm:px-5">
                              {amount === null
                                ? "—"
                                : formatCurrency(amount, locale)}
                            </td>

                            <td className="px-4 py-4 sm:px-5">
                              <StatusBadge
                                status={getOrderStatus(order)}
                                isArabic={isArabic}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5">
              <p className="text-xs leading-5 text-gray-400">
                {text(
                  "Order amounts and statuses reflect the API response.",
                  "المبالغ والحالات معروضة حسب استجابة API."
                )}
              </p>
            </div>
          </section>

          {/* Inventory */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              title={text("Inventory Overview", "نظرة عامة على المخزون")}
              subtitle={text(
                "Stock levels in the loaded product list",
                "مستويات المخزون في قائمة المنتجات المحمّلة"
              )}
            />

            <div className="space-y-1 p-4 sm:p-5">
              <InventoryRow
                icon={FiCheckCircle}
                title={text("In Stock", "منتجات متوفرة")}
                description={text(
                  "Above the low-stock threshold",
                  "أعلى من حد المخزون المنخفض"
                )}
                count={inStockProducts.length}
                loading={loading}
                locale={locale}
                color="green"
              />

              <InventoryRow
                icon={FiAlertCircle}
                title={text("Low Stock", "مخزون منخفض")}
                description={text(
                  "At or below the stock threshold",
                  "عند حد المخزون أو أقل منه"
                )}
                count={lowStockProducts.length}
                loading={loading}
                locale={locale}
                color="amber"
              />

              <InventoryRow
                icon={FiPackage}
                title={text("Out of Stock", "نفد المخزون")}
                description={text(
                  "No available units",
                  "لا توجد وحدات متاحة"
                )}
                count={outOfStockProducts.length}
                loading={loading}
                locale={locale}
                color="red"
              />

              
              <p className="pt-2 text-xs leading-5 text-gray-400">
                {text(
                  `Based on up to ${PRODUCT_LIMIT} loaded products.`,
                  `بناءً على ما يصل إلى ${PRODUCT_LIMIT} منتج محمّل.`
                )}
              </p>
            </div>
          </section>
        </div>

        {/* Order status summary */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <SectionHeader
            title={text("Order Status Summary", "ملخص حالات الطلبات")}
            subtitle={text(
              "Status breakdown from the currently loaded orders",
              "توزيع الحالات حسب الطلبات المحمّلة حاليًا"
            )}
          />

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            {orderStatusItems.map((item) => {
              const Icon = item.icon;

              const count = orders.filter((order) =>
                item.statuses.includes(getOrderStatus(order))
              ).length;

              return (
                <div
                  key={item.key}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition hover:border-gray-200 hover:bg-white"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon size={20} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm text-gray-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {loading ? "..." : formatNumber(count, locale)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
            <p className="text-xs leading-5 text-gray-400">
              {text(
                `Counts use the ${ORDER_LIMIT} orders requested from the API, not necessarily every order in the store.`,
                `الأعداد محسوبة من ${ORDER_LIMIT} طلبًا مطلوبًا من API، وقد لا تشمل جميع طلبات المتجر.`
              )}
            </p>
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-gray-400">
          {text(
            "Oud Elite Admin Dashboard",
            "لوحة تحكم نخبة العود"
          )}
        </footer>
      </div>
    </main>
  );
}
