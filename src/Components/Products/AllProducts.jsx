


import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiImage,
  FiPackage,
  FiUploadCloud,
  FiCheckCircle,
  FiAlertCircle,
  FiTag,
  FiLayers,
  FiStar,
} from "react-icons/fi";

const API_URL = "https://oud-elite.shaarapp.com/api/v1";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const getProducts = (response) => {
  const data = response?.data?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(response?.data?.products)) {
    return response.data.products;
  }

  return [];
};

const getCategories = (response) => {
  const data = response?.data?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(response?.data?.categories)) {
    return response.data.categories;
  }

  return [];
};

const getImages = (product) =>
  Array.isArray(product?.images) ? product.images : [];

const getImageUrl = (image) => {
  if (typeof image === "string") return image;

  return (
    image?.image_url ||
    image?.url ||
    image?.image ||
    image?.path ||
    ""
  );
};

const isTrue = (value) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  value === "true";

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const emptyForm = {
  sku: "",
  name_ar: "",
  name_en: "",
  slug: "",
  short_desc_ar: "",
  short_desc_en: "",
  description_ar: "",
  description_en: "",
  brand_id: 1,
  base_price: "",
  sale_price: "",
  cost_price: "",
  stock_qty: "",
  low_stock_alert: 5,
  volume_ml: 100,
  concentration: "edp",
  gender: "unisex",
  is_active: true,
  is_featured: false,
  is_best_seller: false,
  is_new: false,
  sort_order: 0,
  categories: [],
};

const Field = ({ label, children }) => (
  <div className="min-w-0">
    {label && (
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
    )}
    {children}
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
    <span className="text-sm font-medium text-gray-700">
      {label}
    </span>

    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-gray-900" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  </label>
);

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          {value}
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        <Icon size={21} />
      </div>
    </div>
  </div>
);

export default function AllProducts() {
  const { i18n } = useTranslation();

  const isArabic = i18n.language?.startsWith("ar");
  const dir = isArabic ? "rtl" : "ltr";

  const tr = (en, ar) => (isArabic ? ar : en);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });

  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);

  const labels = {
    products: tr("Products", "المنتجات"),
    add: tr("Add Product", "إضافة منتج"),
    edit: tr("Edit Product", "تعديل المنتج"),
    search: tr("Search products...", "ابحث عن المنتجات..."),
    product: tr("Product", "المنتج"),
    sku: tr("SKU", "كود المنتج"),
    price: tr("Price", "السعر"),
    stock: tr("Stock", "المخزون"),
    status: tr("Status", "الحالة"),
    actions: tr("Actions", "الإجراءات"),
    active: tr("Active", "نشط"),
    inactive: tr("Inactive", "غير نشط"),
    save: tr("Save Product", "حفظ المنتج"),
    update: tr("Update Product", "تحديث المنتج"),
    cancel: tr("Cancel", "إلغاء"),
    delete: tr("Delete", "حذف"),
    refresh: tr("Refresh", "تحديث"),
    loading: tr("Loading products...", "جاري تحميل المنتجات..."),
    noProducts: tr("No products found", "لا توجد منتجات"),
    nameEn: tr("English Name", "الاسم بالإنجليزية"),
    nameAr: tr("Arabic Name", "الاسم بالعربية"),
    slug: tr("Slug", "الرابط"),
    shortDescEn: tr("Short Description (EN)", "وصف مختصر بالإنجليزية"),
    shortDescAr: tr("Short Description (AR)", "وصف مختصر بالعربية"),
    descriptionEn: tr("Description (EN)", "الوصف بالإنجليزية"),
    descriptionAr: tr("Description (AR)", "الوصف بالعربية"),
    basePrice: tr("Base Price", "السعر الأساسي"),
    salePrice: tr("Sale Price", "سعر التخفيض"),
    costPrice: tr("Cost Price", "سعر التكلفة"),
    stockQty: tr("Stock Quantity", "الكمية المتاحة"),
    lowStock: tr("Low Stock Alert", "تنبيه انخفاض المخزون"),
    volume: tr("Volume (ml)", "الحجم (مل)"),
    concentration: tr("Concentration", "التركيز"),
    gender: tr("Gender", "الفئة"),
    brandId: tr("Brand ID", "رقم العلامة التجارية"),
    sortOrder: tr("Sort Order", "ترتيب العرض"),
    categories: tr("Categories", "التصنيفات"),
    images: tr("Product Images", "صور المنتج"),
    upload: tr("Choose Images", "اختيار الصور"),
    featured: tr("Featured", "منتج مميز"),
    bestSeller: tr("Best Seller", "الأكثر مبيعًا"),
    newProduct: tr("New Product", "منتج جديد"),
    productActive: tr("Product Active", "المنتج نشط"),
    total: tr("Total Products", "إجمالي المنتجات"),
    activeProducts: tr("Active Products", "المنتجات النشطة"),
    outOfStock: tr("Out of Stock", "نفد المخزون"),
    noCategories: tr("No categories available", "لا توجد تصنيفات"),
    deleteConfirm: tr(
      "Are you sure you want to delete this product?",
      "هل أنت متأكد أنك تريد حذف هذا المنتج؟"
    ),
    uploading: tr("Uploading images...", "جاري رفع الصور..."),
  };

  const inputClass =
    "w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

  const textareaClass =
    "w-full min-w-0 resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

  // =========================
  // GET PRODUCTS
  // =========================

  const loadProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        params: {
          page: 1,
          limit: 100,
          sort: "newest",
        },
      });

      setProducts(getProducts(response));
    } catch (error) {
      console.error("Load products error:", error);

      toast.error(
        error.response?.data?.message ||
          tr("Failed to load products", "فشل تحميل المنتجات")
      );
    }
  }, [isArabic]);

  // =========================
  // GET CATEGORIES
  // =========================

  const loadCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`, {
        params: {
          page: 1,
          limit: 100,
        },
      });

      setCategories(getCategories(response));
    } catch (error) {
      console.error("Load categories error:", error);
      setCategories([]);
    }
  }, []);

  // =========================
  // LOAD ALL DATA
  // =========================

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =========================
  // FIND CREATED PRODUCT ID
  // =========================

  const findCreatedProductId = async (payload) => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        params: {
          page: 1,
          limit: 100,
          sort: "newest",
        },
      });

      const list = getProducts(response);

      const found = list.find(
        (item) =>
          item.sku?.toLowerCase().trim() ===
            payload.sku.toLowerCase().trim() ||
          item.slug?.toLowerCase().trim() ===
            payload.slug.toLowerCase().trim()
      );

      return found?.id || found?.product_id || null;
    } catch (error) {
      console.error("Find product ID error:", error);
      return null;
    }
  };

  // =========================
  // FORM FUNCTIONS
  // =========================

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setSelectedImages([]);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    const productCategories = Array.isArray(product.categories)
      ? product.categories.map((category) =>
          Number(
            typeof category === "object"
              ? category.id
              : category
          )
        )
      : [];

    setEditingId(product.id);

    setForm({
      ...emptyForm,
      ...product,

      sku: product.sku || "",
      name_ar: product.name_ar || "",
      name_en: product.name_en || "",
      slug: product.slug || "",

      short_desc_ar: product.short_desc_ar || "",
      short_desc_en: product.short_desc_en || "",

      description_ar: product.description_ar || "",
      description_en: product.description_en || "",

      brand_id: product.brand_id ?? 1,

      base_price: product.base_price ?? "",
      sale_price: product.sale_price ?? "",
      cost_price: product.cost_price ?? "",

      stock_qty: product.stock_qty ?? "",
      low_stock_alert: product.low_stock_alert ?? 5,
      volume_ml: product.volume_ml ?? 100,

      concentration: product.concentration || "edp",
      gender: product.gender || "unisex",

      is_active: isTrue(product.is_active),
      is_featured: isTrue(product.is_featured),
      is_best_seller: isTrue(product.is_best_seller),
      is_new: isTrue(product.is_new),

      sort_order: product.sort_order ?? 0,
      categories: productCategories,
    });

    setSelectedImages([]);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving || uploadingImages) return;

    setShowForm(false);
    setEditingId(null);
    setSelectedImages([]);
    setForm({ ...emptyForm });
  };

  // =========================
  // CATEGORY SELECTION
  // =========================

  const handleCategoryChange = (categoryId) => {
    const id = Number(categoryId);

    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((item) => item !== id)
        : [...prev.categories, id],
    }));
  };

  // =========================
  // IMAGE SELECTION
  // =========================

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      toast.error(
        tr("Please select image files only", "اختر ملفات صور فقط")
      );
    }

    setSelectedImages((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);

    event.target.value = "";
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => {
      const image = prev[index];

      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  // =========================
  // UPLOAD PRODUCT IMAGES
  // =========================

  const uploadProductImages = async (productId) => {
    if (!productId || !selectedImages.length) return;

    setUploadingImages(true);

    try {
      const formData = new FormData();

      selectedImages.forEach((item) => {
        formData.append("images", item.file);
      });

      await axios.post(
        `${API_URL}/products/${productId}/images`,
        formData,
        {
          headers: getHeaders(),
        }
      );

      selectedImages.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });

      setSelectedImages([]);

      toast.success(
        tr("Images uploaded successfully", "تم رفع الصور بنجاح")
      );

      return true;
    } catch (error) {
      console.error(
        "Upload images error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          tr("Failed to upload images", "فشل رفع الصور")
      );

      return false;
    } finally {
      setUploadingImages(false);
    }
  };

  // =========================
  // DELETE PRODUCT IMAGE
  // =========================

  const handleDeleteImage = async (image) => {
    const imageId = image?.id || image?.image_id;

    if (!editingId || !imageId) {
      toast.error(
        tr("Image ID is missing", "رقم الصورة غير موجود")
      );
      return;
    }

    if (
      !window.confirm(
        tr("Delete this image?", "هل تريد حذف هذه الصورة؟")
      )
    ) {
      return;
    }

    setDeletingImageId(imageId);

    try {
      await axios.delete(
        `${API_URL}/products/${editingId}/images/${imageId}`,
        {
          headers: getHeaders(),
        }
      );

      toast.success(
        tr("Image deleted successfully", "تم حذف الصورة بنجاح")
      );

      // Update image list immediately
      setProducts((prev) =>
        prev.map((product) =>
          String(product.id) === String(editingId)
            ? {
                ...product,
                images: getImages(product).filter(
                  (item) =>
                    String(item.id || item.image_id) !==
                    String(imageId)
                ),
              }
            : product
        )
      );
    } catch (error) {
      console.error(
        "Delete image error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          tr("Failed to delete image", "فشل حذف الصورة")
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  // =========================
  // CREATE / UPDATE PRODUCT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name_en.trim() && !form.name_ar.trim()) {
      toast.error(
        tr("Please enter product name", "يرجى إدخال اسم المنتج")
      );
      return;
    }

    if (!form.sku.trim()) {
      toast.error(
        tr("Please enter product SKU", "يرجى إدخال كود المنتج")
      );
      return;
    }

    if (
      form.base_price === "" ||
      Number(form.base_price) < 0
    ) {
      toast.error(
        tr("Please enter a valid price", "يرجى إدخال سعر صحيح")
      );
      return;
    }

    const payload = {
      sku: form.sku.trim(),
      name_ar: form.name_ar.trim(),
      name_en: form.name_en.trim(),

      slug:
        form.slug.trim() ||
        slugify(form.name_en || form.name_ar),

      short_desc_ar: form.short_desc_ar,
      short_desc_en: form.short_desc_en,

      description_ar: form.description_ar,
      description_en: form.description_en,

      brand_id: Number(form.brand_id) || 1,

      base_price: Number(form.base_price),

      sale_price:
        form.sale_price === ""
          ? null
          : Number(form.sale_price),

      cost_price:
        form.cost_price === ""
          ? null
          : Number(form.cost_price),

      stock_qty: Number(form.stock_qty) || 0,
      low_stock_alert: Number(form.low_stock_alert) || 0,
      volume_ml: Number(form.volume_ml) || 0,

      concentration: form.concentration,
      gender: form.gender,

      // API receives 1 or 0
      is_active: form.is_active ? 1 : 0,
      is_featured: form.is_featured ? 1 : 0,
      is_best_seller: form.is_best_seller ? 1 : 0,
      is_new: form.is_new ? 1 : 0,

      sort_order: Number(form.sort_order) || 0,

      categories: form.categories.map(Number),
    };

    setSaving(true);

    try {
      let productId = editingId;

      // =========================
      // UPDATE PRODUCT - PUT
      // =========================

      if (editingId) {
        const currentProduct = products.find(
          (item) =>
            String(item.id) === String(editingId)
        );

        const updateResponse = await axios.put(
          `${API_URL}/products/${editingId}`,
          payload,
          {
            headers: getHeaders(),
          }
        );

        console.log(
          "UPDATE PRODUCT RESPONSE:",
          updateResponse.data
        );

        const responseData = updateResponse.data;

        const apiProduct =
          responseData?.data?.product ||
          responseData?.product ||
          responseData?.data ||
          {};

        // Preserve old product information
        const updatedProduct = {
          ...(currentProduct || {}),
          ...payload,

          ...(apiProduct &&
          typeof apiProduct === "object" &&
          !Array.isArray(apiProduct)
            ? apiProduct
            : {}),

          id: editingId,

          // Ensure latest price and stock appear in table
          sale_price: payload.sale_price,
          stock_qty: payload.stock_qty,

          is_active: payload.is_active,
          is_featured: payload.is_featured,
          is_best_seller: payload.is_best_seller,
          is_new: payload.is_new,

          effective_price:
            payload.sale_price !== null
              ? payload.sale_price
              : payload.base_price,
        };

        setProducts((prev) => {
          const exists = prev.some(
            (item) =>
              String(item.id) === String(editingId)
          );

          if (exists) {
            return prev.map((item) =>
              String(item.id) === String(editingId)
                ? updatedProduct
                : item
            );
          }

          return [updatedProduct, ...prev];
        });

        toast.success(
          tr(
            "Product updated successfully",
            "تم تحديث المنتج بنجاح"
          )
        );
      }

      // =========================
      // CREATE PRODUCT - POST
      // =========================

      else {
        const response = await axios.post(
          `${API_URL}/products`,
          payload,
          {
            headers: getHeaders(),
          }
        );

        console.log(
          "CREATE PRODUCT RESPONSE:",
          response.data
        );

        const responseData = response.data;

        productId =
          responseData?.data?.product?.id ||
          responseData?.data?.product_id ||
          responseData?.data?.id ||
          responseData?.product?.id ||
          responseData?.product_id ||
          responseData?.id ||
          null;

        if (!productId) {
          productId = await findCreatedProductId(payload);
        }

        if (!productId) {
          toast.error(
            tr(
              "Product created, but its ID could not be found.",
              "تم إنشاء المنتج ولكن لم يتم العثور على رقمه."
            )
          );

          await loadProducts();

          setShowForm(false);
          setForm({ ...emptyForm });
          return;
        }

        toast.success(
          tr(
            "Product created successfully",
            "تم إنشاء المنتج بنجاح"
          )
        );
      }

      // =========================
      // UPLOAD SELECTED IMAGES
      // =========================

      if (selectedImages.length && productId) {
        await uploadProductImages(productId);
      }

      // =========================
      // RESET FORM
      // =========================

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setSelectedImages([]);

      // Reload after creating only
      if (!editingId) {
        await loadProducts();
      }
    } catch (error) {
      console.error(
        "Save product error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          tr("Failed to save product", "فشل حفظ المنتج")
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(labels.deleteConfirm)) return;

    setDeleting(true);

    try {
      await axios.delete(
        `${API_URL}/products/${productId}`,
        {
          headers: getHeaders(),
        }
      );

      setProducts((prev) =>
        prev.filter(
          (product) =>
            String(product.id) !== String(productId)
        )
      );

      toast.success(
        tr(
          "Product deleted successfully",
          "تم حذف المنتج بنجاح"
        )
      );
    } catch (error) {
      console.error(
        "Delete product error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          tr("Failed to delete product", "فشل حذف المنتج")
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((product) =>
      [
        product.name_en,
        product.name_ar,
        product.sku,
        product.slug,
      ].some((value) =>
        value?.toString().toLowerCase().includes(keyword)
      )
    );
  }, [products, search]);

  // =========================
  // STATISTICS
  // =========================

  const activeCount = products.filter((product) =>
    isTrue(product.is_active)
  ).length;

  const outOfStockCount = products.filter(
    (product) => Number(product.stock_qty) <= 0
  ).length;

  // =========================
  // PRODUCT IMAGE COMPONENT
  // =========================

  const ProductImage = ({
    product,
    size = "h-14 w-14",
  }) => {
    const image =
      getImageUrl(getImages(product)[0]) ||
      product.primary_image ||
      product.image_url;

    return (
      <div
        className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100`}
      >
        {image ? (
          <img
            src={image}
            alt={product.name_en || "Product"}
            className="h-full w-full object-cover"
          />
        ) : (
          <FiImage className="text-xl text-gray-400" />
        )}
      </div>
    );
  };

  // =========================
  // UI
  // =========================

  return (
    <div
      dir={dir}
      className="min-h-screen min-w-0 bg-gray-100 p-3 sm:p-5 lg:p-6"
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-5">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <FiPackage size={20} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {labels.products}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {tr(
                  "Manage your store products",
                  "إدارة منتجات المتجر"
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FiRefreshCw
                className={loading ? "animate-spin" : ""}
              />
              {labels.refresh}
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
            >
              <FiPlus size={18} />
              {labels.add}
            </button>
          </div>
        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title={labels.total}
            value={products.length}
            icon={FiPackage}
          />

          <StatCard
            title={labels.activeProducts}
            value={activeCount}
            icon={FiCheckCircle}
          />

          <StatCard
            title={labels.outOfStock}
            value={outOfStockCount}
            icon={FiAlertCircle}
          />
        </div>

        {/* SEARCH */}

        <div className="relative">
          <FiSearch
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
              isArabic ? "right-4" : "left-4"
            }`}
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={labels.search}
            className={`${inputClass} ${
              isArabic ? "pr-11" : "pl-11"
            }`}
          />
        </div>

        {/* PRODUCT TABLE */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <h2 className="font-bold text-gray-900">
              {tr("All Products", "كل المنتجات")}
            </h2>

            <p className="text-xs text-gray-500">
              {filteredProducts.length}{" "}
              {tr("products found", "منتج")}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-gray-500">
              <FiRefreshCw className="animate-spin text-2xl" />
              <p className="text-sm">{labels.loading}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 text-center">
              <FiPackage className="text-3xl text-gray-400" />

              <p className="font-semibold text-gray-700">
                {labels.noProducts}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden w-full overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-center">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-4">
                        {labels.product}
                      </th>

                      <th className="px-5 py-4">
                        {labels.sku}
                      </th>

                      <th className="px-5 py-4">
                        {labels.price}
                      </th>

                      <th className="px-5 py-4">
                        {labels.stock}
                      </th>

                      <th className="px-5 py-4">
                        {labels.status}
                      </th>

                      <th className="px-5 py-4">
                        {labels.actions}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <ProductImage product={product} />

                            <div className="min-w-0 text-start">
                              <p className="max-w-[240px] truncate text-sm font-semibold text-gray-900">
                                {isArabic
                                  ? product.name_ar || product.name_en
                                  : product.name_en || product.name_ar}
                              </p>

                              <p className="mt-1 truncate text-xs text-gray-400">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {product.sku || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {product.effective_price ??
                              product.sale_price ??
                              product.base_price ??
                              0}
                          </p>

                          {product.sale_price &&
                            Number(product.sale_price) <
                              Number(product.base_price) && (
                              <p className="text-xs text-gray-400 line-through">
                                {product.base_price}
                              </p>
                            )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              Number(product.stock_qty) <= 0
                                ? "bg-red-50 text-red-600"
                                : Number(product.stock_qty) <=
                                  Number(product.low_stock_alert || 5)
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {product.stock_qty ?? 0}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isTrue(product.is_active)
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {isTrue(product.is_active)
                              ? labels.active
                              : labels.inactive}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(product)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                              title={labels.edit}
                            >
                              <FiEdit2 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteProduct(product.id)
                              }
                              disabled={deleting}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                              title={labels.delete}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}

              <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-0 rounded-xl border border-gray-200 p-3"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <ProductImage
                        product={product}
                        size="h-16 w-16"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-bold text-gray-900">
                          {isArabic
                            ? product.name_ar || product.name_en
                            : product.name_en || product.name_ar}
                        </h3>

                        <p className="mt-1 break-all text-xs text-gray-400">
                          {product.sku}
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            isTrue(product.is_active)
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isTrue(product.is_active)
                            ? labels.active
                            : labels.inactive}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-xs text-gray-400">
                          {labels.price}
                        </p>

                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {product.effective_price ??
                            product.sale_price ??
                            product.base_price ??
                            0}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          {labels.stock}
                        </p>

                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {product.stock_qty ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(product)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2.5 text-xs font-semibold text-white"
                      >
                        <FiEdit2 />
                        {labels.edit}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteProduct(product.id)
                        }
                        disabled={deleting}
                        className="flex h-10 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showForm && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 p-2 py-5 backdrop-blur-[2px] sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="my-auto flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                  {editingId ? <FiEdit2 /> : <FiPlus />}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingId ? labels.edit : labels.add}
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {tr(
                      "Enter product information",
                      "أدخل بيانات المنتج"
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving || uploadingImages}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="space-y-6 p-4 sm:p-6">

                {/* BASIC INFORMATION */}

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <FiPackage className="text-gray-500" />

                    <h3 className="font-bold text-gray-800">
                      {tr("Basic Information", "البيانات الأساسية")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={labels.nameEn}>
                      <input
                        required
                        value={form.name_en}
                        onChange={(event) => {
                          const value = event.target.value;

                          setForm((prev) => ({
                            ...prev,
                            name_en: value,
                            slug: prev.slug || slugify(value),
                          }));
                        }}
                        className={inputClass}
                        placeholder="Royal Oud"
                      />
                    </Field>

                    <Field label={labels.nameAr}>
                      <input
                        value={form.name_ar}
                        onChange={(event) =>
                          updateField("name_ar", event.target.value)
                        }
                        className={inputClass}
                        placeholder="عود ملكي"
                      />
                    </Field>

                    <Field label={labels.sku}>
                      <input
                        required
                        value={form.sku}
                        onChange={(event) =>
                          updateField("sku", event.target.value)
                        }
                        className={inputClass}
                        placeholder="OE-001"
                      />
                    </Field>

                    <Field label={labels.slug}>
                      <input
                        value={form.slug}
                        onChange={(event) =>
                          updateField(
                            "slug",
                            slugify(event.target.value)
                          )
                        }
                        className={inputClass}
                        placeholder="royal-oud"
                      />
                    </Field>

                    <Field label={labels.brandId}>
                      <input
                        type="number"
                        min="1"
                        value={form.brand_id}
                        onChange={(event) =>
                          updateField("brand_id", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label={labels.sortOrder}>
                      <input
                        type="number"
                        value={form.sort_order}
                        onChange={(event) =>
                          updateField("sort_order", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </section>

                {/* DESCRIPTIONS */}

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <FiTag className="text-gray-500" />

                    <h3 className="font-bold text-gray-800">
                      {tr("Descriptions", "الأوصاف")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={labels.shortDescEn}>
                      <textarea
                        rows={3}
                        value={form.short_desc_en}
                        onChange={(event) =>
                          updateField(
                            "short_desc_en",
                            event.target.value
                          )
                        }
                        className={textareaClass}
                      />
                    </Field>

                    <Field label={labels.shortDescAr}>
                      <textarea
                        rows={3}
                        value={form.short_desc_ar}
                        onChange={(event) =>
                          updateField(
                            "short_desc_ar",
                            event.target.value
                          )
                        }
                        className={textareaClass}
                      />
                    </Field>

                    <Field label={labels.descriptionEn}>
                      <textarea
                        rows={4}
                        value={form.description_en}
                        onChange={(event) =>
                          updateField(
                            "description_en",
                            event.target.value
                          )
                        }
                        className={textareaClass}
                      />
                    </Field>

                    <Field label={labels.descriptionAr}>
                      <textarea
                        rows={4}
                        value={form.description_ar}
                        onChange={(event) =>
                          updateField(
                            "description_ar",
                            event.target.value
                          )
                        }
                        className={textareaClass}
                      />
                    </Field>
                  </div>
                </section>

                {/* PRICING AND STOCK */}

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <FiTag className="text-gray-500" />

                    <h3 className="font-bold text-gray-800">
                      {tr("Pricing & Inventory", "الأسعار والمخزون")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label={labels.basePrice}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={form.base_price}
                        onChange={(event) =>
                          updateField("base_price", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label={labels.salePrice}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.sale_price}
                        onChange={(event) =>
                          updateField("sale_price", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label={labels.costPrice}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.cost_price}
                        onChange={(event) =>
                          updateField("cost_price", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label={labels.stockQty}>
                      <input
                        type="number"
                        min="0"
                        value={form.stock_qty}
                        onChange={(event) =>
                          updateField("stock_qty", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label={labels.lowStock}>
                      <input
                        type="number"
                        min="0"
                        value={form.low_stock_alert}
                        onChange={(event) =>
                          updateField(
                            "low_stock_alert",
                            event.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label={labels.volume}>
                      <input
                        type="number"
                        min="0"
                        value={form.volume_ml}
                        onChange={(event) =>
                          updateField("volume_ml", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </section>

                {/* PRODUCT DETAILS */}

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <FiLayers className="text-gray-500" />

                    <h3 className="font-bold text-gray-800">
                      {tr("Product Details", "تفاصيل المنتج")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={labels.concentration}>
                      <select
                        value={form.concentration}
                        onChange={(event) =>
                          updateField(
                            "concentration",
                            event.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="edp">EDP</option>
                        <option value="edt">EDT</option>
                        <option value="extrait">Extrait</option>
                        <option value="edc">EDC</option>
                        <option value="parfum">Parfum</option>
                      </select>
                    </Field>

                    <Field label={labels.gender}>
                      <select
                        value={form.gender}
                        onChange={(event) =>
                          updateField("gender", event.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="unisex">
                          {tr("Unisex", "للجنسين")}
                        </option>

                        <option value="male">
                          {tr("Male", "رجالي")}
                        </option>

                        <option value="female">
                          {tr("Female", "نسائي")}
                        </option>
                      </select>
                    </Field>
                  </div>
                </section>

                {/* CATEGORIES */}

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <FiLayers className="text-gray-500" />

                    <h3 className="font-bold text-gray-800">
                      {labels.categories}
                    </h3>
                  </div>

                  {categories.length === 0 ? (
                    <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                      {labels.noCategories}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {categories.map((category) => {
                        const checked =
                          form.categories.includes(
                            Number(category.id)
                          );

                        return (
                          <label
                            key={category.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                              checked
                                ? "border-gray-500 bg-gray-50"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                handleCategoryChange(category.id)
                              }
                              className="h-4 w-4 accent-gray-900"
                            />

                            <span className="min-w-0 text-sm font-medium text-gray-700">
                              {isArabic
                                ? category.name_ar || category.name_en
                                : category.name_en || category.name_ar}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* PRODUCT STATUS */}

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <FiStar className="text-gray-500" />

                    <h3 className="font-bold text-gray-800">
                      {tr("Product Status", "حالة المنتج")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Toggle
                      label={labels.productActive}
                      checked={form.is_active}
                      onChange={(value) =>
                        updateField("is_active", value)
                      }
                    />

                    <Toggle
                      label={labels.featured}
                      checked={form.is_featured}
                      onChange={(value) =>
                        updateField("is_featured", value)
                      }
                    />

                    <Toggle
                      label={labels.bestSeller}
                      checked={form.is_best_seller}
                      onChange={(value) =>
                        updateField("is_best_seller", value)
                      }
                    />

                    <Toggle
                      label={labels.newProduct}
                      checked={form.is_new}
                      onChange={(value) =>
                        updateField("is_new", value)
                      }
                    />
                  </div>
                </section>

                {/* EXISTING IMAGES */}

                {editingId && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <FiImage className="text-gray-500" />

                      <h3 className="font-bold text-gray-800">
                        {tr(
                          "Current Product Images",
                          "صور المنتج الحالية"
                        )}
                      </h3>
                    </div>

                    {(() => {
                      const currentProduct = products.find(
                        (product) =>
                          String(product.id) === String(editingId)
                      );

                      const images = getImages(currentProduct);

                      if (!images.length) {
                        return (
                          <p className="text-sm text-gray-400">
                            {tr(
                              "No images uploaded",
                              "لا توجد صور مرفوعة"
                            )}
                          </p>
                        );
                      }

                      return (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {images.map((image, index) => {
                            const imageUrl = getImageUrl(image);

                            const imageId =
                              image?.id || image?.image_id;

                            return (
                              <div
                                key={imageId || index}
                                className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                              >
                                {imageUrl && (
                                  <img
                                    src={imageUrl}
                                    alt={`Product ${index + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteImage(image)
                                  }
                                  disabled={
                                    deletingImageId === imageId
                                  }
                                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50"
                                >
                                  {deletingImageId === imageId ? (
                                    <FiRefreshCw className="animate-spin" />
                                  ) : (
                                    <FiTrash2 size={15} />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </section>
                )}

                {/* UPLOAD IMAGES */}

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <FiImage className="text-gray-500" />

                    <h3 className="font-bold text-gray-800">
                      {labels.images}
                    </h3>
                  </div>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-7 text-center hover:border-gray-500 hover:bg-gray-100">
                    <FiUploadCloud className="mb-2 text-3xl text-gray-500" />

                    <span className="text-sm font-semibold text-gray-700">
                      {labels.upload}
                    </span>

                    <span className="mt-1 text-xs text-gray-400">
                      {tr(
                        "You can select multiple images",
                        "يمكنك اختيار أكثر من صورة"
                      )}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>

                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {selectedImages.map((image, index) => (
                        <div
                          key={`${image.file.name}-${index}`}
                          className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                        >
                          <img
                            src={image.preview}
                            alt={image.file.name}
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedImage(index)
                            }
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-600 shadow-sm hover:bg-red-50"
                          >
                            <FiX size={16} />
                          </button>

                          <div className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-xs text-white">
                            {image.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* MODAL FOOTER */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-gray-100 bg-white p-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving || uploadingImages}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  {labels.cancel}
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingImages}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving || uploadingImages ? (
                    <>
                      <FiRefreshCw className="animate-spin" />

                      {uploadingImages
                        ? labels.uploading
                        : tr("Saving...", "جاري الحفظ...")}
                    </>
                  ) : (
                    <>
                      <FiSave />
                      {editingId ? labels.update : labels.save}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}










