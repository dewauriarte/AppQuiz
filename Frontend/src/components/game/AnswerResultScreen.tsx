import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Flame, Zap, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface AnswerResult {
  isCorrect: boolean;
  correctOptionId: number;
  pointsEarned: number;
  newScore: number;
  newCombo: number;
  breakdown: {
    basePoints: number;
    speedBonus: number;
    comboMultiplier: number;
    totalPoints: number;
  };
}

interface Question {
  question_id: number;
  question_text: string;
  options: Array<{
    option_id: number;
    option_text: string;
  }>;
}

interface AnswerResultScreenProps {
  result: AnswerResult;
  question: Question;
  selectedOption?: number;
}

export default function AnswerResultScreen({
  result,
  question,
}: AnswerResultScreenProps) {
  const { width, height } = useWindowSize();
  const correctOption = question.options.find(o => o.option_id === result.correctOptionId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {result.isCorrect && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl w-full"
      >
        {/* Result Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: result.isCorrect ? 0 : [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          {result.isCorrect ? (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-20 h-20 text-white" />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-2xl">
              <XCircle className="w-20 h-20 text-white" />
            </div>
          )}
        </motion.div>

        {/* Result Message */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-5xl md:text-7xl font-gaming text-center mb-6 ${
            result.isCorrect ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {result.isCorrect ? '¡CORRECTO!' : '¡INCORRECTO!'}
        </motion.h1>

        {/* Points Earned */}
        {result.isCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="text-center mb-8"
          >
            <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-4 border-yellow-400 p-6 inline-block">
              <div className="flex items-center gap-3">
                <Trophy className="w-12 h-12 text-white" />
                <div>
                  <div className="text-6xl font-gaming text-white">+{result.pointsEarned}</div>
                  <div className="text-yellow-100 text-sm">PUNTOS</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Breakdown */}
        {result.isCorrect && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-4 mb-6"
          >
            <Card className="bg-slate-800 border-2 border-blue-500 p-4 text-center">
              <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-gaming text-white">{result.breakdown.basePoints}</div>
              <div className="text-xs text-gray-400">Base</div>
            </Card>

            <Card className="bg-slate-800 border-2 border-cyan-500 p-4 text-center">
              <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-gaming text-white">+{result.breakdown.speedBonus}</div>
              <div className="text-xs text-gray-400">Velocidad</div>
            </Card>

            <Card className="bg-slate-800 border-2 border-purple-500 p-4 text-center">
              <Flame className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-gaming text-white">x{result.breakdown.comboMultiplier.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Combo</div>
            </Card>
          </motion.div>
        )}

        {/* Combo Indicator */}
        {result.newCombo >= 3 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 rounded-full border-4 border-yellow-400">
              <Flame className="w-6 h-6 text-white animate-pulse" />
              <span className="text-2xl font-gaming text-white">¡COMBO x{result.newCombo}!</span>
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Correct Answer (if wrong) */}
        {!result.isCorrect && correctOption && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800 border-2 border-green-500 p-6">
              <div className="text-green-400 font-gaming text-lg mb-2">Respuesta correcta:</div>
              <div className="text-white text-xl">{correctOption.option_text}</div>
            </Card>
          </motion.div>
        )}

        {/* Score */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <div className="text-gray-400 text-sm">Tu puntuación total</div>
          <div className="text-5xl font-gaming text-white">{result.newScore.toLocaleString()}</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

