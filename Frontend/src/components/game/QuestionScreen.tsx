import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Question {
  questionNumber: number;
  totalQuestions: number;
  question: {
    question_id: number;
    question_text: string;
    question_type: string;
    difficulty: number;
    options: Array<{
      option_id: number;
      option_text: string;
      option_order: number;
    }>;
  };
  timeLimit: number;
}

interface QuestionScreenProps {
  question: Question;
  timeRemaining: number;
  selectedOption: number | null;
  onSelectAnswer: (optionId: number) => void;
}

const OPTION_COLORS = [
  { bg: 'bg-red-600', hover: 'hover:bg-red-500', border: 'border-red-500' },
  { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', border: 'border-blue-500' },
  { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-500', border: 'border-yellow-500' },
  { bg: 'bg-green-600', hover: 'hover:bg-green-500', border: 'border-green-500' },
];

export default function QuestionScreen({
  question,
  timeRemaining,
  selectedOption,
  onSelectAnswer,
}: QuestionScreenProps) {
  const progress = (timeRemaining / question.timeLimit) * 100;
  const isUrgent = timeRemaining <= 5;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-white font-gaming">
          <span className="text-2xl">Pregunta {question.questionNumber}</span>
          <span className="text-gray-400 text-lg"> / {question.totalQuestions}</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <Clock className={`w-8 h-8 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
          <div className="text-right">
            <div className={`text-3xl font-gaming ${isUrgent ? 'text-red-400' : 'text-white'}`}>
              {timeRemaining}s
            </div>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-cyan-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full"
      >
        <Card className="bg-slate-800 border-2 border-purple-500 p-8 mb-8 w-full">
          <h2 className="text-2xl md:text-4xl font-bold text-white text-center leading-relaxed">
            {question.question.question_text}
          </h2>
        </Card>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {question.question.options.map((option, index) => {
            const color = OPTION_COLORS[index % OPTION_COLORS.length];
            const isSelected = selectedOption === option.option_id;

            return (
              <motion.div
                key={option.option_id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!selectedOption ? { scale: 1.05 } : {}}
                whileTap={!selectedOption ? { scale: 0.95 } : {}}
              >
                <Button
                  onClick={() => onSelectAnswer(option.option_id)}
                  disabled={selectedOption !== null}
                  className={`
                    w-full h-auto min-h-[100px] p-6 text-xl md:text-2xl font-bold
                    ${color.bg} ${color.hover} border-4 ${color.border}
                    ${isSelected ? 'ring-4 ring-white' : ''}
                    disabled:opacity-70 transition-all
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-left">{option.option_text}</span>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-green-600 px-6 py-3 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="text-white font-gaming text-lg">Respuesta enviada</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

