import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Settings, LogOut, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, loading, signUp, signIn, signOut, updateProfile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full" />
      </div>
    );
  }

  if (!user) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);

      try {
        const result = isLogin
          ? await signIn(email, password)
          : await signUp(email, password, fullName);

        if (result.error) {
          if (result.error.message.includes('invalid-credential') || result.error.message.includes('wrong-password')) {
            setError('Невірний email або пароль');
          } else if (result.error.message.includes('email-already-in-use')) {
            setError('Користувач з таким email вже існує');
          } else if (result.error.message.includes('weak-password')) {
            setError('Пароль занадто слабкий (мінімум 6 символів)');
          } else {
            setError(result.error.message);
          }
        } else if (!isLogin) {
          setError('Аккаунт створено успішно!');
        }
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="page-container px-4">
        <h1 className="text-2xl font-semibold mb-2">
          {isLogin ? 'Вхід' : 'Реєстрація'}
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          {isLogin
            ? 'Увійдіть у свій акаунт, щоб отримати доступ до кошика та обраного'
            : 'Створіть акаунт, щоб зберігати замовлення та обрані товари'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Ім'я</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ваше ім'я"
                className="input-field"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введіть пароль"
              className="input-field"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className={`text-sm ${error.includes('успішно') ? 'text-green-600' : 'text-red-500'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting
              ? 'Зачекайте...'
              : isLogin
                ? 'Увійти'
                : 'Зареєструватися'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          {isLogin ? 'Не маєте акаунту?' : 'Вже маєте акаунт?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-neutral-900 font-medium hover:underline"
          >
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </button>
        </p>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    await updateProfile({
      fullName,
      phone,
    });
    setEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    {
      icon: Package,
      label: 'Мої замовлення',
      description: 'Перегляд історії замовлень',
      to: '/orders',
    },
    {
      icon: Settings,
      label: 'Налаштування',
      description: 'Безпека та сповіщення',
      to: '/settings',
    },
  ];

  return (
    <div className="page-container px-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-neutral-400" />
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-semibold">
            {profile?.fullName || 'Користувач'}
          </h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Особисті дані</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            {editing ? 'Скасувати' : 'Редагувати'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Ім'я</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Телефон</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380"
                className="input-field"
              />
            </div>
            <button onClick={handleSaveProfile} className="btn-secondary text-sm py-2">
              Зберегти
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-neutral-500">Ім'я: </span>
              {profile?.fullName || 'Не вказано'}
            </p>
            <p className="text-sm">
              <span className="text-neutral-500">Телефон: </span>
              {profile?.phone || 'Не вказано'}
            </p>
          </div>
        )}
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 p-4 -mx-4 hover:bg-neutral-50 transition-colors rounded-xl"
          >
            <item.icon className="w-5 h-5 text-neutral-400" />
            <div className="flex-1">
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-neutral-500">{item.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300" />
          </Link>
        ))}

        {profile?.isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 p-4 -mx-4 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors rounded-xl"
          >
            <Shield className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-medium">Адмін-панель</p>
              <p className="text-sm text-neutral-400">Керування магазином</p>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </Link>
        )}

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full p-4 -mx-4 text-red-500 hover:bg-red-50 transition-colors rounded-xl"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Вийти з акаунту</span>
        </button>
      </nav>
    </div>
  );
}
