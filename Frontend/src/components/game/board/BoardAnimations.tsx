import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * PlayerMovementAnimation - Animación de movimiento suave del jugador
 */
interface PlayerMovementAnimationProps {
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  path: Array<{ x: number; y: number }>;
  duration?: number;
  onComplete?: () => void;
  children: React.ReactNode;
}

export function PlayerMovementAnimation({
  fromPosition,
  toPosition,
  path,
  duration = 1.5,
  onComplete,
  children,
}: PlayerMovementAnimationProps) {
  const controls = useAnimation();

  useEffect(() => {
    const animate = async () => {
      // Animar a través del path
      for (let i = 0; i < path.length; i++) {
        await controls.start({
          x: path[i].x,
          y: path[i].y,
          transition: { 
            duration: duration / path.length,
            ease: 'easeInOut',
          },
        });
      }
      onComplete?.();
    };

    animate();
  }, [path, duration, controls, onComplete]);

  return (
    <motion.div
      initial={{ x: fromPosition.x, y: fromPosition.y }}
      animate={controls}
      style={{ position: 'absolute' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * CoinCollectionAnimation - Moneda volando al HUD
 */
interface CoinCollectionAnimationProps {
  startPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  amount: number;
  onComplete?: () => void;
}

export function CoinCollectionAnimation({
  startPosition,
  targetPosition,
  amount,
  onComplete,
}: CoinCollectionAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <>
      {Array.from({ length: Math.min(amount / 10, 10) }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: startPosition.x,
            y: startPosition.y,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: targetPosition.x,
            y: targetPosition.y,
            scale: 0.3,
            opacity: 0.5,
          }}
          transition={{
            duration: 1,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
          className="fixed text-4xl pointer-events-none z-50"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))',
          }}
        >
          💰
        </motion.div>
      ))}
    </>
  );
}

/**
 * ScreenShakeEffect - Efecto de shake en la pantalla
 */
interface ScreenShakeEffectProps {
  trigger: boolean;
  intensity?: number;
  duration?: number;
  children: React.ReactNode;
}

export function ScreenShakeEffect({
  trigger,
  intensity = 10,
  duration = 0.5,
  children,
}: ScreenShakeEffectProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        x: [0, -intensity, intensity, -intensity, intensity, 0],
        y: [0, intensity, -intensity, intensity, -intensity, 0],
        transition: { duration, ease: 'easeInOut' },
      });
    }
  }, [trigger, intensity, duration, controls]);

  return (
    <motion.div animate={controls}>
      {children}
    </motion.div>
  );
}

/**
 * FloatingText - Texto flotante (damage, bonus, etc)
 */
interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  onComplete?: () => void;
}

export function FloatingText({
  text,
  x,
  y,
  color = '#FFD700',
  size = 'md',
  onComplete,
}: FloatingTextProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <motion.div
      initial={{ x, y, opacity: 1, scale: 0 }}
      animate={{
        y: y - 100,
        opacity: 0,
        scale: 1.5,
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className={`fixed pointer-events-none z-50 font-bold ${sizes[size]}`}
      style={{ color, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
    >
      {text}
    </motion.div>
  );
}

/**
 * ParticleExplosion - Explosión de partículas
 */
interface ParticleExplosionProps {
  x: number;
  y: number;
  particleCount?: number;
  particleColor?: string;
  particleEmoji?: string;
  onComplete?: () => void;
}

export function ParticleExplosion({
  x,
  y,
  particleCount = 20,
  particleColor = '#FFD700',
  particleEmoji,
  onComplete,
}: ParticleExplosionProps) {
  const [particles] = useState(() =>
    Array.from({ length: particleCount }).map(() => ({
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 200 + 100,
      size: Math.random() * 20 + 10,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          initial={{
            x,
            y,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: x + Math.cos(particle.angle) * particle.speed,
            y: y + Math.sin(particle.angle) * particle.speed,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
          className="absolute"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particleEmoji ? 'transparent' : particleColor,
            borderRadius: '50%',
            fontSize: particleEmoji ? particle.size : undefined,
          }}
        >
          {particleEmoji}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * PulseRing - Anillo pulsante (para indicar posición)
 */
interface PulseRingProps {
  x: number;
  y: number;
  size?: number;
  color?: string;
}

export function PulseRing({
  x,
  y,
  size = 100,
  color = '#FFD700',
}: PulseRingProps) {
  return (
    <motion.div
      className="fixed pointer-events-none z-40"
      style={{ left: x - size / 2, top: y - size / 2 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.8, 0.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `4px solid ${color}`,
        }}
      />
    </motion.div>
  );
}

/**
 * PathTracer - Trazo del camino que seguirá el jugador
 */
interface PathTracerProps {
  path: Array<{ x: number; y: number }>;
  color?: string;
  duration?: number;
  onComplete?: () => void;
}

export function PathTracer({
  path,
  color = '#FFD700',
  duration = 1,
  onComplete,
}: PathTracerProps) {
  const pathString = path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  return (
    <svg className="fixed inset-0 pointer-events-none z-30" style={{ width: '100%', height: '100%' }}>
      <motion.path
        d={pathString}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="10 5"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 0 }}
        transition={{ duration, ease: 'easeInOut' }}
        onAnimationComplete={onComplete}
      />
    </svg>
  );
}

/**
 * PopIn - Animación de aparición pop
 */
interface PopInProps {
  children: React.ReactNode;
  delay?: number;
}

export function PopIn({ children, delay = 0 }: PopInProps) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring',
        delay,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn - Animación de deslizamiento
 */
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
}

export function SlideIn({ 
  children, 
  direction = 'bottom',
  delay = 0 
}: SlideInProps) {
  const variants = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    top: { x: 0, y: -100 },
    bottom: { x: 0, y: 100 },
  };

  return (
    <motion.div
      initial={{ ...variants[direction], opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * GemCollectionAnimation - Gemas volando al HUD
 */
interface GemCollectionAnimationProps {
  startPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  amount: number;
  onComplete?: () => void;
}

export function GemCollectionAnimation({
  startPosition,
  targetPosition,
  amount,
  onComplete,
}: GemCollectionAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <>
      {Array.from({ length: Math.min(amount, 5) }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: startPosition.x,
            y: startPosition.y,
            scale: 1,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: targetPosition.x,
            y: targetPosition.y,
            scale: 0.5,
            opacity: 0.7,
            rotate: 360,
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
          className="fixed text-3xl pointer-events-none z-50"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(255, 20, 147, 0.8))',
          }}
        >
          💎
        </motion.div>
      ))}
    </>
  );
}
