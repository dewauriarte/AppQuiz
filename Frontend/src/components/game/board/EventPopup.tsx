import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import type { BoardEventTrigger, BoardEventType } from '@/types/board-game';

interface EventPopupProps {
  event: BoardEventTrigger | null;
  onDismiss?: () => void;
  autoDismissDelay?: number;
}

/**
 * EventPopup - Popup animado cuando cae en un evento
 * Muestra efecto visual según tipo de evento
 */
export function EventPopup({
  event,
  onDismiss,
  autoDismissDelay = 3000,
}: EventPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!event) return;

    // Mostrar confetti para eventos bonus
    if (event.event_type.startsWith('bonus_')) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Auto-dismiss
    if (autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [event, autoDismissDelay, onDismiss]);

  if (!event) return null;

  const config = getEventConfig(event.event_type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
      >
        {/* Confetti para eventos bonus */}
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            colors={config.confettiColors}
          />
        )}

        {/* Popup principal */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            ...config.animation
          }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className={`
            relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4
            ${config.shake ? 'animate-shake' : ''}
          `}
          style={{
            background: config.gradient,
            boxShadow: `0 0 60px ${config.glowColor}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icono del evento */}
          <motion.div
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="flex justify-center mb-4"
          >
            <div className={`
              text-8xl
              ${config.iconAnimation}
            `}>
              {config.icon}
            </div>
          </motion.div>

          {/* Nombre del evento */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-center mb-2"
            style={{ color: config.titleColor }}
          >
            {config.title}
          </motion.h2>

          {/* Mensaje */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-center text-gray-700 mb-4"
          >
            {event.message}
          </motion.p>

          {/* Efectos */}
          {event.effects && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mb-4"
            >
              {event.effects.coin_change !== undefined && event.effects.coin_change !== 0 && (
                <EffectBadge
                  icon="💰"
                  value={event.effects.coin_change > 0 ? `+${event.effects.coin_change}` : event.effects.coin_change}
                  color={event.effects.coin_change > 0 ? 'green' : 'red'}
                />
              )}
              {event.effects.gem_change !== undefined && event.effects.gem_change !== 0 && (
                <EffectBadge
                  icon="💎"
                  value={`+${event.effects.gem_change}`}
                  color="pink"
                />
              )}
              {event.effects.xp_change !== undefined && event.effects.xp_change !== 0 && (
                <EffectBadge
                  icon="📚"
                  value={`+${event.effects.xp_change}`}
                  color="blue"
                />
              )}
              {event.effects.position_change !== undefined && event.effects.position_change !== 0 && (
                <EffectBadge
                  icon={event.effects.position_change > 0 ? '⬆️' : '⬇️'}
                  value={`${event.effects.position_change > 0 ? '+' : ''}${event.effects.position_change} casillas`}
                  color={event.effects.position_change > 0 ? 'purple' : 'orange'}
                />
              )}
              {event.effects.powerup_granted && (
                <EffectBadge
                  icon="⚡"
                  value={event.effects.powerup_granted}
                  color="yellow"
                />
              )}
              {event.effects.shield_granted && (
                <EffectBadge
                  icon="🛡️"
                  value="Escudo"
                  color="green"
                />
              )}
            </motion.div>
          )}

          {/* Partículas específicas del evento */}
          {config.particles && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {config.particles}
            </div>
          )}

          {/* Botón de cerrar */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onDismiss}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
          >
            Continuar
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * EffectBadge - Badge para mostrar efectos del evento
 */
interface EffectBadgeProps {
  icon: string;
  value: string | number;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'pink' | 'orange';
}

function EffectBadge({ icon, value, color }: EffectBadgeProps) {
  const colors = {
    green: 'bg-green-100 text-green-700 border-green-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    pink: 'bg-pink-100 text-pink-700 border-pink-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full border-2
        font-bold shadow-lg
        ${colors[color]}
      `}
    >
      <span className="text-xl">{icon}</span>
      <span>{value}</span>
    </motion.div>
  );
}

/**
 * Configuración de estilos y efectos por tipo de evento
 */
function getEventConfig(eventType: BoardEventType) {
  const configs: Record<BoardEventType, {
    icon: string;
    title: string;
    gradient: string;
    glowColor: string;
    titleColor: string;
    iconAnimation: string;
    shake?: boolean;
    animation?: any;
    confettiColors?: string[];
    particles?: React.ReactNode;
  }> = {
    bonus_coins: {
      icon: '💰',
      title: '¡Tesoro!',
      gradient: 'linear-gradient(135deg, #FFF9C4 0%, #FFD54F 100%)',
      glowColor: 'rgba(255, 215, 0, 0.5)',
      titleColor: '#F57F17',
      iconAnimation: 'animate-bounce',
      confettiColors: ['#FFD700', '#FFA500', '#FFFF00'],
      particles: <GoldenParticles />,
    },
    bonus_xp: {
      icon: '📚',
      title: '¡Conocimiento!',
      gradient: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)',
      glowColor: 'rgba(33, 150, 243, 0.5)',
      titleColor: '#1565C0',
      iconAnimation: 'animate-pulse',
      confettiColors: ['#2196F3', '#42A5F5', '#64B5F6'],
    },
    bonus_gems: {
      icon: '💎',
      title: '¡Gemas!',
      gradient: 'linear-gradient(135deg, #FCE4EC 0%, #F48FB1 100%)',
      glowColor: 'rgba(233, 30, 99, 0.5)',
      titleColor: '#C2185B',
      iconAnimation: 'animate-ping',
      confettiColors: ['#E91E63', '#F06292', '#F8BBD0'],
      particles: <SparkleParticles />,
    },
    trap_lose_coins: {
      icon: '⚠️',
      title: '¡Trampa!',
      gradient: 'linear-gradient(135deg, #FFEBEE 0%, #EF5350 100%)',
      glowColor: 'rgba(244, 67, 54, 0.5)',
      titleColor: '#C62828',
      iconAnimation: '',
      shake: true,
    },
    trap_go_back: {
      icon: '⬅️',
      title: '¡Retroceso!',
      gradient: 'linear-gradient(135deg, #EFEBE9 0%, #BCAAA4 100%)',
      glowColor: 'rgba(121, 85, 72, 0.5)',
      titleColor: '#5D4037',
      iconAnimation: 'animate-bounce',
      shake: true,
    },
    teleport_forward: {
      icon: '🌀',
      title: '¡Portal!',
      gradient: 'linear-gradient(135deg, #E1BEE7 0%, #BA68C8 100%)',
      glowColor: 'rgba(156, 39, 176, 0.5)',
      titleColor: '#6A1B9A',
      iconAnimation: 'animate-spin',
      animation: { rotate: 360 },
      particles: <PortalParticles />,
    },
    powerup: {
      icon: '⚡',
      title: '¡Power-Up!',
      gradient: 'linear-gradient(135deg, #FFF9C4 0%, #FFF176 100%)',
      glowColor: 'rgba(255, 235, 59, 0.5)',
      titleColor: '#F57F17',
      iconAnimation: 'animate-pulse',
      confettiColors: ['#FFEB3B', '#FDD835', '#F9A825'],
    },
    mystery_box: {
      icon: '❓',
      title: '¡Misterio!',
      gradient: 'linear-gradient(135deg, #FFF9C4 0%, #FFD54F 100%)',
      glowColor: 'rgba(255, 215, 0, 0.5)',
      titleColor: '#F57F17',
      iconAnimation: 'animate-bounce',
    },
    quiz_challenge: {
      icon: '❔',
      title: '¡Desafío!',
      gradient: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)',
      glowColor: 'rgba(33, 150, 243, 0.5)',
      titleColor: '#1565C0',
      iconAnimation: 'animate-pulse',
    },
    boss_encounter: {
      icon: '👹',
      title: '¡Boss!',
      gradient: 'linear-gradient(135deg, #FFCCBC 0%, #FF5722 100%)',
      glowColor: 'rgba(255, 87, 34, 0.5)',
      titleColor: '#BF360C',
      iconAnimation: 'animate-bounce',
      shake: true,
    },
  };

  return configs[eventType] || configs.mystery_box;
}

/**
 * Partículas doradas (bonus_coins)
 */
function GoldenParticles() {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: '50%', 
            y: '50%', 
            scale: 0,
            opacity: 1 
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Partículas brillantes (bonus_gems)
 */
function SparkleParticles() {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: '50%', 
            y: '50%',
            rotate: 0,
            scale: 0,
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            rotate: 360,
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 0.3,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute text-2xl"
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Partículas de portal (teleport)
 */
function PortalParticles() {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: '50%',
            y: '50%',
            scale: 2,
            opacity: 0,
          }}
          animate={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.1,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute w-20 h-20 border-4 border-purple-500 rounded-full"
        />
      ))}
    </div>
  );
}

/**
 * EventIndicator - Indicador pequeño en casilla
 */
interface EventIndicatorProps {
  eventType: BoardEventType;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function EventIndicator({ 
  eventType, 
  animated = false,
  size = 'md' 
}: EventIndicatorProps) {
  const config = getEventConfig(eventType);
  
  const sizes = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-2xl',
  };

  return (
    <motion.div
      animate={animated ? { 
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0],
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1,
      }}
      className={`${sizes[size]} ${config.iconAnimation}`}
      title={config.title}
    >
      {config.icon}
    </motion.div>
  );
}
