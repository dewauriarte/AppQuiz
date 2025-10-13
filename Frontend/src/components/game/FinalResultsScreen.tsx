import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Target, Zap, TrendingUp, ArrowRight, Coins, Gem, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import LevelUpModal from './LevelUpModal';
import { useCountUp } from '@/hooks/useCountUp';

interface FinalResultsScreenProps {
  results: {
    leaderboard: Array<{
      rank: number;
      user_id: number;
      nickname: string;
      username: string;
      score: number;
      correct_answers: number;
      wrong_answers: number;
      combo_streak: number;
      highest_combo: number;
      rewards?: {
        xp: number;
        coins: number;
        gems: number;
      };
      levelUp?: {
        oldLevel: number;
        newLevel: number;
        rewards: {
          coins: number;
          gems: number;
          items: Array<{ itemId: number; quantity: number }>;
        };
      };
    }>;
    totalPlayers: number;
  };
  currentUserId: number;
  onContinue: () => void;
}

export default function FinalResultsScreen({
  results,
  currentUserId,
  onContinue,
}: FinalResultsScreenProps) {
  const { width, height } = useWindowSize();
  const currentPlayer = results.leaderboard.find(p => p.user_id === currentUserId);
  const totalQuestions = currentPlayer ? currentPlayer.correct_answers + currentPlayer.wrong_answers : 0;
  const accuracy = totalQuestions > 0 ? (currentPlayer!.correct_answers / totalQuestions) * 100 : 0;

  const topThree = results.leaderboard.slice(0, 3);
  const isTopThree = currentPlayer && currentPlayer.rank <= 3;

  // Level up modal state
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  // Contadores animados para rewards
  const xpCount = useCountUp(currentPlayer?.rewards?.xp || 0, 2000);
  const coinsCount = useCountUp(currentPlayer?.rewards?.coins || 0, 2000);
  const gemsCount = useCountUp(currentPlayer?.rewards?.gems || 0, 2000);

  const handleContinue = () => {
    if (currentPlayer?.levelUp && !showLevelUpModal) {
      setShowLevelUpModal(true);
    } else {
      onContinue();
    }
  };

  return (
    <>
      {/* Confetti for top 3 */}
      {isTopThree && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']}
        />
      )}

      {/* Level Up Modal */}
      {currentPlayer?.levelUp && (
        <LevelUpModal
          isOpen={showLevelUpModal}
          levelUpData={currentPlayer.levelUp}
          onClose={onContinue}
        />
      )}

      <div className="min-h-screen p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Victory Badge for Top 3 */}
          {isTopThree && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-center mb-6"
            >
              <div className="inline-block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-gaming text-3xl shadow-2xl border-4 border-yellow-300">
                {currentPlayer?.rank === 1 && '👑 ¡GANADOR! 👑'}
                {currentPlayer?.rank === 2 && '🥈 ¡2DO LUGAR! 🥈'}
                {currentPlayer?.rank === 3 && '🥉 ¡3ER LUGAR! 🥉'}
              </div>
            </motion.div>
          )}

          {/* Title */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <h1 className="text-7xl font-gaming text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
              ¡JUEGO TERMINADO!
            </h1>
            <p className="text-2xl text-purple-300">{results.totalPlayers} jugadores compitieron</p>
          </motion.div>

        {/* Podium - Top 3 */}
        {topThree.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex-1 max-w-xs"
              >
                <Card className="bg-gradient-to-br from-gray-300 to-gray-500 border-4 border-gray-200 p-6 text-center h-48 flex flex-col justify-end">
                  <div className="text-6xl mb-2">🥈</div>
                  <div className="text-xl font-bold text-white">{topThree[1]?.nickname || topThree[1]?.username}</div>
                  <div className="text-3xl font-gaming text-white">{topThree[1]?.score.toLocaleString()}</div>
                </Card>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex-1 max-w-xs"
              >
                <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-300 p-6 text-center h-64 flex flex-col justify-end shadow-2xl">
                  <div className="text-8xl mb-2">👑</div>
                  <div className="text-2xl font-bold text-white">{topThree[0]?.nickname || topThree[0]?.username}</div>
                  <div className="text-4xl font-gaming text-white">{topThree[0]?.score.toLocaleString()}</div>
                </Card>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex-1 max-w-xs"
              >
                <Card className="bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-orange-300 p-6 text-center h-40 flex flex-col justify-end">
                  <div className="text-5xl mb-2">🥉</div>
                  <div className="text-lg font-bold text-white">{topThree[2]?.nickname || topThree[2]?.username}</div>
                  <div className="text-2xl font-gaming text-white">{topThree[2]?.score.toLocaleString()}</div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Current Player Stats */}
        {currentPlayer && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 border-4 border-purple-500 p-8">
              <div className="text-center mb-6">
                <div className="text-2xl text-purple-300 mb-2">Tu Posición</div>
                <div className="text-8xl font-gaming text-white mb-4">#{currentPlayer.rank}</div>
                <div className="text-5xl font-gaming text-yellow-400">{currentPlayer.score.toLocaleString()} pts</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-3xl font-gaming text-white">{accuracy.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Precisión</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-3xl font-gaming text-white">{currentPlayer.correct_answers}</div>
                  <div className="text-sm text-gray-400">Correctas</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-3xl font-gaming text-white">{currentPlayer.highest_combo}</div>
                  <div className="text-sm text-gray-400">Mejor Combo</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-3xl font-gaming text-white">{totalQuestions}</div>
                  <div className="text-sm text-gray-400">Total Preguntas</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Rewards */}
        {currentPlayer?.rewards && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-4 border-yellow-500 p-6">
              <h3 className="text-3xl font-gaming text-yellow-400 mb-6 text-center">
                🎁 ¡Recompensas Obtenidas! 🎁
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {/* XP */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 1.0 }}
                  className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-center border-3 border-blue-300 shadow-xl"
                >
                  <Star className="w-12 h-12 text-white mx-auto mb-3" />
                  <div className="text-4xl font-gaming text-white mb-1">+{xpCount.toLocaleString()}</div>
                  <div className="text-base text-blue-100 font-semibold">XP</div>
                </motion.div>

                {/* Coins */}
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 1.1 }}
                  className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6 text-center border-3 border-yellow-300 shadow-xl"
                >
                  <Coins className="w-12 h-12 text-white mx-auto mb-3" />
                  <div className="text-4xl font-gaming text-white mb-1">+{coinsCount.toLocaleString()}</div>
                  <div className="text-base text-yellow-100 font-semibold">Monedas</div>
                </motion.div>

                {/* Gems */}
                {currentPlayer.rewards.gems > 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 1.2 }}
                    className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-center border-3 border-purple-300 shadow-xl"
                  >
                    <Gem className="w-12 h-12 text-white mx-auto mb-3" />
                    <div className="text-4xl font-gaming text-white mb-1">+{gemsCount.toLocaleString()}</div>
                    <div className="text-base text-purple-100 font-semibold">Gemas</div>
                  </motion.div>
                )}
              </div>

              {/* Level up indicator */}
              {currentPlayer.levelUp && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 1.5 }}
                  className="mt-6 text-center"
                >
                  <div className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-gaming text-xl shadow-lg border-3 border-green-300 animate-pulse">
                    ⬆️ ¡Subiste de nivel! ⬆️
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-gaming text-white mb-4 text-center">Clasificación Completa</h2>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
            {results.leaderboard.map((player) => (
              <Card
                key={player.user_id}
                className={`p-4 ${
                  player.user_id === currentUserId
                    ? 'bg-purple-900 border-2 border-purple-400'
                    : 'bg-slate-800 border border-slate-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    <span className="text-2xl font-gaming text-white">#{player.rank}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-white">
                      {player.nickname || player.username}
                      {player.user_id === currentUserId && (
                        <span className="ml-2 text-purple-400 text-sm">(TÚ)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      ✓ {player.correct_answers} correctas • 🔥 Combo {player.highest_combo}
                    </div>
                  </div>
                  <div className="text-2xl font-gaming text-yellow-400">
                    {player.score.toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 text-white px-12 py-6 text-2xl font-gaming"
          >
            {currentPlayer?.levelUp && !showLevelUpModal ? 'Ver Level Up' : 'Continuar'}
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </div>
    </>
  );
}

