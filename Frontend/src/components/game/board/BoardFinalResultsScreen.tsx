import { motion } from 'framer-motion';
import { Trophy, Award, Coins, TrendingUp, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BoardGameFinishedPayload } from '@/types/board-game';

interface BoardFinalResultsScreenProps {
  results: BoardGameFinishedPayload;
  currentUserId: number;
}

/**
 * BoardFinalResultsScreen - Pantalla de resultados finales del juego de tablero
 * Estilo Mario Party con clasificación final y estadísticas
 */
export function BoardFinalResultsScreen({
  results,
  currentUserId,
}: BoardFinalResultsScreenProps) {
  const navigate = useNavigate();
  const currentPlayer = results.final_positions.find(p => p.userId === currentUserId);
  const winner = results.final_positions.find(p => p.userId === results.winner_id);
  const isWinner = results.winner_id === currentUserId;

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-purple-500 to-purple-700';
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        {/* Winner Announcement */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-600 px-8 py-4 rounded-full shadow-2xl border-4 border-white">
            <Crown className="w-10 h-10 text-white animate-bounce" />
            <div>
              <h1 className="text-3xl font-black text-white drop-shadow-lg">
                ¡GANADOR!
              </h1>
              <p className="text-white font-bold text-xl">
                {winner?.nickname || 'Jugador'}
              </p>
            </div>
            <Crown className="w-10 h-10 text-white animate-bounce" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-gray-800 mb-2">
              ¡JUEGO TERMINADO!
            </h2>
            <p className="text-gray-600 text-lg">
              {results.final_positions.length} jugadores compitieron
            </p>
          </div>

          {/* Current Player Stats */}
          {currentPlayer && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`
                relative overflow-hidden rounded-2xl p-6 mb-8
                bg-gradient-to-br ${getRankColor(currentPlayer.rank)}
              `}
            >
              <div className="absolute top-0 right-0 opacity-10">
                <Trophy className="w-48 h-48" />
              </div>
              
              <div className="relative z-10">
                <p className="text-white/90 text-sm font-semibold mb-2">Tu Posición</p>
                <h3 className="text-6xl font-black text-white mb-6">
                  {getRankEmoji(currentPlayer.rank)}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/80 text-sm">Puntos</p>
                    <p className="text-3xl font-black text-white">{currentPlayer.score}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/80 text-sm">Casilla Final</p>
                    <p className="text-3xl font-black text-white">{currentPlayer.board_position}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <Coins className="w-4 h-4" /> Monedas
                    </p>
                    <p className="text-3xl font-black text-white">{currentPlayer.coins_collected}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/80 text-sm">Ranking</p>
                    <p className="text-3xl font-black text-white">#{currentPlayer.rank}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Full Leaderboard */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Clasificación Completa
            </h3>

            <div className="space-y-3">
              {results.final_positions.map((player, index) => (
                <motion.div
                  key={player.userId}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl transition-all
                    ${player.userId === currentUserId
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400 shadow-lg scale-105'
                      : 'bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                >
                  {/* Rank Badge */}
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl
                    ${player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                      player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                      player.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                      'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                    }
                  `}>
                    {player.rank <= 3 ? getRankEmoji(player.rank) : `#${player.rank}`}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg text-gray-800 truncate">
                        {player.nickname}
                        {player.userId === currentUserId && (
                          <span className="ml-2 text-blue-600">(TÚ)</span>
                        )}
                      </h4>
                      {player.userId === results.winner_id && (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📍 Casilla {player.board_position}</span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-4 h-4" /> {player.coins_collected} monedas
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-3xl font-black text-gray-800">
                      {player.score}
                    </p>
                    <p className="text-sm text-gray-500">puntos</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reason */}
          {results.reason && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-center text-blue-800 font-medium">
                {results.reason === 'reached_end' && '🏁 Un jugador llegó a la meta'}
                {results.reason === 'max_turns' && '⏱️ Se alcanzó el límite de turnos'}
                {results.reason === 'timeout' && '⏰ Tiempo agotado'}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Continuar
          </motion.button>
        </motion.div>

        {/* Confetti Effect for Winner */}
        {isWinner && (
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-transparent animate-pulse" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
