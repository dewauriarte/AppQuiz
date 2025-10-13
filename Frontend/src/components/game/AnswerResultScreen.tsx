import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
    explanation?: string | null;
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
  selectedOption,
}: AnswerResultScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-3xl w-full"
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
          className={`text-5xl md:text-7xl font-gaming text-center mb-8 ${
            result.isCorrect ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {result.isCorrect ? '¡CORRECTO!' : '¡INCORRECTO!'}
        </motion.h1>

        {/* Explicaciones relevantes */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {!result.isCorrect && (
            <>
              {/* Tu respuesta incorrecta */}
              {(() => {
                const selectedOpt = question.options.find(o => o.option_id === selectedOption);
                if (selectedOpt && selectedOpt.explanation) {
                  return (
                    <Card className="bg-red-900/30 border-2 border-red-500 p-6">
                      <div className="flex items-start gap-3 mb-2">
                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-red-300 font-bold mb-2">Tu respuesta:</p>
                          <p className="text-white text-xl mb-3">{selectedOpt.option_text}</p>
                        </div>
                      </div>
                      <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600">
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-400 text-lg flex-shrink-0">💡</span>
                          <p className="text-base text-gray-200 leading-relaxed">{selectedOpt.explanation}</p>
                        </div>
                      </div>
                    </Card>
                  );
                }
              })()}

              {/* La respuesta correcta */}
              {(() => {
                const correctOpt = question.options.find(o => o.option_id === result.correctOptionId);
                if (correctOpt) {
                  return (
                    <Card className="bg-green-900/30 border-2 border-green-500 p-6">
                      <div className="flex items-start gap-3 mb-2">
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 animate-pulse mt-1" />
                        <div className="flex-1">
                          <p className="text-green-300 font-bold mb-2">Respuesta correcta:</p>
                          <p className="text-white text-xl mb-3">{correctOpt.option_text}</p>
                        </div>
                      </div>
                      {correctOpt.explanation && (
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400 text-lg flex-shrink-0">💡</span>
                            <p className="text-base text-gray-200 leading-relaxed">{correctOpt.explanation}</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                }
              })()}
            </>
          )}

          {/* Si acertó, solo mostrar explicación de su respuesta */}
          {result.isCorrect && (() => {
            const correctOpt = question.options.find(o => o.option_id === result.correctOptionId);
            if (correctOpt && correctOpt.explanation) {
              return (
                <Card className="bg-green-900/30 border-2 border-green-500 p-6">
                  <div className="flex items-start gap-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 animate-pulse mt-1" />
                    <div className="flex-1">
                      <p className="text-green-300 font-bold text-xl mb-2">¡Excelente!</p>
                      <p className="text-white text-xl mb-3">{correctOpt.option_text}</p>
                    </div>
                  </div>
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 text-lg flex-shrink-0">💡</span>
                      <p className="text-base text-gray-200 leading-relaxed">{correctOpt.explanation}</p>
                    </div>
                  </div>
                </Card>
              );
            }
          })()}
        </motion.div>
      </motion.div>
    </div>
  );
}

