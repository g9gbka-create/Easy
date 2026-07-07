import { Link } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { Product } from '../types/database.types';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleFavorite(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    addToCart(product);
  };

  if (compact) {
    return (
      <Link
        to={`/product/${product.slug}`}
        className="flex-shrink-0 w-44 group"
      >
        <div className="relative aspect-square bg-neutral-50 rounded-xl overflow-hidden mb-2">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <span className="text-2xl">📷</span>
            </div>
          )}

          {discount > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
              -{discount}%
            </span>
          )}
        </div>

        <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 mb-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{product.price} грн</span>
          {product.originalPrice && (
            <span className="text-xs text-neutral-400 line-through">
              {product.originalPrice} грн
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="card overflow-hidden group">
      <Link to={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-neutral-50 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <span className="text-4xl">📷</span>
            </div>
          )}

          {product.isNew && (
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded">
              Новинка
            </span>
          )}

          {discount > 0 && (
            <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 hover:text-neutral-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {user && (
            <button
              onClick={handleToggleFavorite}
              className="flex-shrink-0 p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label={isFavorite(product.id) ? 'Видалити з обраного' : 'Додати до обраного'}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite(product.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-neutral-300 hover:text-red-500'
                }`}
              />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">{product.price} грн</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-neutral-400 line-through">
                {product.originalPrice} грн
              </span>
            )}
          </div>

          {user && (
            <button
              onClick={handleAddToCart}
              className="p-2 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 active:scale-95 transition-all"
              aria-label="Додати в кошик"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
