import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email?: string;
  role: 'student' | 'teacher' | 'admin';
  displayName?: string;
  avatar?: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
}

interface GamePlayer {
  id: string;
  nickname: string;
  score: number;
  position: number;
  isCurrentPlayer?: boolean;
  avatar?: string;
}

interface GameState {
  id: string;
  status: 'waiting' | 'starting' | 'active' | 'finished';
  currentQuestionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  players: GamePlayer[];
  currentQuestion?: {
    id: string;
    text: string;
    type: 'multiple_choice' | 'true_false';
    options?: { id: string; text: string; isCorrect?: boolean }[];
    difficulty: number;
    timeLimit: number;
    points: number;
  };
}

interface GameStore {
  // Estado del usuario
  user: User | null;
  setUser: (user: User | null) => void;

  // Estado del juego
  currentGame: GameState | null;
  setCurrentGame: (game: GameState | null) => void;
  updateGameState: (updates: Partial<GameState>) => void;

  // Estado de la aplicación
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Acciones del juego
  joinGame: (gameId: string, playerName: string) => Promise<void>;
  leaveGame: () => void;
  answerQuestion: (answerId: string) => Promise<void>;
  startGame: () => Promise<void>;

  // Estado de audio
  audioSettings: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    muted: boolean;
  };
  updateAudioSettings: (settings: Partial<GameStore['audioSettings']>) => void;
}

// Estado inicial
const initialAudioSettings = {
  masterVolume: 0.5,
  sfxVolume: 0.6,
  musicVolume: 0.4,
  muted: false,
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, _get) => ({
        // Estado inicial
        user: null,
        currentGame: null,
        isLoading: false,
        error: null,
        audioSettings: initialAudioSettings,

        // Acciones del usuario
        setUser: (user) => set({ user }),

        // Acciones del juego
        setCurrentGame: (game) => set({ currentGame: game }),

        updateGameState: (updates) => set((state) => ({
          currentGame: state.currentGame ? { ...state.currentGame, ...updates } : null,
        })),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        // Configuración de audio
        updateAudioSettings: (settings) => set((state) => ({
          audioSettings: { ...state.audioSettings, ...settings },
        })),

        // Acciones del juego (implementación básica)
        joinGame: async (gameId, playerName) => {
          set({ isLoading: true, error: null });
          try {
            // Aquí iría la lógica para unirse al juego
            console.log(`Joining game ${gameId} as ${playerName}`);
            set({ isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error joining game',
              isLoading: false,
            });
          }
        },

        leaveGame: () => {
          set({ currentGame: null });
        },

        answerQuestion: async (answerId) => {
          set({ isLoading: true });
          try {
            // Aquí iría la lógica para responder pregunta
            console.log(`Answering question with option ${answerId}`);
            set({ isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error answering question',
              isLoading: false,
            });
          }
        },

        startGame: async () => {
          set({ isLoading: true });
          try {
            // Aquí iría la lógica para iniciar el juego
            console.log('Starting game...');
            set({ isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Error starting game',
              isLoading: false,
            });
          }
        },
      }),
      {
        name: 'quiz-game-store',
        partialize: (state) => ({
          user: state.user,
          audioSettings: state.audioSettings,
        }),
      }
    ),
    {
      name: 'GameStore',
    }
  )
);
