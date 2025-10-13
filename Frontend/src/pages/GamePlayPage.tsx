import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { initializeSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import QuestionScreen from '@/components/game/QuestionScreen';
import AnswerResultScreen from '@/components/game/AnswerResultScreen';
import LeaderboardScreen from '@/components/game/LeaderboardScreen';
import WaitingScreen from '@/components/game/WaitingScreen';
import FinalResultsScreen from '@/components/game/FinalResultsScreen';
import TeacherControlPanel from '@/components/game/TeacherControlPanel';
import IntermediateRankingScreen from '@/components/game/IntermediateRankingScreen';
import { BoardGameScreen, BoardGameHUD, TurnIndicator, EventPopup, BoardFinalResultsScreen } from '@/components/game/board';
import { useBoardGame } from '@/hooks/useBoardGame';
import type { BoardEventTrigger, BoardGameFinishedPayload } from '@/types/board-game';
import { SurvivalGameScreen } from '@/components/game/survival';

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
  const queryClient = useQueryClient();
  const { user, hasHydrated, accessToken } = useAuthStore();

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
  const isInitializedRef = useRef<boolean>(false); // Para evitar setup múltiple (Strict Mode)
  const currentGameCodeRef = useRef<string | null>(null); // Para detectar cambio real de juego

  // Verificar si es profesor: usar role como fallback, pero preferir teacher_id del juego
  const isTeacherByRole = user?.role === 'teacher';
  const isTeacherById = game?.teacher_id && user?.id && Number(game.teacher_id) === Number(user.id);
  const isTeacher = isTeacherById || isTeacherByRole;
  const isBoardMode = game?.game_mode === 'board';
  const isSurvivalMode = game?.game_mode === 'survival';

  // Debug: Mostrar modo de juego
  useEffect(() => {
    if (game) {
      console.log('[GamePlayPage] 🎮 Modo de juego:', game.game_mode);
      console.log('[GamePlayPage] isBoardMode:', isBoardMode);
      console.log('[GamePlayPage] isSurvivalMode:', isSurvivalMode);
    }
  }, [game, isBoardMode, isSurvivalMode]);

  // Board mode state
  const [currentEvent, setCurrentEvent] = useState<BoardEventTrigger | null>(null);
  const [boardFinalResults, setBoardFinalResults] = useState<BoardGameFinishedPayload | null>(null);
  const boardGame = useBoardGame({ 
    gameCode: gameCode || '', 
    userId: user?.id || 0 
  });

  useEffect(() => {
    // ✅ CRÍTICO: Esperar a que se complete la hidratación antes de continuar
    if (!hasHydrated) {
      console.log('[GamePlayPage] ⏳ Esperando hidratación del authStore...');
      return;
    }

    // ✅ CRÍTICO: Detectar si es un remontaje real (recarga F5) vs Strict Mode
    if (currentGameCodeRef.current !== gameCode) {
      // Es un juego diferente o recarga real, resetear
      console.log('[GamePlayPage] 🔄 Nuevo montaje detectado (gameCode cambió o recarga)');
      isInitializedRef.current = false;
      currentGameCodeRef.current = gameCode || null;
    }
    
    // Evitar setup múltiple en Strict Mode
    if (isInitializedRef.current) {
      console.log('[GamePlayPage] ⚠️ Setup ya completado (Strict Mode), saltando...');
      return;
    }

    console.log('[GamePlayPage] ✅ AuthStore hidratado, verificando datos...');

    if (!gameCode || !accessToken) {
      console.warn('[GamePlayPage] ❌ Missing gameCode or accessToken');
      navigate('/dashboard');
      return;
    }

    if (!user) {
      console.error('[GamePlayPage] ❌ User es null después de hidratación, redirigiendo a login');
      navigate('/login');
      return;
    }

    console.log('[GamePlayPage] ✅ Todo OK, inicializando socket para User ID:', user.id);

    // Marcar como inicializado ANTES de cualquier operación asíncrona
    isInitializedRef.current = true;

    // ✅ CRÍTICO: Inicializar socket si no existe (necesario para reconexión al recargar)
    const socket = initializeSocket(accessToken);

    if (!socket || !gameCode) {
      console.error('[GamePlayPage] ❌ Socket initialization failed');
      isInitializedRef.current = false; // Reset si falla
      navigate('/dashboard');
      return;
    }

    // ✅ Esperar a que el socket esté conectado antes de hacer emit
    const waitForConnection = () => {
      return new Promise<void>((resolve) => {
        if (socket.connected) {
          resolve();
        } else {
          socket.once('connect', () => {
            console.log('[GamePlayPage] ✅ Socket conectado');
            resolve();
          });
        }
      });
    };

    // Setup del juego
    const setupGame = async () => {
      // Esperar a que el socket esté conectado
      await waitForConnection();

      console.log('[GamePlayPage] 📡 Uniéndose al room del juego:', gameCode);

      // Unirse al room del juego
      socket.emit('game:join-room', { gameCode }, (response: any) => {
        if (response.success) {
          console.log('[GamePlayPage] ✅ Unido al room del juego');
          console.log('[GamePlayPage] Game Status:', response.gameStatus);

          // Guardar game data
          setGame(response.game);

          // Si el juego está en lobby, redirigir al lobby
          if (response.gameStatus === 'lobby') {
            console.log('[GamePlayPage] ⏪ Juego en lobby, redirigiendo...');
            navigate(`/game/lobby/${gameCode}`);
            return;
          }

          // Si el juego ya terminó, mostrar resultados
          if (response.gameStatus === 'finished') {
            console.log('[GamePlayPage] 🏁 Juego terminado');
            setPhase('finished');
          }

          // Inicializar totales para teacher
          if (response.players) {
            setTotalPlayers(response.players.length);
          }

          // **CRÍTICO PARA RECONEXIÓN**: Recuperar estado completo desde Redis
          if (response.gameStatus === 'active' || response.gameStatus === 'starting') {
            console.log('[GamePlayPage] 🔄 Recuperando estado del juego desde Redis...');

            socket.emit('game:get-state', { gameCode }, (stateResponse: any) => {
              if (stateResponse.success && stateResponse.state) {
                const state = stateResponse.state;
                console.log('[GamePlayPage] ✅ Estado recuperado:', state);
                console.log('[GamePlayPage] 🔍 gameSession:', state.gameSession);
                console.log('[GamePlayPage] 🔍 currentQuestion en state:', state.currentQuestion);
                console.log('[GamePlayPage] 🔍 currentQuestion en gameSession:', state.gameSession?.currentQuestion);

                // Restaurar pregunta actual si existe (priorizar gameSession.currentQuestion)
                const questionToRestore = state.currentQuestion || state.gameSession?.currentQuestion;
                
                if (questionToRestore) {
                  console.log('[GamePlayPage] 📝 Restaurando pregunta:', questionToRestore.questionNumber);

                  // El backend retorna el formato correcto directamente desde prepareQuestion
                  const questionData = {
                    questionNumber: questionToRestore.questionNumber,
                    totalQuestions: questionToRestore.totalQuestions,
                    question: {
                      question_id: questionToRestore.questionId,
                      question_text: questionToRestore.questionText,
                      question_type: questionToRestore.questionType,
                      difficulty: 1,
                      options: questionToRestore.options || [],
                    },
                    timeLimit: questionToRestore.timeLimit,
                  };

                  setCurrentQuestion(questionData);
                  // Usar el timeRemaining guardado en Redis (actualizado cada segundo por el backend)
                  const restoredTime = questionToRestore.timeRemaining ?? questionToRestore.timeLimit;
                  setTimeRemaining(restoredTime);
                  setPhase('question');
                  console.log('[GamePlayPage] ⏱️ Tiempo restaurado:', restoredTime, 'segundos');
                } else {
                  console.log('[GamePlayPage] ⏳ Sin pregunta activa, esperando...');
                  setPhase('waiting');
                }

                // Restaurar leaderboard
                if (state.leaderboard && state.leaderboard.length > 0) {
                  console.log('[GamePlayPage] 🏆 Leaderboard restaurado:', state.leaderboard.length, 'jugadores');
                  setLeaderboard(state.leaderboard);
                }

                // Restaurar total de jugadores
                if (state.allPlayers) {
                  setTotalPlayers(state.allPlayers.length);
                }

                toast.success('Estado del juego recuperado', { icon: '♻️', duration: 2000 });
              } else {
                console.warn('[GamePlayPage] ⚠️ No se pudo recuperar el estado:', stateResponse);
                toast.error('No se pudo recuperar el estado del juego');
                setPhase('waiting');
              }
            });
          } else {
            // Si no está activo, simplemente esperar
            console.log('[GamePlayPage] ⏳ Juego no activo, esperando...');
            setPhase('waiting');
          }
        } else {
          console.error('[GamePlayPage] ❌ Error al unirse al room:', response.message);
          toast.error(response.message || 'Error al unirse al juego');
          navigate('/dashboard');
        }
      });
    };

    setupGame();

    // Escuchar countdown
    socket.on('game:countdown', (data: { count: number | string }) => {
      setCountdown(data.count);
      // El countdown se limpiará cuando llegue question:new
    });

    // **BOARD MODE**: Escuchar cuando el juego comienza (especialmente importante para Board Mode)
    socket.on('game:started', () => {
      console.log('[GamePlayPage] 🎮 Juego iniciado (game:started recibido)');
      // Si es modo Board, mantener en waiting hasta recibir board:initialized
      // Si es modo Classic, mantener en waiting hasta recibir question:new
      setPhase('waiting');
      setCountdown(null);
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
      console.log('[GamePlayPage] ⏱️ timer:tick recibido:', data.timeRemaining);
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

      // **PROFESOR**: Ir directo a intermediate-ranking (usar role directamente)
      if (user?.role === 'teacher') {
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

    // **NUEVO**: Escuchar cuando alguien se une (para actualizar contador)
    socket.on('game:player-joined', (data: { players: any[]; totalPlayers: number }) => {
      console.log('[GamePlayPage] 👋 Jugador se unió, total:', data.totalPlayers);
      setTotalPlayers(data.totalPlayers || data.players?.length || 0);
    });

    // **NUEVO**: Escuchar cuando alguien sale (para actualizar contador)
    socket.on('game:player-left', (data: { userId: number; username: string }) => {
      console.log('[GamePlayPage] 👋 Jugador salió:', data.username);
      // Decrementar total de jugadores
      setTotalPlayers(prev => Math.max(0, prev - 1));
    });

    // **NUEVO**: Escuchar cuando alguien se desconecta (para actualizar contador)
    socket.on('game:player-disconnected', (data: { userId: number; username: string }) => {
      console.log('[GamePlayPage] ⚠️ Jugador desconectado:', data.username);
      // NO decrementar contador inmediatamente - esperar a ver si reconecta
      // Los jugadores que recargan se desconectan y reconectan rápidamente
    });

    // **NUEVO**: Escuchar cuando alguien se reconecta (después de recargar página)
    socket.on('game:player-reconnected', (data: { userId: number; username: string; nickname: string }) => {
      console.log('[GamePlayPage] ♻️ Jugador reconectado:', data.nickname);
      toast.success(`${data.nickname} se reconectó`, { icon: '♻️', duration: 2000 });
      // No es necesario incrementar contador - nunca lo decrementamos
    });

    // **NUEVO**: Escuchar cuando alguien responde (para actualizar contador del profesor)
    socket.on('answer:received', () => {
      // Solo incrementar si es el profesor (para no duplicar contador en estudiantes)
      // Usar user.role en lugar de isTeacher para evitar dependencias
      if (user?.role === 'teacher') {
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

    // **BOARD MODE**: Escuchar finalización del juego de tablero
    socket.on('board:game_finished', (data: BoardGameFinishedPayload) => {
      console.log('[GamePlayPage] 🏁 Juego de tablero terminado:', data);
      setBoardFinalResults(data);
      toast.success(`¡${data.final_positions.find(p => p.userId === data.winner_id)?.nickname} ganó!`, {
        icon: '🏆',
        duration: 5000,
      });
    });

    return () => {
      console.log('[GamePlayPage] 🧹 Cleaning up socket listeners');
      // NO resetear isInitializedRef aquí para evitar re-setup en Strict Mode
      // Solo se resetea si el gameCode realmente cambia
      socket.off('game:countdown');
      socket.off('game:started');
      socket.off('question:new');
      socket.off('timer:tick');
      socket.off('question:timeout');
      socket.off('question:results');
      socket.off('leaderboard:update');
      socket.off('game:player-joined');
      socket.off('game:player-left');
      socket.off('game:player-disconnected');
      socket.off('game:player-reconnected');
      socket.off('answer:received');
      socket.off('game:finished');
      socket.off('board:game_finished');
      socket.off('game:error');

      // Limpiar timeout si existe
      if (questionResultsTimeoutRef.current) {
        clearTimeout(questionResultsTimeoutRef.current);
        questionResultsTimeoutRef.current = null;
      }
    };
    // ✅ CRÍTICO: Solo depender de valores que realmente cambian la conexión
    // NO incluir isTeacher porque cambia cuando game cambia y causa loop
  }, [gameCode, navigate, hasHydrated, accessToken, user]);

  // ✅ Effect separado para resetear cuando el gameCode cambia
  useEffect(() => {
    return () => {
      // Solo resetear cuando el gameCode realmente cambia (al navegar a otro juego)
      isInitializedRef.current = false;
    };
  }, [gameCode]);

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
    // ✅ Invalidar caché de React Query para forzar refresh de stats
    queryClient.invalidateQueries({ queryKey: ['userStats'] });
    queryClient.invalidateQueries({ queryKey: ['userProfileStats'] });
    queryClient.invalidateQueries({ queryKey: ['userRecentGames'] });
    queryClient.invalidateQueries({ queryKey: ['globalLeaderboard'] });
    queryClient.invalidateQueries({ queryKey: ['miniGlobalLeaderboard'] });
    
    navigate('/dashboard');
  };

  // Esperar a que se complete la hidratación del authStore
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  // **CRÍTICO**: Esperar a que game esté cargado antes de renderizar
  // Esto previene el flash de pantalla incorrecta
  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300 font-gaming">Conectando al juego...</p>
        </div>
      </div>
    );
  }

  // Vista del profesor
  if (isTeacher) {
    // **BOARD MODE**: Si es modo tablero, mostrar la misma vista que los jugadores
    if (isBoardMode && boardGame.boardState && user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
          {/* Turn Indicator Banner */}
          <TurnIndicator
            currentPlayer={boardGame.players.find(p => p.is_turn) || null}
            isMyTurn={false}
            players={boardGame.players}
          />

          {/* Main Board */}
          <BoardGameScreen
            boardState={boardGame.boardState}
            players={boardGame.players}
            currentUserId={user.id}
            onRollDice={boardGame.rollDice}
            isMyTurn={false}
          />

          {/* HUD Overlay */}
          <BoardGameHUD
            players={boardGame.players}
            currentUserId={user.id}
            turnTimeoutAt={boardGame.boardState.turn_timeout_at}
            isMyTurn={false}
            isRolling={boardGame.isRolling}
            onRollDice={boardGame.rollDice}
            diceHistory={boardGame.lastDiceRoll ? [boardGame.lastDiceRoll.diceValue] : []}
            currentPlayerName={boardGame.players.find(p => p.is_turn)?.nickname}
          />

          {/* Event Popup */}
          <EventPopup
            event={currentEvent}
            onDismiss={() => setCurrentEvent(null)}
          />

          {/* Teacher Badge */}
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg font-bold">
            👨‍🏫 Vista del Profesor
          </div>

          {/* Game Finished - Board Mode Results */}
          {boardFinalResults && (
            <BoardFinalResultsScreen
              results={boardFinalResults}
              currentUserId={user.id}
            />
          )}
        </div>
      );
    }

    // Si está en fase de resultados finales, mostrar la vista de pantalla completa
    if (phase === 'finished' && finalResults) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key="finished-teacher"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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

  // **SURVIVAL MODE**: Renderizar modo supervivencia
  if (isSurvivalMode && gameCode && user) {
    return <SurvivalGameScreen gameCode={gameCode} userId={user.id} />;
  }

  // **BOARD MODE**: Mostrar pantalla de carga mientras se inicializa el tablero
  if (isBoardMode && !boardGame.boardState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300 font-gaming text-xl mb-2">Inicializando tablero...</p>
          <p className="text-blue-400 text-sm">Preparando el juego 🎲</p>
        </div>
      </div>
    );
  }

  // **BOARD MODE**: Renderizar tablero cuando esté listo
  if (isBoardMode && boardGame.boardState && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        {/* Turn Indicator Banner */}
        <TurnIndicator
          currentPlayer={boardGame.players.find(p => p.is_turn) || null}
          isMyTurn={boardGame.isMyTurn}
          players={boardGame.players}
        />

        {/* Main Board */}
        <BoardGameScreen
          boardState={boardGame.boardState}
          players={boardGame.players}
          currentUserId={user.id}
          onRollDice={boardGame.rollDice}
          isMyTurn={boardGame.isMyTurn}
        />

        {/* HUD Overlay */}
        <BoardGameHUD
          players={boardGame.players}
          currentUserId={user.id}
          turnTimeoutAt={boardGame.boardState.turn_timeout_at}
          isMyTurn={boardGame.isMyTurn}
          isRolling={boardGame.isRolling}
          onRollDice={boardGame.rollDice}
          diceHistory={boardGame.lastDiceRoll ? [boardGame.lastDiceRoll.diceValue] : []}
          currentPlayerName={boardGame.players.find(p => p.is_turn)?.nickname}
        />

        {/* Event Popup */}
        <EventPopup
          event={currentEvent}
          onDismiss={() => setCurrentEvent(null)}
        />

        {/* Game Finished - Board Mode Results */}
        {boardFinalResults && (
          <BoardFinalResultsScreen
            results={boardFinalResults}
            currentUserId={user.id}
          />
        )}
      </div>
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

