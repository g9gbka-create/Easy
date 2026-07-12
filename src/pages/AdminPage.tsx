import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Save, ChevronLeft, Image } from 'lucide-react';
import { db, } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Product, Category } from '../types/database.types';

type Tab = 'products' | 'categories';

export function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', imageUrl: '' });
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    imageUrl: '',
    categoryId: '',
    stock: '0',
    isNew: false,
    isPopular: false,
  });

  useEffect(() => {
    if (profile && !isAdmin) {
      navigate('/');
    }
  }, [profile, isAdmin, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchData = async () => {
      try {
        const productsSnapshot = await getDocs(
          query(collection(db, 'products'), orderBy('createdAt', 'desc'))
        );
        const prods: Product[] = productsSnapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          slug: d.data().slug,
          description: d.data().description || null,
          price: d.data().price,
          originalPrice: d.data().originalPrice || null,
          imageUrl: d.data().imageUrl || null,
          images: d.data().images || [],
          categoryId: d.data().categoryId || null,
          stock: d.data().stock || 0,
          isNew: d.data().isNew || false,
          isPopular: d.data().isPopular || false,
          createdAt: d.data().createdAt?.toDate() || new Date(),
        }));
        setProducts(prods);

        const categoriesSnapshot = await getDocs(query(collection(db, 'categories'), orderBy('name')));
        const cats: Category[] = categoriesSnapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          slug: d.data().slug,
          imageUrl: d.data().imageUrl || null,
          createdAt: d.data().createdAt?.toDate() || new Date(),
        }));
        setCategories(cats);
      } catch {
        // silently ignore fetch errors on admin page
      }
      setLoading(false);
    };

    fetchData();
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full" />
      </div>
    );
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name || !categoryForm.slug) return;

    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        name: categoryForm.name,
        slug: categoryForm.slug.toLowerCase().replace(/\s+/g, '-'),
        imageUrl: categoryForm.imageUrl || null,
        createdAt: serverTimestamp(),
      });

      setCategories([
        ...categories,
        {
          id: docRef.id,
          name: categoryForm.name,
          slug: categoryForm.slug.toLowerCase().replace(/\s+/g, '-'),
          imageUrl: categoryForm.imageUrl || null,
          createdAt: new Date(),
        },
      ]);
      setCategoryForm({ name: '', slug: '', imageUrl: '' });
      setShowCategoryForm(false);
    } catch {
      // silently ignore
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) return;

    try {
      let imageUrls: string[] = [];

if (imageFiles.length > 0) {
  for (const file of imageFiles) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Easyshoping');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/rdadjapv/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Помилка завантаження фото');
    }

    imageUrls.push(data.secure_url);
  }
} else if (productForm.imageUrl) {
  imageUrls = [productForm.imageUrl];
}

      const slug =
  productForm.slug.trim() ||
  productForm.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

      const productData = {
        name: productForm.name,
        slug,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        imageUrl: imageUrls[0] || null,
images: imageUrls,
        categoryId: productForm.categoryId || null,
        stock: parseInt(productForm.stock) || 0,
        isNew: productForm.isNew,
        isPopular: productForm.isPopular,
        createdAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id
              ? { ...p, ...productData, images: imageUrl ? [imageUrl] : p.images, createdAt: p.createdAt }
              : p
          )
        );
      } else {
        const docRef = await addDoc(collection(db, 'products'), productData);
        setProducts([
          {
            id: docRef.id,
            ...productData,
            images: imageUrl ? [imageUrl] : [],
            createdAt: new Date(),
          },
          ...products,
        ]);
      }

      setImageFile(null);
      setEditingProduct(null);
      resetProductForm();
      setShowProductForm(false);
    } catch {
      // silently ignore
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Видалити цей товар?')) return;

    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      // silently ignore
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Видалити цю категорію?')) return;

    try {
      await deleteDoc(doc(db, 'categories', id));
      setCategories(categories.filter((c) => c.id !== id));
    } catch {
      // silently ignore
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      originalPrice: '',
      imageUrl: '',
      categoryId: '',
      stock: '0',
      isNew: false,
      isPopular: false,
    });
    setEditingProduct(null);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setImageFile(null);
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId || '',
      stock: product.stock.toString(),
      isNew: product.isNew,
      isPopular: product.isPopular,
    });
    setShowProductForm(true);
  };

  return (
    <div className="page-container px-4">
      <header className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад
        </button>
        <h1 className="text-2xl font-semibold">Адмін-панель</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Керування товарами та категоріями
        </p>
      </header>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setTab('products')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === 'products'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          Товари ({products.length})
        </button>
        <button
          onClick={() => setTab('categories')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === 'categories'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          Категорії ({categories.length})
        </button>
      </div>

      {tab === 'products' && (
        <>
          <button
            onClick={() => {
              resetProductForm();
              setImageFile(null);
              setShowProductForm(true);
            }}
            className="w-full py-3 mb-4 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Додати товар
          </button>

          {showProductForm && (
            <div className="card p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  {editingProduct ? 'Редагувати товар' : 'Новий товар'}
                </h3>
                <button
                  onClick={() => {
                    setShowProductForm(false);
                    setImageFile(null);
                    resetProductForm();
                  }}
                  className="p-1 hover:bg-neutral-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Назва товару"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Slug (URL)"
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  className="input-field"
                />
                <textarea
                  placeholder="Опис"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="input-field min-h-20 resize-none"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">
                    Фото товару
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer w-full py-2 px-3 border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors">
                    <Image className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">
                      {
  imageFiles.length > 0
    ? `Вибрано фото: ${imageFiles.length}`
    : 'Вибрати зображення з пристрою'
                      }
                    </span>
                    <input
  type="file"
  accept="image/*"
  multiple
  className="hidden"
  onChange={(e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  }}
/>
                  </label>
                  {imageFile && (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="preview"
                      className="w-28 h-28 object-cover rounded-lg border border-neutral-200"
                    />
                  )}
                  {!imageFile && productForm.imageUrl && (
                    <img
                      src={productForm.imageUrl}
                      alt="current"
                      className="w-28 h-28 object-cover rounded-lg border border-neutral-200"
                    />
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Ціна"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="input-field flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Стара ціна"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="input-field flex-1"
                  />
                </div>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Без категорії</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Кількість на складі"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className="input-field"
                />
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isNew}
                      onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                      className="w-5 h-5 rounded border-neutral-200"
                    />
                    <span className="text-sm">Новинка</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isPopular}
                      onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                      className="w-5 h-5 rounded border-neutral-200"
                    />
                    <span className="text-sm">Популярний</span>
                  </label>
                </div>
                <button
                  onClick={handleSaveProduct}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingProduct ? 'Зберегти зміни' : 'Додати товар'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="card p-3 flex gap-3">
                <div className="w-16 h-16 bg-neutral-50 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-6 h-6 text-neutral-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-sm text-neutral-500">{product.price} грн</p>
                  <div className="flex gap-2 mt-1">
                    {product.isNew && (
                      <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-xs rounded">Новинка</span>
                    )}
                    {product.isPopular && (
                      <span className="px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded">Популярний</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditProduct(product)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-neutral-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'categories' && (
        <>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="w-full py-3 mb-4 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Додати категорію
          </button>

          {showCategoryForm && (
            <div className="card p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Нова категорія</h3>
                <button
                  onClick={() => setShowCategoryForm(false)}
                  className="p-1 hover:bg-neutral-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Назва категорії"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Slug (URL)"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="input-field"
                />
                <button
                  onClick={handleSaveCategory}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Додати категорію
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="card p-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-50 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-5 h-5 text-neutral-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  <p className="text-xs text-neutral-400">{category.slug}</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}