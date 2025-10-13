import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, Activity, Shield, Crown, Skull } from 'lucide-react';
import type { SurvivalMetadata } from '@/types/survival.types';

interface SurvivalGameHUDProps {
  metadata: SurvivalMetadata;
  currentScore: number;
  currentRank: number;
  answersReceived?: number;
  totalPlayers?: number;
}

/**
 * SurvivalGameHUD - HUD persistente durante el juego
 * Muestra información crítica del estado del juego
 */
export function SurvivalGameHUD({
  metadata,
  currentScore,
  currentRank,
  answersReceived = 0,
  totalPlayers = 0,
}: SurvivalGameHUDProps) {
  const {
    current_round,
    total_rounds,
    safe_zone_size,
    players_alive,
    is_final_round,
  } = metadata;

  const safeZoneColor = getSafeZoneColor(safe_zone_size);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
          {/* Left - Round Info */}
          <div className="flex items-center gap-4">
            <HUDCard className="bg-purple-500/90">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-white" />
                <div>
                  <div className="text-xs text-white/80">Ronda</div>
                  <div className="text-xl font-black text-white">
                    {current_round}/{total_rounds}
                  </div>
                </div>
              </div>
            </HUDCard>

            {is_final_round && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-white animate-pulse" />
                  <span className="text-white font-bold text-sm">FINAL</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Center - Safe Zone */}
          <div className="flex items-center justify-center">
            <HUDCard className={`${safeZoneColor}`}>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Shield className="w-5 h-5 text-white" />
                  <span className="text-xs text-white/90">Zona Segura</span>
                </div>
                <div className="relative">
                  <div className="text-3xl font-black text-white">{safe_zone_size}%</div>
                  <SafeZoneMeter size={safe_zone_size} />
                </div>
              </div>
            </HUDCard>
          </div>

          {/* Right - Players & Stats */}
          <div className="flex items-center justify-end gap-4">
            <HUDCard className="bg-red-500/90">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                <div>
                  <div className="text-xs text-white/80">Vivos</div>
                  <div className="text-xl font-black text-white">
                    {players_alive}
                    <span className="text-white/60 text-sm">/{metadata.total_players}</span>
                  </div>
                </div>
              </div>
            </HUDCard>

            <HUDCard className="bg-blue-500/90">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-white" />
                <div>
                  <div className="text-xs text-white/80">Tu Rank</div>
                  <div className="text-xl font-black text-white">#{currentRank}</div>
                </div>
              </div>
            </HUDCard>
          </div>
        </div>

        {/* Score Bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto mt-2"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm font-medium">Tu Puntuación:</span>
              <motion.span
                key={currentScore}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-2xl font-black text-yellow-400"
              >
                {currentScore.toLocaleString()}
              </motion.span>
            </div>

            {/* Answer Counter */}
            {totalPlayers > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">Respuestas:</span>
                <span className="text-white font-bold">
                  {answersReceived}/{totalPlayers}
                </span>
                <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(answersReceived / totalPlayers) * 100}%` }}
                    className="h-full bg-green-400"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Elimination Warning */}
      <AnimatePresence>
        {safe_zone_size <= 40 && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="bg-red-500/90 backdrop-blur-sm rounded-lg p-4 border-2 border-red-300 shadow-2xl">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Skull className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <div className="text-white font-bold">¡PELIGRO!</div>
                  <div className="text-white/90 text-sm">Zona crítica</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HUDCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg px-4 py-2 shadow-lg ${className || 'bg-gray-800/90'}`}>
      {children}
    </div>
  );
}

function SafeZoneMeter({ size }: { size: number }) {
  return (
    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/30 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: `${size}%` }}
        className={`h-full ${getSafeZoneBgColor(size)}`}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

function getSafeZoneColor(size: number): string {
  if (size >= 80) return 'bg-green-500/90';
  if (size >= 60) return 'bg-yellow-500/90';
  if (size >= 40) return 'bg-orange-500/90';
  return 'bg-red-500/90';
}

function getSafeZoneBgColor(size: number): string {
  if (size >= 80) return 'bg-green-400';
  if (size >= 60) return 'bg-yellow-400';
  if (size >= 40) return 'bg-orange-400';
  return 'bg-red-400';
}
