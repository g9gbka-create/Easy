import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Filter, X, ChevronDown } from 'lucide-react';
import { db } from '../lib/firebase';
import { Product, Category } from '../types/database.types';
import { ProductCard } from '../components/ProductCard';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const categorySlug = searchParams.get('category');
  const filter = searchParams.get('filter');
  const sort = (searchParams.get('sort') as SortOption) || 'newest';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const cats: Category[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        slug: doc.data().slug,
        imageUrl: doc.data().imageUrl || null,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      setCategories(cats);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        let productsQuery = query(collection(db, 'products'));

        if (filter === 'new') {
          productsQuery = query(productsQuery, where('isNew', '==', true));
        } else if (filter === 'popular') {
          productsQuery = query(productsQuery, where('isPopular', '==', true));
        }

        const snapshot = await getDocs(productsQuery);
        let prods: Product[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          slug: doc.data().slug,
          description: doc.data().description || null,
          price: doc.data().price,
          originalPrice: doc.data().originalPrice || null,
          imageUrl: doc.data().imageUrl || null,
          images: doc.data().images || [],
          categoryId: doc.data().categoryId || null,
          stock: doc.data().stock || 0,
          isNew: doc.data().isNew || false,
          isPopular: doc.data().isPopular || false,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        if (categorySlug) {
          const category = categories.find((c) => c.slug === categorySlug);
          if (category) {
            prods = prods.filter((p) => p.categoryId === category.id);
          }
        }

        if (search) {
          const searchLower = search.toLowerCase();
          prods = prods.filter((p) => p.name.toLowerCase().includes(searchLower));
        }

        switch (sort) {
          case 'price_asc':
            prods.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            prods.sort((a, b) => b.price - a.price);
            break;
          case 'popular':
            prods.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
            break;
          default:
            prods.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        setProducts(prods);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [categorySlug, filter, sort, search, categories]);

  const updateParams = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const hasActiveFilters = categorySlug || filter || search;

  return (
    <div className="page-container px-4">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold mb-2">Каталог</h1>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border transition-colors ${
              showFilters ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Фільтри</span>
          </button>

          <button
            onClick={() => updateParams('filter', null)}
            className={`flex-shrink-0 px-3 py-2 rounded-full border text-sm transition-colors ${
              !filter ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200'
            }`}
          >
            Всі
          </button>

          <button
            onClick={() => updateParams('filter', filter === 'new' ? null : 'new')}
            className={`flex-shrink-0 px-3 py-2 rounded-full border text-sm transition-colors ${
              filter === 'new' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200'
            }`}
          >
            Новинки
          </button>

          <button
            onClick={() => updateParams('filter', filter === 'popular' ? null : 'popular')}
            className={`flex-shrink-0 px-3 py-2 rounded-full border text-sm transition-colors ${
              filter === 'popular' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200'
            }`}
          >
            Популярні
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 p-4 bg-neutral-50 rounded-xl space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Категорія</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParams('category', categorySlug === cat.slug ? null : cat.slug)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      categorySlug === cat.slug
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white border-neutral-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Сортувати за</label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => updateParams('sort', e.target.value)}
                  className="w-full appearance-none input-field pr-10"
                >
                  <option value="newest">Спочатку нові</option>
                  <option value="price_asc">Від дешевих до дорогих</option>
                  <option value="price_desc">Від дорогих до дешевих</option>
                  <option value="popular">За популярністю</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
                Очистити фільтри
              </button>
            )}
          </div>
        )}
      </header>

      {activeCategory && (
        <p className="text-sm text-neutral-500 mb-4">
          Категорія: {activeCategory.name}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-4">📦</span>
          <h2 className="text-lg font-medium text-neutral-900 mb-2">
            Товарів не знайдено
          </h2>
          <p className="text-sm text-neutral-500">
            Спробуйте змінити параметри фільтрації
          </p>
        </div>
      )}
    </div>
  );
}
