import { motion } from 'framer-motion';
import { Users, Trophy, Zap, Shield, Crown } from 'lucide-react';
import type { SurvivalGameState } from '@/types/survival.types';

interface SurvivalLobbyProps {
  gameState: SurvivalGameState;
  playersConnected: number;
}

/**
 * SurvivalLobby - Pantalla de espera antes de iniciar
 * Muestra contador de jugadores y configuración
 */
export function SurvivalLobby({ gameState, playersConnected }: SurvivalLobbyProps) {
  const { config } = gameState;
  const percentage = (playersConnected / config.max_players) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 rounded-full mb-4"
          >
            <Trophy className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-black text-white">SURVIVAL MODE</h1>
            <Trophy className="w-8 h-8 text-white" />
          </motion.div>
          
          <p className="text-white/80 text-lg">
            Battle Royale Educativo
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
        >
          {/* Player Counter */}
          <div className="text-center mb-8">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-6 rounded-2xl border-4 border-white/30"
              >
                <Users className="w-12 h-12 text-white" />
                <div>
                  <div className="text-6xl font-black text-white">
                    {playersConnected}
                    <span className="text-white/60">/{config.max_players}</span>
                  </div>
                  <p className="text-white/80 text-sm">Jugadores conectados</p>
                </div>
              </motion.div>

              {/* Progress Bar */}
              <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <InfoCard
              icon={<Zap className="w-6 h-6" />}
              label="Rondas"
              value={config.total_rounds}
              delay={1.0}
            />
            <InfoCard
              icon={<Shield className="w-6 h-6" />}
              label="Eliminación"
              value={`${(config.elimination_rate * 100).toFixed(0)}%`}
              delay={1.1}
            />
            <InfoCard
              icon={<Crown className="w-6 h-6" />}
              label="Finalistas"
              value={config.final_round_players}
              delay={1.2}
            />
            <InfoCard
              icon={<Trophy className="w-6 h-6" />}
              label="Tiempo/Pregunta"
              value={`${config.question_time_limit}s`}
              delay={1.3}
            />
          </div>

          {/* Waiting Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-white/80">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-yellow-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-yellow-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-yellow-400 rounded-full"
              />
            </div>
            <p className="text-white/80 mt-2">
              Esperando al profesor para iniciar...
            </p>
          </motion.div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-6 text-center"
        >
          <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4">
            <h3 className="text-white font-bold mb-2">📋 Cómo Jugar</h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Responde preguntas correctamente para ganar puntos</li>
              <li>• Los {(config.elimination_rate * 100).toFixed(0)}% peores jugadores son eliminados cada ronda</li>
              <li>• La zona segura se reduce progresivamente</li>
              <li>• Los últimos {config.final_round_players} entran a la ronda final</li>
              <li>• ¡Sobrevive y llega al top 3 para ganar grandes recompensas!</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  delay: number;
}

function InfoCard({ icon, label, value, delay }: InfoCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
    >
      <div className="flex items-center gap-2 mb-1 text-white/80">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
    </motion.div>
  );
}
