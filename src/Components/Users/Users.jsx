
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiPhone,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiGlobe,
  FiCalendar,
} from "react-icons/fi";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";
const LIMIT = 20;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getResponseBody = (response) => {
  return response?.data?.data ?? response?.data ?? {};
};

const getUsers = (response) => {
  const body = getResponseBody(response);

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.users)) return body.users;
  if (Array.isArray(body?.customers)) return body.customers;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.users)) return body.data.users;
  if (Array.isArray(body?.data?.customers)) return body.data.customers;

  return [];
};

const getPagination = (response, usersLength) => {
  const body = getResponseBody(response);

  const pagination =
    body?.pagination ||
    body?.meta ||
    body?.data?.pagination ||
    body?.data?.meta ||
    {};

  const total =
    Number(
      pagination?.total ??
        body?.total ??
        body?.total_users ??
        body?.data?.total ??
        usersLength
    ) || usersLength;

  const lastPage =
    Number(
      pagination?.last_page ??
        pagination?.lastPage ??
        pagination?.total_pages ??
        body?.last_page ??
        body?.lastPage ??
        body?.data?.last_page
    ) || Math.max(1, Math.ceil(total / LIMIT));

  return {
    total,
    lastPage,
  };
};

const getUserName = (user) => {
  return (
    user?.name ||
    user?.full_name ||
    user?.name_en ||
    user?.name_ar ||
    user?.username ||
    "Unknown User"
  );
};

const getUserEmail = (user) => {
  return user?.email || "—";
};

const getUserPhone = (user) => {
  return user?.phone || user?.phone_number || "—";
};

const getUserId = (user) => {
  return user?.id ?? user?.user_id ?? user?.uuid ?? "—";
};

const isUserActive = (user) => {
  if (typeof user?.is_active === "boolean") return user.is_active;
  if (typeof user?.active === "boolean") return user.active;

  if (typeof user?.status === "string") {
    return ["active", "activated", "enabled"].includes(
      user.status.toLowerCase()
    );
  }

  return true;
};

const getInitials = (name) => {
  return String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const getRole = (user) => {
  if (typeof user?.role === "string") return user.role;
  if (user?.role?.name) return user.role.name;
  if (user?.roles?.length) {
    return user.roles
      .map((role) => (typeof role === "string" ? role : role?.name))
      .filter(Boolean)
      .join(", ");
  }

  return "Customer";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString();
};

export default function AllUsers() {
  const { i18n } = useTranslation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    lastPage: 1,
  });
  const [updatingId, setUpdatingId] = useState(null);

  const isArabic =
    i18n.language?.startsWith("ar") ||
    localStorage.getItem("language") === "ar";

  const tr = (english, arabic) => (isArabic ? arabic : english);

  const loadUsers = useCallback(
    async (showRefresh = false, requestedPage = page) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await api.get(
          `/admin/users?page=${requestedPage}&limit=${LIMIT}`
        );

        const usersData = getUsers(response);
        const paginationData = getPagination(response, usersData.length);

        setUsers(usersData);
        setPagination(paginationData);
        setPage(requestedPage);
      } catch (error) {
        console.error("Get users error:", error);

        toast.error(
          error?.response?.data?.message ||
            tr("Failed to load users", "فشل تحميل المستخدمين")
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, isArabic]
  );

  useEffect(() => {
    loadUsers(false, 1);
    // Initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user) => {
      const searchableFields = [
        getUserName(user),
        user?.name_ar,
        user?.name_en,
        getUserEmail(user),
        getUserPhone(user),
        user?.username,
        user?.id,
        user?.user_id,
        user?.uuid,
        user?.role?.name,
        user?.role,
      ];

      return searchableFields.some((field) =>
        String(field ?? "").toLowerCase().includes(value)
      );
    });
  }, [users, search]);

  const activeCount = users.filter(isUserActive).length;
  const inactiveCount = users.length - activeCount;

  const handleToggleStatus = async (user) => {
    const userId = user?.id ?? user?.user_id;

    if (!userId) {
      toast.error(tr("User ID is missing", "معرف المستخدم غير موجود"));
      return;
    }

    const currentlyActive = isUserActive(user);

    try {
      setUpdatingId(userId);

      await api.patch(`/admin/users/${userId}/toggle`, {});

      setUsers((previousUsers) =>
        previousUsers.map((item) => {
          const itemId = item?.id ?? item?.user_id;

          if (String(itemId) !== String(userId)) return item;

          return {
            ...item,
            is_active: !currentlyActive,
            active: !currentlyActive,
            status: !currentlyActive ? "active" : "inactive",
          };
        })
      );

      toast.success(
        currentlyActive
          ? tr("User deactivated successfully", "تم إيقاف المستخدم بنجاح")
          : tr("User activated successfully", "تم تفعيل المستخدم بنجاح")
      );
    } catch (error) {
      console.error("Toggle user error:", error);

      toast.error(
        error?.response?.data?.message ||
          tr("Failed to update user status", "فشل تحديث حالة المستخدم")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.lastPage) return;

    loadUsers(false, newPage);
  };

  const renderStatus = (user) => {
    const active = isUserActive(user);

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          active
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-600"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
        {active
          ? tr("Active", "نشط")
          : tr("Inactive", "غير نشط")}
      </span>
    );
  };

  const renderToggleButton = (user) => {
    const active = isUserActive(user);
    const userId = user?.id ?? user?.user_id;
    const isUpdating = String(updatingId) === String(userId);

    return (
      <button
        type="button"
        onClick={() => handleToggleStatus(user)}
        disabled={isUpdating}
        className={`inline-flex min-w-[105px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          active
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {isUpdating ? (
          <FiRefreshCw className="animate-spin" size={14} />
        ) : active ? (
          <FiUserX size={14} />
        ) : (
          <FiUserCheck size={14} />
        )}

        {isUpdating
          ? tr("Updating...", "جاري التحديث...")
          : active
          ? tr("Deactivate", "إيقاف")
          : tr("Activate", "تفعيل")}
      </button>
    );
  };

  const stats = [
    {
      title: tr("Total Users", "إجمالي المستخدمين"),
      value: pagination.total,
      icon: FiUsers,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-700",
    },
    {
      title: tr("Active Users", "المستخدمون النشطون"),
      value: activeCount,
      icon: FiUserCheck,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: tr("Inactive Users", "المستخدمون غير النشطين"),
      value: inactiveCount,
      icon: FiUserX,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div
      className="min-w-0 w-full space-y-5 p-5 overflow-hidden"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Page Header */}
      <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
              <FiUsers size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="break-words text-xl font-bold text-gray-900 sm:text-2xl">
                {tr("Users Management", "إدارة المستخدمين")}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {tr(
                  "Manage and monitor your store users",
                  "إدارة ومتابعة مستخدمي المتجر"
                )}
              </p>
            </div>
          </div>
        </div>

      
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex min-w-0 items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-gray-500">
                  {item.title}
                </p>

                <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
                  {item.value}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
              >
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <FiSearch
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              isArabic ? "right-3" : "left-3"
            }`}
            size={18}
          />

          <input
            type="text"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder={tr(
              "Search by name, email, phone, ID or role...",
              "ابحث بالاسم أو البريد أو الهاتف أو المعرف أو الدور..."
            )}
            className={`w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white ${
              isArabic ? "pr-10 pl-4" : "pl-10 pr-4"
            }`}
          />
        </div>

         <button
          type="button"
          onClick={() => loadUsers(true, page)}
          disabled={refreshing || loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <FiRefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          {tr("Refresh", "تحديث")}
        </button>
      </div>

      {/* Desktop Table - No Horizontal Scroll */}
      <section className="hidden  min-w-0 w-full  overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full table-fixed border-collapse text-center text-xs lg:text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="w-[24%] px-2 py-4 font-semibold lg:px-4">
                {tr("User", "المستخدم")}
              </th>

              <th className="w-[30%] px-2 py-4 font-semibold lg:px-4">
                {tr("Contact", "بيانات التواصل")}
              </th>

              <th className="w-[13%] px-2 py-4 font-semibold lg:px-4">
                {tr("Role", "الدور")}
              </th>

              <th className="w-[15%] px-2 py-4 font-semibold lg:px-4">
                {tr("Status", "الحالة")}
              </th>

              <th className="w-[18%] px-2 py-4 font-semibold lg:px-4">
                {tr("Action", "الإجراء")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-14 text-center">
                  <FiRefreshCw
                    className="mx-auto animate-spin text-gray-500"
                    size={25}
                  />
                  <p className="mt-3 text-sm text-gray-500">
                    {tr("Loading users...", "جاري تحميل المستخدمين...")}
                  </p>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <FiAlertCircle
                    className="mx-auto text-gray-400"
                    size={28}
                  />
                  <p className="mt-3 text-sm font-medium text-gray-500">
                    {tr("No users found", "لا يوجد مستخدمون")}
                  </p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const name = getUserName(user);
                const email = getUserEmail(user);
                const phone = getUserPhone(user);
                const role = getRole(user);

                return (
                  <tr
                    key={getUserId(user)}
                    className="transition hover:bg-gray-50/70"
                  >
                    {/* User */}
                    <td className="min-w-0 px-2 py-4 lg:px-4">
                      <div className="flex min-w-0 items-center gap-2 text-start lg:gap-3">
                        {user?.avatar || user?.image ? (
                          <img
                            src={user.avatar || user.image}
                            alt={name}
                            className="h-9 w-9 shrink-0 rounded-full border border-gray-200 object-cover lg:h-10 lg:w-10"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white lg:h-10 lg:w-10">
                            {getInitials(name)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="break-words font-semibold text-gray-900">
                            {name}
                          </p>

                          <p className="mt-1 break-all text-[10px] text-gray-400 lg:text-xs">
                            #{getUserId(user)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="min-w-0 px-2 py-4 lg:px-4">
                      <div className="min-w-0 space-y-1.5 text-start">
                        <p className="flex min-w-0 items-start gap-1.5 text-gray-700">
                          <FiMail
                            className="mt-0.5 shrink-0 text-gray-400"
                            size={13}
                          />
                          <span className="min-w-0 break-all">
                            {email}
                          </span>
                        </p>

                        <p className="flex min-w-0 items-start gap-1.5 text-gray-500">
                          <FiPhone
                            className="mt-0.5 shrink-0 text-gray-400"
                            size={13}
                          />
                          <span className="min-w-0 break-words">
                            {phone}
                          </span>
                        </p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="min-w-0 px-2 py-4 lg:px-4">
                      <span className="inline-flex max-w-full items-center justify-center gap-1 break-words rounded-lg bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700">
                        <FiShield className="shrink-0" size={12} />
                        <span className="break-words">{role}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="min-w-0 px-2 py-4 lg:px-4">
                      {renderStatus(user)}
                    </td>

                    {/* Action */}
                    <td className="min-w-0 px-2 py-4 lg:px-4">
                      <div className="flex justify-center">
                        {renderToggleButton(user)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center">
            <FiRefreshCw
              className="mx-auto animate-spin text-gray-500"
              size={25}
            />
            <p className="mt-3 text-sm text-gray-500">
              {tr("Loading users...", "جاري تحميل المستخدمين...")}
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center">
            <FiAlertCircle
              className="mx-auto text-gray-400"
              size={28}
            />
            <p className="mt-3 text-sm text-gray-500">
              {tr("No users found", "لا يوجد مستخدمون")}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const name = getUserName(user);

            return (
              <div
                key={getUserId(user)}
                className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                {/* User Info */}
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {user?.avatar || user?.image ? (
                      <img
                        src={user.avatar || user.image}
                        alt={name}
                        className="h-11 w-11 shrink-0 rounded-full border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                        {getInitials(name)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="break-words font-bold text-gray-900">
                        {name}
                      </h3>

                      <p className="mt-1 break-all text-xs text-gray-400">
                        #{getUserId(user)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">{renderStatus(user)}</div>
                </div>

                <div className="my-4 border-t border-gray-100" />

                {/* Contact Info */}
                <div className="min-w-0 space-y-3">
                  <div className="flex min-w-0 items-start gap-2 text-sm text-gray-600">
                    <FiMail
                      className="mt-0.5 shrink-0 text-gray-400"
                      size={16}
                    />
                    <span className="min-w-0 break-all">
                      {getUserEmail(user)}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-start gap-2 text-sm text-gray-600">
                    <FiPhone
                      className="mt-0.5 shrink-0 text-gray-400"
                      size={16}
                    />
                    <span className="min-w-0 break-words">
                      {getUserPhone(user)}
                    </span>
                  </div>

                  <div className="flex min-w-0 items-start gap-2 text-sm text-gray-600">
                    <FiShield
                      className="mt-0.5 shrink-0 text-gray-400"
                      size={16}
                    />
                    <span className="min-w-0 break-words">
                      {getRole(user)}
                    </span>
                  </div>

                  {user?.created_at && (
                    <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">
                      <FiCalendar
                        className="shrink-0 text-gray-400"
                        size={15}
                      />
                      <span>
                        {tr("Joined:", "تاريخ التسجيل:")}{" "}
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-3">
                  <div className="flex justify-end">
                    {renderToggleButton(user)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex min-w-0 flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <p className="text-center text-xs text-gray-500 sm:text-start">
          {tr("Page", "صفحة")}{" "}
          <span className="font-bold text-gray-900">{page}</span>{" "}
          {tr("of", "من")}{" "}
          <span className="font-bold text-gray-900">
            {pagination.lastPage}
          </span>
          <span className="mx-1">•</span>
          {pagination.total} {tr("users", "مستخدم")}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={tr("Previous page", "الصفحة السابقة")}
          >
            {isArabic ? (
              <FiChevronRight size={18} />
            ) : (
              <FiChevronLeft size={18} />
            )}
          </button>

          <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-gray-900 px-3 text-sm font-semibold text-white">
            {page}
          </span>

          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= pagination.lastPage || loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={tr("Next page", "الصفحة التالية")}
          >
            {isArabic ? (
              <FiChevronLeft size={18} />
            ) : (
              <FiChevronRight size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
