import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export function Header() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100">
      <div className="px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          EasyShoping
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/catalog')}
            className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
            aria-label="Пошук"
          >
            <Search className="w-5 h-5 text-neutral-700" />
          </button>

          <Link to="/cart" className="relative p-2 hover:bg-neutral-50 rounded-full transition-colors">
            <ShoppingBag className="w-5 h-5 text-neutral-700" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-neutral-900 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
