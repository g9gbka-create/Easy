import { NavLink } from 'react-router-dom';
import { Home, Grid3X3, Heart, User } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Головна', icon: Home },
  { path: '/catalog', label: 'Каталог', icon: Grid3X3 },
  { path: '/favorites', label: 'Обране', icon: Heart },
  { path: '/profile', label: 'Профіль', icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100 pb-safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                isActive ? 'text-neutral-900' : 'text-neutral-400'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
