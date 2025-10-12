import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import QuestionScreen from '@/components/game/QuestionScreen';
import AnswerResultScreen from '@/components/game/AnswerResultScreen';
import LeaderboardScreen from '@/components/game/LeaderboardScreen';
import WaitingScreen from '@/components/game/WaitingScreen';
import FinalResultsScreen from '@/components/game/FinalResultsScreen';
import TeacherControlPanel from '@/components/game/TeacherControlPanel';

type GamePhase = 'waiting' | 'question' | 'result' | 'leaderboard' | 'finished';

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

interface LeaderboardPlayer {
  rank: number;
  user_id: number;
  nickname: string;
  username: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  combo_streak: number;
}

export default function GamePlayPage() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [finalResults, setFinalResults] = useState<any>(null);
  const [answersReceived] = useState(0);
  const [totalPlayers] = useState(0);
  const [countdown, setCountdown] = useState<number | string | null>(null);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !gameCode) return;

    console.log('[GamePlayPage] Uniéndose al room:', gameCode);

    // Unirse al room del juego
    console.log('[GamePlayPage] ⚡ Emitiendo game:join-room para:', gameCode);
    socket.emit('game:join-room', { gameCode }, (response: any) => {
      if (response.success) {
        console.log('[GamePlayPage] ✅ Unido al room exitosamente');
        console.log('[GamePlayPage] ✅ Game data:', response.game);
        console.log('[GamePlayPage] ✅ Players:', response.players);
      } else {
        console.error('[GamePlayPage] ❌ Error al unirse al room:', response.message);
        toast.error('Error al unirse al juego');
      }
    });

    // Escuchar countdown
    socket.on('game:countdown', (data: { count: number | string }) => {
      console.log('[GamePlayPage] Countdown recibido:', data.count);
      setCountdown(data.count);
      // El countdown se limpiará cuando llegue question:new
    });

    // Escuchar eventos del juego
    socket.on('question:new', (data: Question) => {
      console.log('[GamePlayPage] ✅ Nueva pregunta recibida:', data);
      console.log('[GamePlayPage] ✅ Pregunta:', data.question.question_text);
      console.log('[GamePlayPage] ✅ Cambiando a phase=question');
      setCurrentQuestion(data);
      setTimeRemaining(data.timeLimit);
      setSelectedOption(null);
      setAnswerResult(null);
      setCountdown(null); // Limpiar countdown
      setPhase('question');
    });

    socket.on('timer:tick', (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
    });

    socket.on('question:timeout', () => {
      if (!selectedOption) {
        toast.error('¡Se acabó el tiempo!');
      }
    });

    socket.on('question:results', (data: { leaderboard: LeaderboardPlayer[] }) => {
      setLeaderboard(data.leaderboard);
      setPhase('leaderboard');
    });

    socket.on('leaderboard:update', (data: { leaderboard: LeaderboardPlayer[] }) => {
      setLeaderboard(data.leaderboard);
    });

    socket.on('game:finished', (data: any) => {
      console.log('Juego finalizado:', data);
      setFinalResults(data);
      setLeaderboard(data.leaderboard);
      setPhase('finished');
    });

    socket.on('game:error', (data: { message: string }) => {
      toast.error(data.message);
    });

    return () => {
      socket.off('game:countdown');
      socket.off('question:new');
      socket.off('timer:tick');
      socket.off('question:timeout');
      socket.off('question:results');
      socket.off('leaderboard:update');
      socket.off('game:finished');
      socket.off('game:error');
    };
  }, [gameCode, selectedOption]);

  const handleAnswerSubmit = (optionId: number) => {
    if (selectedOption !== null) return;

    const socket = getSocket();
    if (!socket || !currentQuestion) return;

    setSelectedOption(optionId);
    
    const timeTaken = (currentQuestion.timeLimit - timeRemaining) * 1000;

    socket.emit(
      'answer:submit',
      {
        gameCode,
        questionId: currentQuestion.question.question_id,
        optionId,
        timeTaken,
      },
      (response: any) => {
        if (response.success) {
          setAnswerResult(response.result);
          setPhase('result');
        } else {
          toast.error(response.message);
          setSelectedOption(null);
        }
      }
    );
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (isTeacher) {
    return (
      <TeacherControlPanel
        gameCode={gameCode || ''}
        currentQuestion={currentQuestion}
        timeRemaining={timeRemaining}
        answersReceived={answersReceived}
        totalPlayers={totalPlayers}
        leaderboard={leaderboard}
        phase={phase}
        finalResults={finalResults}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WaitingScreen countdown={countdown} />
          </motion.div>
        )}

        {phase === 'question' && currentQuestion && (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <QuestionScreen
              question={currentQuestion}
              timeRemaining={timeRemaining}
              selectedOption={selectedOption}
              onSelectAnswer={handleAnswerSubmit}
            />
          </motion.div>
        )}

        {phase === 'result' && answerResult && currentQuestion && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnswerResultScreen
              result={answerResult}
              question={currentQuestion.question}
              selectedOption={selectedOption!}
            />
          </motion.div>
        )}

        {phase === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
          >
            <LeaderboardScreen
              leaderboard={leaderboard}
              currentUserId={user?.id || 0}
            />
          </motion.div>
        )}

        {phase === 'finished' && finalResults && (
          <motion.div
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FinalResultsScreen
              results={finalResults}
              currentUserId={user?.id || 0}
              onContinue={handleContinue}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

