import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (!user) {
    return (
      <div className="page-container flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-neutral-200 mb-4" />
        <h1 className="text-lg font-medium text-neutral-900 mb-2">
          Увійдіть в акаунт
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Щоб переглядати кошик, необхідно авторизуватися
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

  if (items.length === 0) {
    return (
      <div className="page-container flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-neutral-200 mb-4" />
        <h1 className="text-lg font-medium text-neutral-900 mb-2">
          Кошик порожній
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Додайте товари, щоб оформити замовлення
        </p>
        <Link to="/catalog" className="btn-primary">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container px-4">
      <h1 className="text-2xl font-semibold mb-6">Кошик</h1>

      <div className="space-y-3 mb-32">
        {items.map((item) => {
          const product = item.product;
          const itemTotal = product.price * item.quantity;

          return (
            <div key={item.id} className="card p-4">
              <div className="flex gap-3">
                <Link
                  to={`/product/${product.slug}`}
                  className="flex-shrink-0 w-20 h-20 bg-neutral-50 rounded-lg overflow-hidden"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <span className="text-xl">📷</span>
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${product.slug}`}
                    className="block text-sm font-medium text-neutral-900 line-clamp-2 hover:text-neutral-600 transition-colors mb-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-neutral-500 mb-2">
                    {product.price} грн / шт
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, item.quantity + 1)}
                        disabled={item.quantity >= product.stock}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                <span className="text-sm text-neutral-500">Разом:</span>
                <span className="font-semibold">{itemTotal} грн</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-neutral-100 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-500">
              {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товари' : 'товарів'}
            </span>
            <div className="text-right">
              <span className="text-sm text-neutral-500">Всього:</span>
              <span className="text-xl font-bold ml-2">{totalPrice} грн</span>
            </div>
          </div>

          <button className="btn-primary flex items-center justify-center gap-2">
            Оформити замовлення
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
