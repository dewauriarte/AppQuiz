/**
 * Quick Access Cards Component
 * Sprint 7: Quick access to new features
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function QuickAccessCards() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Tienda',
      description: 'Descubre items épicos',
      icon: ShoppingBag,
      path: '/shop',
      gradient: 'from-blue-500 to-purple-500',
      badge: 'NEW',
    },
    {
      title: 'Inventario',
      description: 'Gestiona tus items',
      icon: Package,
      path: '/inventory',
      gradient: 'from-green-500 to-teal-500',
      badge: 'NEW',
    },
    {
      title: 'Avatar',
      description: 'Personaliza tu estilo',
      icon: Sparkles,
      path: '/avatar',
      gradient: 'from-yellow-500 to-orange-500',
      badge: 'NEW',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden cursor-pointer group">
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
              />

              {/* Badge */}
              {card.badge && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {card.badge}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {card.description}
                </p>

                <Button
                  onClick={() => navigate(card.path)}
                  className="w-full"
                  variant="outline"
                >
                  Explorar
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

