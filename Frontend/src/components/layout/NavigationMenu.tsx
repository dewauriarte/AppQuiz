/**
 * Navigation Menu Component
 * Sprint 7: Quick access menu for new features
 */

import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BookOpen, 
  Users, 
  Gamepad2, 
  Trophy, 
  User,
  ShoppingBag,
  Package,
  Sparkles
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Inicio', icon: Home },
  { path: '/question-sets', label: 'Preguntas', icon: BookOpen },
  { path: '/lists', label: 'Listas', icon: Users },
  { path: '/game/create', label: 'Jugar', icon: Gamepad2 },
  { path: '/leaderboard', label: 'Ranking', icon: Trophy },
  { path: '/shop', label: 'Tienda', icon: ShoppingBag, badge: 'NEW' },
  { path: '/inventory', label: 'Inventario', icon: Package, badge: 'NEW' },
  { path: '/avatar', label: 'Avatar', icon: Sparkles, badge: 'NEW' },
  { path: '/profile', label: 'Perfil', icon: User },
];

export function NavigationMenu() {
  const location = useLocation();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap relative',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

