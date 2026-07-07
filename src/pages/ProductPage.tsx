import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ChevronLeft, Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { db } from '../lib/firebase';
import { Product } from '../types/database.types';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';

export function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      const snapshot = await getDocs(
        query(collection(db, 'products'), where('slug', '==', slug))
      );

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setProduct({
          id: doc.id,
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          price: data.price,
          originalPrice: data.originalPrice || null,
          imageUrl: data.imageUrl || null,
          images: data.images || [],
          categoryId: data.categoryId || null,
          stock: data.stock || 0,
          isNew: data.isNew || false,
          isPopular: data.isPopular || false,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      }
      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container flex flex-col items-center justify-center text-center px-4">
        <span className="text-4xl mb-4">😕</span>
        <h1 className="text-lg font-medium text-neutral-900 mb-2">
          Товар не знайдено
        </h1>
        <Link to="/catalog" className="text-neutral-500 hover:text-neutral-900 transition-colors">
          Повернутися до каталогу
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? [product.imageUrl, ...product.images].filter(Boolean)
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/profile');
      return;
    }
    await addToCart(product, quantity);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/profile');
      return;
    }
    await toggleFavorite(product);
  };

  return (
    <div className="page-container">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100">
        <div className="px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-neutral-50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite(product.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-neutral-400'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <div className="mb-4">
        {images.length > 0 ? (
          <div className="relative">
            <div className="aspect-square bg-neutral-50">
              <img
                src={images[activeImage] as string}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === idx ? 'border-neutral-900' : 'border-transparent'
                    }`}
                  >
                    <img src={img as string} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square bg-neutral-50 flex items-center justify-center">
            <span className="text-6xl">📷</span>
          </div>
        )}
      </div>

      <div className="px-4">
        {product.isNew && (
          <span className="inline-block px-2 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded mb-3">
            Новинка
          </span>
        )}

        <h1 className="text-xl font-semibold mb-2">{product.name}</h1>

        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-2xl font-bold">{product.price} грн</span>
          {product.originalPrice && (
            <span className="text-lg text-neutral-400 line-through">
              {product.originalPrice} грн
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
              -{discount}%
            </span>
          )}
        </div>

        {product.description && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-neutral-500 mb-2">Опис</h2>
            <p className="text-neutral-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-neutral-500">Наявність</span>
            <span className={product.stock > 0 ? 'text-green-600' : 'text-red-500'}>
              {product.stock > 0 ? `В наявності (${product.stock} шт.)` : 'Немає в наявності'}
            </span>
          </div>
        </div>

        {product.stock > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Кількість</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 pb-safe-bottom">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          {isInCart(product.id) ? 'Вже в кошику' : 'Додати в кошик'}
        </button>
      </div>
    </div>
  );
}
