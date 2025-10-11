import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useGameStore } from '@/store/gameStore';

// Configuración base de axios
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api/v1',
  withCredentials: true,
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      useGameStore.getState().setUser(null);
    }
    return Promise.reject(error);
  }
);

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email?: string;
  password: string;
  role?: 'student' | 'teacher';
  displayName?: string;
}

interface GameAnswer {
  gameId: string;
  questionId: string;
  selectedOptionId: string;
}

export const useAuth = () => {
  const setUser = useGameStore((state) => state.setUser);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.data.user);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  });

  const getProfileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('accessToken'),
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error || registerMutation.error || logoutMutation.error,
    profile: getProfileQuery.data,
  };
};

export const useGame = () => {
  // const queryClient = useQueryClient();
  const updateGameState = useGameStore((state) => state.updateGameState);

  const joinGameMutation = useMutation({
    mutationFn: async ({ gameId, playerName }: { gameId: string; playerName: string }) => {
      const response = await api.post(`/games/${gameId}/join`, { nickname: playerName });
      return response.data;
    },
    onSuccess: (data) => {
      updateGameState(data.game);
    },
  });

  const answerQuestionMutation = useMutation({
    mutationFn: async (answer: GameAnswer) => {
      const response = await api.post(`/games/${answer.gameId}/answer`, {
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Actualizar el estado del juego con la respuesta
      updateGameState(data.game);
    },
  });

  const startGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const response = await api.post(`/games/${gameId}/start`);
      return response.data;
    },
    onSuccess: (data) => {
      updateGameState(data.game);
    },
  });

  return {
    joinGame: joinGameMutation.mutate,
    answerQuestion: answerQuestionMutation.mutate,
    startGame: startGameMutation.mutate,
    isLoading: joinGameMutation.isPending || answerQuestionMutation.isPending || startGameMutation.isPending,
    error: joinGameMutation.error || answerQuestionMutation.error || startGameMutation.error,
  };
};

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await api.get('/health');
      return response.data;
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
};
