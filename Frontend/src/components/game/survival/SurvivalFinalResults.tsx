import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Coins, Gem, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SurvivalGameFinishedPayload } from '@/types/survival.types';

interface SurvivalFinalResultsProps {
  results: SurvivalGameFinishedPayload;
  currentUserId: number;
}

/**
 * SurvivalFinalResults - Pantalla de resultados finales con podium
 */
export function SurvivalFinalResults({ results, currentUserId }: SurvivalFinalResultsProps) {
  const navigate = useNavigate();
  const currentPlayer = results.final_standings.find((p) => p.userId === currentUserId);
  const topThree = results.final_standings.slice(0, 3);
  const isWinner = results.winner_id === currentUserId;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Confetti Background for Winner */}
      {isWinner && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-transparent animate-pulse" />
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 20,
                opacity: 0,
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-6xl w-full relative z-10"
      >
        {/* Winner Announcement */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-600 px-8 py-4 rounded-full shadow-2xl border-4 border-white">
            <Crown className="w-12 h-12 text-white animate-bounce" />
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">
                {isWinner ? '¡TÚ GANASTE!' : '¡GANADOR!'}
              </h1>
              <p className="text-white font-bold text-xl">{results.winner_name}</p>
            </div>
            <Crown className="w-12 h-12 text-white animate-bounce" />
          </div>
        </motion.div>

        {/* Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            {topThree[1] && (
              <PodiumPlace
                player={topThree[1]}
                place={2}
                height="h-48"
                delay={0.6}
                currentUserId={currentUserId}
              />
            )}
            
            {/* 1st Place */}
            {topThree[0] && (
              <PodiumPlace
                player={topThree[0]}
                place={1}
                height="h-64"
                delay={0.5}
                currentUserId={currentUserId}
              />
            )}
            
            {/* 3rd Place */}
            {topThree[2] && (
              <PodiumPlace
                player={topThree[2]}
                place={3}
                height="h-40"
                delay={0.7}
                currentUserId={currentUserId}
              />
            )}
          </div>
        </motion.div>

        {/* Current Player Stats (if not in top 3) */}
        {currentPlayer && currentPlayer.rank > 3 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-3xl shadow-2xl p-6 mb-6"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Tu Posición Final</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white font-black text-2xl">#{currentPlayer.rank}</span>
                </div>
                <div>
                  <p className="font-bold text-xl text-gray-800">{currentPlayer.nickname}</p>
                  <p className="text-gray-600">
                    {currentPlayer.correct_answers} correctas • {currentPlayer.score} puntos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                  <Coins className="w-5 h-5" />
                  <span className="font-bold">+{currentPlayer.rewards.coins}</span>
                </div>
                <div className="flex items-center gap-2 text-purple-600">
                  <Gem className="w-5 h-5" />
                  <span className="font-bold">+{currentPlayer.rewards.gems}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Clasificación Final
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {results.final_standings.map((player, index) => (
              <motion.div
                key={player.userId}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 + index * 0.05 }}
                className={`
                  flex items-center justify-between p-4 rounded-xl transition-all
                  ${
                    player.userId === currentUserId
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400 shadow-lg scale-105'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div
                    className={`
                    w-14 h-14 rounded-full flex items-center justify-center font-black text-xl
                    ${getRankBgColor(player.rank)}
                  `}
                  >
                    {getRankIcon(player.rank)}
                  </div>

                  {/* Player Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-gray-800">
                        {player.nickname}
                        {player.userId === currentUserId && (
                          <span className="text-blue-600 ml-2">(TÚ)</span>
                        )}
                      </h4>
                      {player.rewards.title && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                          {player.rewards.title}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {player.correct_answers}/{player.correct_answers + player.wrong_answers} correctas
                    </p>
                  </div>
                </div>

                {/* Score & Rewards */}
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-800">{player.score}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-yellow-600 text-sm font-bold">
                      <Coins className="w-4 h-4" />
                      +{player.rewards.coins}
                    </span>
                    <span className="flex items-center gap-1 text-purple-600 text-sm font-bold">
                      <Gem className="w-4 h-4" />
                      +{player.rewards.gems}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Continuar
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

interface PodiumPlaceProps {
  player: any;
  place: 1 | 2 | 3;
  height: string;
  delay: number;
  currentUserId: number;
}

function PodiumPlace({ player, place, height, delay, currentUserId }: PodiumPlaceProps) {
  const isCurrentUser = player.userId === currentUserId;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring' }}
      className="relative"
    >
      {/* Player Card */}
      <div
        className={`
        ${isCurrentUser ? 'ring-4 ring-blue-400 scale-110' : ''}
        bg-white rounded-t-2xl p-4 shadow-xl mb-0 w-48 transition-all hover:scale-105
      `}
      >
        <div className="text-center">
          <div className="mb-2">{getMedalIcon(place)}</div>
          <h3 className="font-black text-xl text-gray-800 truncate">{player.nickname}</h3>
          {isCurrentUser && <p className="text-blue-600 font-bold text-sm">¡TÚ!</p>}
          <p className="text-3xl font-black text-gray-900 mt-2">{player.score}</p>
          <p className="text-gray-600 text-sm">{player.correct_answers} correctas</p>
          
          {/* Rewards */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <Coins className="w-4 h-4" />
              <span className="font-bold">+{player.rewards.coins}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <Gem className="w-4 h-4" />
              <span className="font-bold">+{player.rewards.gems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Podium Base */}
      <div
        className={`
        ${height} ${getPodiumColor(place)}
        rounded-b-2xl flex items-center justify-center shadow-xl
      `}
      >
        <span className="text-white font-black text-6xl opacity-30">#{place}</span>
      </div>
    </motion.div>
  );
}

function getMedalIcon(place: number) {
  if (place === 1)
    return <Trophy className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />;
  if (place === 2) return <Medal className="w-10 h-10 text-gray-400 mx-auto" />;
  return <Award className="w-10 h-10 text-orange-600 mx-auto" />;
}

function getPodiumColor(place: number) {
  if (place === 1) return 'bg-gradient-to-b from-yellow-400 to-yellow-600';
  if (place === 2) return 'bg-gradient-to-b from-gray-300 to-gray-400';
  return 'bg-gradient-to-b from-orange-400 to-orange-600';
}

function getRankIcon(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

function getRankBgColor(rank: number) {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg';
  if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800';
  if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
  return 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700';
}
