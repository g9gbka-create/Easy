import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { ChevronRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { Product, Category } from '../types/database.types';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesSnapshot = await getDocs(query(collection(db, 'categories'), limit(8)));
        const cats: Category[] = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          slug: doc.data().slug,
          imageUrl: doc.data().imageUrl || null,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        setCategories(cats);

        const newProductsSnapshot = await getDocs(
          query(collection(db, 'products'), where('isNew', '==', true), limit(6))
        );
        const newProds: Product[] = newProductsSnapshot.docs.map((doc) => ({
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
        setNewProducts(newProds);

        const popularProductsSnapshot = await getDocs(
          query(collection(db, 'products'), where('isPopular', '==', true), limit(6))
        );
        const popularProds: Product[] = popularProductsSnapshot.docs.map((doc) => ({
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
        setPopularProducts(popularProds);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full" />
      </div>
    );
  }

  return (
    <div className="page-container px-4">
      <section className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">
          Вітаємо в EasyShoping
        </h1>
        <p className="text-neutral-500">
          Знаходьте найкращі товари за найкращими цінами
        </p>
      </section>

      {categories.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Категорії</h2>
            <Link
              to="/catalog"
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Всі <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.slug}`}
                className="flex-shrink-0 w-24 group"
              >
                <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-neutral-200 transition-colors overflow-hidden">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <p className="text-xs text-center text-neutral-700 line-clamp-2">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {newProducts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Новинки</h2>
            <Link
              to="/catalog?filter=new"
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Всі <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      )}

      {popularProducts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Популярне</h2>
            <Link
              to="/catalog?filter=popular"
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Всі <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {newProducts.length === 0 && popularProducts.length === 0 && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-4">🛍️</span>
          <h2 className="text-lg font-medium text-neutral-900 mb-2">
            Каталог скоро наповниться
          </h2>
          <p className="text-sm text-neutral-500 max-w-xs">
            Адміністратор вже готує нові товари для вас
          </p>
        </div>
      )}
    </div>
  );
}
