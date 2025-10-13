import { useState, useEffect, useRef } from 'react';
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
import IntermediateRankingScreen from '@/components/game/IntermediateRankingScreen';

type GamePhase = 'waiting' | 'question' | 'result' | 'intermediate-ranking' | 'leaderboard' | 'finished';

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
      explanation?: string | null;
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
  const { user, hasHydrated } = useAuthStore();

  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [finalResults, setFinalResults] = useState<any>(null);
  const [answersReceived, setAnswersReceived] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [countdown, setCountdown] = useState<number | string | null>(null);
  const [game, setGame] = useState<any>(null);
  const [previousRank, setPreviousRank] = useState<number | undefined>(undefined);
  const questionResultsTimeoutRef = useRef<number | null>(null);
  const answerResultRef = useRef<AnswerResult | null>(null); // Ref para mantener el valor actual

  // Verificar si es profesor: usar role como fallback, pero preferir teacher_id del juego
  const isTeacherByRole = user?.role === 'teacher';
  const isTeacherById = game?.teacher_id && user?.id && Number(game.teacher_id) === Number(user.id);
  const isTeacher = isTeacherById || isTeacherByRole;

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !gameCode) return;

    // Unirse al room del juego
    socket.emit('game:join-room', { gameCode }, (response: any) => {
      if (response.success) {

        // Guardar game data
        setGame(response.game);

        // Si el juego está en lobby, redirigir al lobby
        if (response.gameStatus === 'lobby') {
          navigate(`/game/lobby/${gameCode}`);
          return;
        }

        // Si el juego ya terminó, mostrar resultados
        if (response.gameStatus === 'finished') {
          setPhase('finished');
        }

        // Inicializar totales para teacher
        if (response.players) {
          setTotalPlayers(response.players.length);
        }

        // **CRÍTICO PARA RECONEXIÓN**: Recuperar estado completo desde Redis
        if (response.gameStatus === 'active' || response.gameStatus === 'starting') {
          socket.emit('game:get-state', { gameCode }, (stateResponse: any) => {
            if (stateResponse.success && stateResponse.state) {
              const state = stateResponse.state;

              // Restaurar pregunta actual si existe
              if (state.currentQuestion) {

                // El backend retorna el formato correcto directamente desde prepareQuestion
                const questionData = {
                  questionNumber: state.currentQuestion.questionNumber,
                  totalQuestions: state.currentQuestion.totalQuestions,
                  question: {
                    question_id: state.currentQuestion.questionId,
                    question_text: state.currentQuestion.questionText,
                    question_type: state.currentQuestion.questionType,
                    difficulty: 1,
                    options: state.currentQuestion.options || [],
                  },
                  timeLimit: state.currentQuestion.timeLimit,
                };

                setCurrentQuestion(questionData);
                setTimeRemaining(state.currentQuestion.timeLimit);
                setPhase('question');
              } else {
                setPhase('waiting');
              }

              // Restaurar leaderboard
              if (state.leaderboard && state.leaderboard.length > 0) {
                setLeaderboard(state.leaderboard);
              }

              // Restaurar total de jugadores
              if (state.allPlayers) {
                setTotalPlayers(state.allPlayers.length);
              }

              toast.success('Estado del juego recuperado', { icon: '♻️', duration: 2000 });
            } else {
              console.warn('[GamePlayPage] ⚠️ No se pudo recuperar el estado:', stateResponse);
              setPhase('waiting');
            }
          });
        } else {
          // Si no está activo, simplemente esperar
          setPhase('waiting');
        }
      } else {
        console.error('[GamePlayPage] ❌ Error al unirse al room:', response.message);
        toast.error('Error al unirse al juego');
      }
    });

    // Escuchar countdown
    socket.on('game:countdown', (data: { count: number | string }) => {
      setCountdown(data.count);
      // El countdown se limpiará cuando llegue question:new
    });

    // Escuchar eventos del juego
    socket.on('question:new', (data: any) => {

      // **CRÍTICO**: Cancelar timeout de question:results si existe
      if (questionResultsTimeoutRef.current) {
        clearTimeout(questionResultsTimeoutRef.current);
        questionResultsTimeoutRef.current = null;
      }

      // Transformar formato del backend al frontend
      const questionData: Question = {
        questionNumber: data.questionNumber,
        totalQuestions: data.totalQuestions,
        question: {
          question_id: data.questionId,
          question_text: data.questionText,
          question_type: data.questionType,
          difficulty: 1,
          options: data.options || [],
        },
        timeLimit: data.timeLimit,
      };

      setCurrentQuestion(questionData);
      setTimeRemaining(data.timeLimit);
      setSelectedOption(null);
      setAnswerResult(null);
      answerResultRef.current = null; // Limpiar ref
      setCountdown(null); // Limpiar countdown
      setPhase('question');
      // Reset contador de respuestas para esta pregunta
      setAnswersReceived(0);
    });

    socket.on('timer:tick', (data: { timeRemaining: number }) => {
      setTimeRemaining(data.timeRemaining);
    });

    socket.on('question:timeout', () => {
      if (!selectedOption) {
        toast.error('¡Se acabó el tiempo!');
        // Si no contestó, ir directo a intermediate-ranking (el backend tiene 2s de congelación)
        setTimeout(() => {
          setPhase('intermediate-ranking');
        }, 1000); // 1 segundo después del toast
      }
    });

    socket.on('question:results', (data: { leaderboard: LeaderboardPlayer[] }) => {

      // Guardar posición anterior antes de actualizar
      const currentPlayerInLeaderboard = leaderboard.find(p => p.user_id === user?.id);
      if (currentPlayerInLeaderboard) {
        setPreviousRank(currentPlayerInLeaderboard.rank);
      }

      setLeaderboard(data.leaderboard);

      // **PROFESOR**: Ir directo a intermediate-ranking
      if (isTeacher) {
        setPhase('intermediate-ranking');

        // Después de 8s, volver a waiting (sincronizado con backend)
        questionResultsTimeoutRef.current = setTimeout(() => {
          setPhase('waiting');
          setAnswersReceived(0); // Reset contador
          questionResultsTimeoutRef.current = null;
        }, 8000);
        return;
      }

      // **ESTUDIANTES**: FLUJO DE DOS PANTALLAS
      // 1. Si contestó: mostrar resultado individual (3s)
      // 2. Luego mostrar intermediate-ranking (5s)
      // 3. Finalmente volver a waiting

      // Solo hacer transición si ya mostró su resultado individual
      if (answerResultRef.current) {
        questionResultsTimeoutRef.current = setTimeout(() => {
          setPhase('intermediate-ranking');

          // Después de 5s más, volver a waiting
          questionResultsTimeoutRef.current = setTimeout(() => {
            setPhase('waiting');
            setAnswerResult(null);
            answerResultRef.current = null; // Limpiar ref
            setSelectedOption(null);
            questionResultsTimeoutRef.current = null;
          }, 5000); // 5 segundos para ver ranking completo y estadísticas

        }, 3000); // 3 segundos para leer la explicación
      } else {
        // Si no contestó (ya está en intermediate-ranking desde timeout), solo volver a waiting después
        questionResultsTimeoutRef.current = setTimeout(() => {
          setPhase('waiting');
          setAnswerResult(null);
          answerResultRef.current = null; // Limpiar ref
          setSelectedOption(null);
          questionResultsTimeoutRef.current = null;
        }, 5000); // 5 segundos en intermediate-ranking
      }
    });

    socket.on('leaderboard:update', (data: { leaderboard: LeaderboardPlayer[] }) => {
      setLeaderboard(data.leaderboard);
      // Actualizar total de jugadores basado en leaderboard
      setTotalPlayers(data.leaderboard.length);
    });

    // **NUEVO**: Escuchar cuando alguien responde (para actualizar contador del profesor)
    socket.on('answer:received', () => {
      // Solo incrementar si es el profesor (para no duplicar contador en estudiantes)
      if (isTeacher) {
        setAnswersReceived(prev => prev + 1);
      }
    });

    socket.on('game:finished', (data: any) => {
      
      // **IMPORTANTE**: Cancelar cualquier timeout pendiente
      if (questionResultsTimeoutRef.current) {
        clearTimeout(questionResultsTimeoutRef.current);
        questionResultsTimeoutRef.current = null;
      }
      
      setFinalResults(data);
      setLeaderboard(data.leaderboard);
      setPhase('finished');
      setAnswerResult(null);
      answerResultRef.current = null; // Limpiar ref
      setSelectedOption(null);
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
      socket.off('answer:received');
      socket.off('game:finished');
      socket.off('game:error');

      // Limpiar timeout si existe
      if (questionResultsTimeoutRef.current) {
        clearTimeout(questionResultsTimeoutRef.current);
        questionResultsTimeoutRef.current = null;
      }
    };
  }, [gameCode, navigate, isTeacher]);

  const handleAnswerSubmit = (optionId: number) => {
    if (selectedOption !== null) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      console.error('[GamePlayPage] ❌ Socket no disponible');
      toast.error('Error de conexión');
      return;
    }
    
    if (!currentQuestion) {
      console.error('[GamePlayPage] ❌ No hay pregunta actual');
      return;
    }

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
        
        if (!response) {
          console.error('[GamePlayPage] ❌ Respuesta vacía del servidor');
          toast.error('Error: sin respuesta del servidor');
          setSelectedOption(null);
          return;
        }

        if (response.success) {
          
          if (!response.result) {
            console.error('[GamePlayPage] ❌ Resultado vacío en respuesta exitosa');
            toast.error('Error: resultado vacío');
            setSelectedOption(null);
            return;
          }

          setAnswerResult(response.result);
          answerResultRef.current = response.result; // ✅ Actualizar ref también
          
          setPhase('result');
          
          // Incrementar contador de respuestas (para teachers)
          setAnswersReceived(prev => prev + 1);
        } else {
          console.error('[GamePlayPage] ❌ Error en respuesta:', response.message);
          toast.error(response.message || 'Error al procesar respuesta');
          setSelectedOption(null);
        }
      }
    );
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  // Esperar a que se complete la hidratación del authStore
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300 font-gaming">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (isTeacher) {
    // **NUEVO**: Si está en intermediate-ranking, mostrar pantalla de ranking completo
    if (phase === 'intermediate-ranking') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key="teacher-intermediate-ranking"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <IntermediateRankingScreen
                leaderboard={leaderboard}
                currentUserId={user?.id || 0}
                previousRank={undefined}
                lastResult={null}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }

    // Panel de control normal
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

        {phase === 'intermediate-ranking' && (
          <motion.div
            key="intermediate-ranking"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <IntermediateRankingScreen
              leaderboard={leaderboard}
              currentUserId={user?.id || 0}
              previousRank={previousRank}
              lastResult={answerResultRef.current || answerResult}
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

