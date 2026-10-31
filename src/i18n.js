
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      productsPage: {
        title: "All Products",
        subtitle: "Manage your store products",
        addProduct: "Add Product",
        editProduct: "Edit Product",
        search: "Search by name, SKU, or slug...",
        refresh: "Refresh",
        loading: "Loading products...",
        noProducts: "No products found",

        product: "Product",
        sku: "SKU",
        price: "Price",
        stock: "Stock",
        status: "Status",
        actions: "Actions",

        active: "Active",
        inactive: "Inactive",
        featured: "Featured",
        bestSeller: "Best Seller",
        newProduct: "New",
        yes: "Yes",
        no: "No",

        save: "Save Product",
        update: "Update Product",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        close: "Close",
        refreshButton: "Refresh",

        uploadImages: "Upload Images",
        existingImages: "Product Images",
        removeImage: "Remove Image",
        selectImages: "Choose product images",
        noImages: "No images uploaded yet.",

        basicInfo: "Basic Information",
        nameEn: "English Name",
        nameAr: "Arabic Name",
        slug: "Slug",
        skuLabel: "Product SKU",
        shortDescEn: "Short Description (English)",
        shortDescAr: "Short Description (Arabic)",
        descriptionEn: "Description (English)",
        descriptionAr: "Description (Arabic)",

        pricing: "Pricing & Inventory",
        basePrice: "Base Price",
        salePrice: "Sale Price",
        costPrice: "Cost Price",
        stockQty: "Stock Quantity",
        lowStockAlert: "Low Stock Alert",
        volume: "Volume (ml)",
        concentration: "Concentration",
        gender: "Gender",
        brandId: "Brand ID",
        categories: "Category IDs",
        categoriesHint: "Enter category IDs separated by commas",

        isActive: "Active Product",
        isFeatured: "Featured Product",
        isBestSeller: "Best Seller",
        isNew: "New Product",
        sortOrder: "Sort Order",

        saving: "Saving...",
        confirmDelete: "Are you sure you want to delete this product?",
        confirmDeleteImage: "Are you sure you want to delete this image?",

        loadError: "Failed to load products.",
        saveSuccess: "Product saved successfully.",
        updateSuccess: "Product updated successfully.",
        deleteSuccess: "Product deleted successfully.",
        imageUploadSuccess: "Images uploaded successfully.",
        imageDeleteSuccess: "Image deleted successfully.",

        saveError: "Failed to save product.",
        updateError: "Failed to update product.",
        deleteError: "Failed to delete product.",
        imageUploadError: "Failed to upload images.",
        imageDeleteError: "Failed to delete image.",

        missingId: "Product ID was not returned by the server.",
        noDescription: "No description available",
        all: "All",
        units: "units",
        egp: "EGP",
        required: "This field is required",
      },

      adminCategories: {
        title: "Categories Management",
        subtitle: "Create, edit, and manage your store categories",

        add: "Add Category",
        edit: "Edit Category",
        addSubtitle: "Create a new category for your store",
        editSubtitle: "Update the category information",

        english: "English Information",
        arabic: "Arabic Information",
        englishHelp: "Enter the category information in English",
        arabicHelp: "Enter the category information in Arabic",

        nameEn: "English Name",
        nameAr: "Arabic Name",
        descriptionEn: "English Description",
        descriptionAr: "Arabic Description",

        slug: "Slug",
        slugHelp: "Used in the category URL. Example: best-sellers",

        image: "Image URL",
        imagePreview: "Image Preview",
        additionalInfo: "Additional Information",

        featured: "Featured Category",
        featuredHelp: "Show this category in featured sections",
        notFeatured: "Not Featured",

        total: "Total Categories",
        featuredTotal: "Featured Categories",

        search: "Search categories...",
        refresh: "Refresh",
        loading: "Loading categories...",
        empty: "No categories found. Add your first category.",

        id: "ID",
        actions: "Actions",
        yes: "Yes",
        no: "No",

        save: "Save Category",
        update: "Update Category",
        saving: "Saving...",
        cancel: "Cancel",
        delete: "Delete",
        close: "Close",

        required: "Please fill in the required fields.",
        confirmDelete: "Are you sure you want to delete this category?",
        loginRequired: "Please log in as an administrator first.",

        successCreate: "Category created successfully.",
        successUpdate: "Category updated successfully.",
        successDelete: "Category deleted successfully.",

        errorLoad: "Failed to load categories.",
        errorSave: "Failed to save category.",
        errorDelete: "Failed to delete category.",
      },
adminOrders: {
  title: "All Orders",
  subtitle: "Manage customer orders, payments, and shipping",
  searchLabel: "Search Orders",
  searchPlaceholder: "Search by order number, customer, email, or status...",
  refresh: "Refresh",
  ordersList: "Orders List",
  ordersDisplayed: "orders displayed",
  orderDisplayed: "order displayed",
  page: "Page",
  of: "of",
  loading: "Loading orders...",
  empty: "No orders found",
  emptyHint: "Try another search term.",
  orderId: "Order ID",
  orderNumber: "Order Number",
  customer: "Customer",
  total: "Total",
  payment: "Payment",
  status: "Status",
  updateStatus: "Update Status",
  date: "Date",
  details: "Details",
  previous: "Previous",
  next: "Next",
  updating: "Updating...",
  viewDetails: "View order details",
  orderDetails: "Order Details",
  orderItems: "Order Items",
  quantity: "Quantity",
  orderNotes: "Order Notes",
  close: "Close",
  shippingDetails: "Shipping Details",
  trackingNumber: "Tracking Number",
  trackingPlaceholder: "e.g. AE9876543210",
  shippingCompany: "Shipping Company",
  shippingCompanyPlaceholder: "e.g. Aramex",
  note: "Note",
  notePlaceholder: "Add a shipping note...",
  cancel: "Cancel",
  saveShipping: "Save Shipping",
  saving: "Saving...",
  product: "Product",
  pending: "Pending",
  processing: "Processing",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  paymentMethod: "Payment Method",
  paymentStatus: "Payment Status",
  orderStatus: "Order Status",
  loadError: "Failed to load orders",
  updateSuccess: "Order status updated successfully",
  updateError: "Failed to update order status",
  trackingRequired: "Enter the tracking number and shipping company",
  egp: "SAR"
},

    },
  },

  ar: {
    translation: {
      productsPage: {
        title: "جميع المنتجات",
        subtitle: "إدارة منتجات المتجر",
        addProduct: "إضافة منتج",
        editProduct: "تعديل المنتج",
        search: "ابحث بالاسم أو رمز المنتج أو الرابط...",
        refresh: "تحديث",
        loading: "جاري تحميل المنتجات...",
        noProducts: "لا توجد منتجات",

        product: "المنتج",
        sku: "رمز المنتج",
        price: "السعر",
        stock: "المخزون",
        status: "الحالة",
        actions: "الإجراءات",

        active: "نشط",
        inactive: "غير نشط",
        featured: "مميز",
        bestSeller: "الأكثر مبيعًا",
        newProduct: "جديد",
        yes: "نعم",
        no: "لا",

        save: "حفظ المنتج",
        update: "تحديث المنتج",
        cancel: "إلغاء",
        delete: "حذف",
        edit: "تعديل",
        close: "إغلاق",
        refreshButton: "تحديث",

        uploadImages: "رفع الصور",
        existingImages: "صور المنتج",
        removeImage: "حذف الصورة",
        selectImages: "اختر صور المنتج",
        noImages: "لم تتم إضافة صور بعد.",

        basicInfo: "المعلومات الأساسية",
        nameEn: "الاسم بالإنجليزية",
        nameAr: "الاسم بالعربية",
        slug: "الرابط المختصر",
        skuLabel: "رمز المنتج",
        shortDescEn: "وصف مختصر بالإنجليزية",
        shortDescAr: "وصف مختصر بالعربية",
        descriptionEn: "الوصف بالإنجليزية",
        descriptionAr: "الوصف بالعربية",

        pricing: "الأسعار والمخزون",
        basePrice: "السعر الأساسي",
        salePrice: "سعر التخفيض",
        costPrice: "سعر التكلفة",
        stockQty: "كمية المخزون",
        lowStockAlert: "تنبيه انخفاض المخزون",
        volume: "الحجم (مل)",
        concentration: "تركيز العطر",
        gender: "الفئة",
        brandId: "معرّف العلامة التجارية",
        categories: "معرّفات التصنيفات",
        categoriesHint: "أدخل معرّفات التصنيفات مفصولة بفواصل",

        isActive: "منتج نشط",
        isFeatured: "منتج مميز",
        isBestSeller: "الأكثر مبيعًا",
        isNew: "منتج جديد",
        sortOrder: "ترتيب العرض",

        saving: "جاري الحفظ...",
        confirmDelete: "هل أنت متأكد من رغبتك في حذف هذا المنتج؟",
        confirmDeleteImage: "هل أنت متأكد من رغبتك في حذف هذه الصورة؟",

        loadError: "فشل تحميل المنتجات.",
        saveSuccess: "تم حفظ المنتج بنجاح.",
        updateSuccess: "تم تحديث المنتج بنجاح.",
        deleteSuccess: "تم حذف المنتج بنجاح.",
        imageUploadSuccess: "تم رفع الصور بنجاح.",
        imageDeleteSuccess: "تم حذف الصورة بنجاح.",

        saveError: "فشل حفظ المنتج.",
        updateError: "فشل تحديث المنتج.",
        deleteError: "فشل حذف المنتج.",
        imageUploadError: "فشل رفع الصور.",
        imageDeleteError: "فشل حذف الصورة.",

        missingId: "لم يُرجع الخادم معرّف المنتج.",
        noDescription: "لا يوجد وصف متاح",
        all: "الكل",
        units: "وحدات",
        egp: "جنيه",
        required: "هذا الحقل مطلوب",
      },

      adminCategories: {
        title: "إدارة التصنيفات",
        subtitle: "إضافة تصنيفات المتجر وتعديلها وإدارتها",

        add: "إضافة تصنيف",
        edit: "تعديل التصنيف",
        addSubtitle: "إنشاء تصنيف جديد للمتجر",
        editSubtitle: "تحديث بيانات التصنيف",

        english: "البيانات باللغة الإنجليزية",
        arabic: "البيانات باللغة العربية",
        englishHelp: "أدخل بيانات التصنيف باللغة الإنجليزية",
        arabicHelp: "أدخل بيانات التصنيف باللغة العربية",

        nameEn: "الاسم بالإنجليزية",
        nameAr: "الاسم بالعربية",
        descriptionEn: "الوصف بالإنجليزية",
        descriptionAr: "الوصف بالعربية",

        slug: "الرابط المختصر",
        slugHelp: "يُستخدم في رابط التصنيف. مثال: best-sellers",

        image: "رابط الصورة",
        imagePreview: "معاينة الصورة",
        additionalInfo: "معلومات إضافية",

        featured: "تصنيف مميز",
        featuredHelp: "عرض هذا التصنيف ضمن الأقسام المميزة",
        notFeatured: "غير مميز",

        total: "إجمالي التصنيفات",
        featuredTotal: "التصنيفات المميزة",

        search: "ابحث عن تصنيف...",
        refresh: "تحديث",
        loading: "جاري تحميل التصنيفات...",
        empty: "لا توجد تصنيفات. أضف أول تصنيف الآن.",

        id: "المعرّف",
        actions: "الإجراءات",
        yes: "نعم",
        no: "لا",

        save: "حفظ التصنيف",
        update: "تحديث التصنيف",
        saving: "جاري الحفظ...",
        cancel: "إلغاء",
        delete: "حذف",
        close: "إغلاق",

        required: "يرجى ملء الحقول المطلوبة.",
        confirmDelete: "هل أنت متأكد من رغبتك في حذف هذا التصنيف؟",
        loginRequired: "يرجى تسجيل الدخول بحساب مسؤول أولًا.",

        successCreate: "تم إنشاء التصنيف بنجاح.",
        successUpdate: "تم تحديث التصنيف بنجاح.",
        successDelete: "تم حذف التصنيف بنجاح.",

        errorLoad: "فشل تحميل التصنيفات.",
        errorSave: "فشل حفظ التصنيف.",
        errorDelete: "فشل حذف التصنيف.",
      },


      adminOrders: {
  title: "جميع الطلبات",
  subtitle: "إدارة طلبات العملاء والمدفوعات والشحن",
  searchLabel: "البحث في الطلبات",
  searchPlaceholder: "ابحث برقم الطلب أو اسم العميل أو البريد الإلكتروني أو الحالة...",
  refresh: "تحديث",
  ordersList: "قائمة الطلبات",
  ordersDisplayed: "طلبات معروضة",
  orderDisplayed: "طلب معروض",
  page: "الصفحة",
  of: "من",
  loading: "جارٍ تحميل الطلبات...",
  empty: "لا توجد طلبات",
  emptyHint: "جرّب استخدام كلمة بحث أخرى.",
  orderId: "رقم الطلب الداخلي",
  orderNumber: "رقم الطلب",
  customer: "العميل",
  total: "الإجمالي",
  payment: "الدفع",
  status: "الحالة",
  updateStatus: "تحديث الحالة",
  date: "التاريخ",
  details: "التفاصيل",
  previous: "السابق",
  next: "التالي",
  updating: "جارٍ التحديث...",
  viewDetails: "عرض تفاصيل الطلب",
  orderDetails: "تفاصيل الطلب",
  orderItems: "منتجات الطلب",
  quantity: "الكمية",
  orderNotes: "ملاحظات الطلب",
  close: "إغلاق",
  shippingDetails: "بيانات الشحن",
  trackingNumber: "رقم التتبع",
  trackingPlaceholder: "مثال: AE9876543210",
  shippingCompany: "شركة الشحن",
  shippingCompanyPlaceholder: "مثال: أرامكس",
  note: "ملاحظة",
  notePlaceholder: "أضف ملاحظة للشحن...",
  cancel: "إلغاء",
  saveShipping: "حفظ بيانات الشحن",
  saving: "جارٍ الحفظ...",
  product: "المنتج",
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  confirmed: "تم التأكيد",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  completed: "مكتمل",
  cancelled: "ملغي",
  paid: "مدفوع",
  failed: "فشل الدفع",
  refunded: "تم رد المبلغ",
  paymentMethod: "طريقة الدفع",
  paymentStatus: "حالة الدفع",
  orderStatus: "حالة الطلب",
  loadError: "فشل تحميل الطلبات",
  updateSuccess: "تم تحديث حالة الطلب بنجاح",
  updateError: "فشل تحديث حالة الطلب",
  trackingRequired: "أدخل رقم التتبع وشركة الشحن",
  egp: "ر.س"
},
    },
  },
};

const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("language") || "en"
    : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
    document.documentElement.dir = language.startsWith("ar")
      ? "rtl"
      : "ltr";
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("language", language);
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = savedLanguage;
  document.documentElement.dir = savedLanguage.startsWith("ar")
    ? "rtl"
    : "ltr";
}

export default i18n;
