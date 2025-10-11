import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    type: 'multiple_choice' | 'true_false';
    difficulty: number;
    timeLimit: number;
    points: number;
    options?: QuestionOption[];
    mediaUrl?: string;
    mediaType?: string;
  };
  timeLeft?: number;
  isAnswered?: boolean;
  selectedAnswer?: string;
  showResult?: boolean;
  onAnswerSelect?: (optionId: string) => void;
  onTimeUp?: () => void;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  timeLeft = question.timeLimit,
  isAnswered = false,
  selectedAnswer,
  showResult = false,
  onAnswerSelect,
  onTimeUp,
  className = '',
}) => {
  const [localTimeLeft, setLocalTimeLeft] = React.useState(timeLeft);

  // Timer effect
  React.useEffect(() => {
    if (isAnswered || showResult) return;

    const timer = setInterval(() => {
      setLocalTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, showResult, onTimeUp]);

  // Reset timer when question changes
  React.useEffect(() => {
    setLocalTimeLeft(timeLeft);
  }, [question.id, timeLeft]);

  const getTimeColor = () => {
    if (localTimeLeft <= 5) return 'text-destructive animate-pulse';
    if (localTimeLeft <= 10) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 5: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAnswerColor = (optionId: string) => {
    if (!showResult) {
      return selectedAnswer === optionId
        ? 'ring-2 ring-primary bg-accent/50'
        : 'hover:bg-accent/30';
    }

    const option = question.options?.find(opt => opt.id === optionId);
    if (option?.isCorrect) {
      return 'bg-correct text-correct-foreground border-correct animate-pulse-correct';
    }

    if (selectedAnswer === optionId && !option?.isCorrect) {
      return 'bg-wrong text-wrong-foreground border-wrong animate-pulse-wrong';
    }

    return 'opacity-60';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full max-w-4xl mx-auto ${className}`}
    >
      <Card className="border-2 border-border shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge className={getDifficultyColor()}>
              Dificultad: {question.difficulty}/5
            </Badge>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 ${getTimeColor()}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">
                  {localTimeLeft}s
                </span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="font-bold">{question.points}</span>
              </div>
            </div>
          </div>

          {question.mediaUrl && (
            <div className="mb-4">
              {question.mediaType?.startsWith('image/') ? (
                <img
                  src={question.mediaUrl}
                  alt="Question media"
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
              ) : question.mediaType?.startsWith('video/') ? (
                <video
                  src={question.mediaUrl}
                  controls
                  className="w-full max-h-64 rounded-lg border"
                />
              ) : null}
            </div>
          )}

          <div className="text-lg font-medium leading-relaxed">
            {question.text}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {question.options && (
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className={`w-full justify-start text-left p-4 h-auto min-h-[3rem] ${getAnswerColor(
                      option.id
                    )} transition-all duration-200`}
                    onClick={() => !isAnswered && onAnswerSelect?.(option.id)}
                    disabled={isAnswered}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 leading-relaxed">
                        {option.text}
                      </span>
                    </span>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
