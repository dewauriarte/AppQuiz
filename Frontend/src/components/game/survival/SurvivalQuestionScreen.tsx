import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, CheckCircle, XCircle } from 'lucide-react';
import type { SurvivalQuestion } from '@/types/survival.types';

interface SurvivalQuestionScreenProps {
  question: SurvivalQuestion;
  onAnswer: (optionId: number, timeSpent: number) => void;
  disabled?: boolean;
}

/**
 * SurvivalQuestionScreen - Pantalla de pregunta para modo supervivencia
 */
export function SurvivalQuestionScreen({
  question,
  onAnswer,
  disabled = false,
}: SurvivalQuestionScreenProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  const [answered, setAnswered] = useState(false);
  const startTime = Date.now();

  // Timer countdown
  useEffect(() => {
    if (answered || disabled) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit sin respuesta
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answered, disabled]);

  const handleAnswer = (optionId: number | null) => {
    if (answered || disabled) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    setAnswered(true);
    
    if (optionId !== null) {
      setSelectedOption(optionId);
      onAnswer(optionId, timeSpent);
    }
  };

  const timePercentage = (timeLeft / question.timeLimit) * 100;
  const isLowTime = timeLeft <= 5;
  const isFinalRound = question.isFinalRound;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Timer */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-medium">Tiempo restante</span>
              </div>
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className={`text-3xl font-black ${
                  isLowTime ? 'text-red-400 animate-pulse' : 'text-white'
                }`}
              >
                {timeLeft}s
              </motion.div>
            </div>
            
            {/* Progress bar */}
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${timePercentage}%` }}
                className={`h-full ${
                  isLowTime
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : 'bg-gradient-to-r from-green-400 to-blue-500'
                }`}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className={`
            ${isFinalRound 
              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50' 
              : 'bg-white/10 border-white/20'
            }
            backdrop-blur-lg rounded-2xl p-8 border-2
          `}>
            {isFinalRound && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <span className="text-yellow-400 font-bold">RONDA FINAL</span>
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
            )}
            
            <h2 className="text-white text-2xl md:text-3xl font-bold text-center leading-relaxed">
              {question.questionText}
            </h2>
          </div>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === option.optionId;
            const isDisabled = answered || disabled;

            return (
              <motion.button
                key={option.optionId}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={!isDisabled ? { scale: 1.02, y: -5 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(option.optionId)}
                disabled={isDisabled}
                className={`
                  relative group overflow-hidden
                  rounded-xl p-6 text-left
                  border-2 transition-all duration-300
                  ${
                    isSelected
                      ? 'bg-blue-500 border-blue-400 shadow-xl shadow-blue-500/50'
                      : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Content */}
                <div className="relative flex items-center gap-4">
                  {/* Option letter */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center font-black text-xl
                    ${isSelected ? 'bg-white/20' : 'bg-white/10'}
                  `}>
                    <span className="text-white">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  
                  {/* Option text */}
                  <p className="flex-1 text-white font-medium text-lg">
                    {option.optionText}
                  </p>

                  {/* Selected indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Shine effect on hover */}
                {!isDisabled && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Answered feedback */}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">Respuesta enviada</span>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  Esperando a otros jugadores...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-timeout warning */}
        {timeLeft <= 3 && !answered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-pulse">
              ⚠️ ¡Responde ahora!
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
