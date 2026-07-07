import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, loading } = useFavorites();

  if (!user) {
    return (
      <div className="page-container flex flex-col items-center justify-center text-center px-4">
        <Heart className="w-16 h-16 text-neutral-200 mb-4" />
        <h1 className="text-lg font-medium text-neutral-900 mb-2">
          Увійдіть в акаунт
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Щоб переглядати обране, необхідно авторизуватися
        </p>
        <button onClick={() => navigate('/profile')} className="btn-primary">
          Увійти
        </button>
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

  if (favorites.length === 0) {
    return (
      <div className="page-container flex flex-col items-center justify-center text-center px-4">
        <Heart className="w-16 h-16 text-neutral-200 mb-4" />
        <h1 className="text-lg font-medium text-neutral-900 mb-2">
          Список обраного порожній
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Додавайте товари до обраного, щоб не втратити їх
        </p>
        <Link to="/catalog" className="btn-primary">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container px-4">
      <h1 className="text-2xl font-semibold mb-2">Обране</h1>
      <p className="text-sm text-neutral-500 mb-6">
        {favorites.length} {favorites.length === 1 ? 'товар' : favorites.length < 5 ? 'товари' : 'товарів'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {favorites.map((favorite) => (
          <ProductCard key={favorite.id} product={favorite.product} />
        ))}
      </div>
    </div>
  );
}
