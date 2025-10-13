import { useState, useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import type {
  BoardGameState,
  BoardPlayerState,
  BoardInitializedPayload,
  BoardPlayerMovedPayload,
  BoardEventTriggeredPayload,
  BoardTurnChangePayload,
  BoardGameFinishedPayload,
  DiceRollResult,
} from '@/types/board-game';
import toast from 'react-hot-toast';

interface UseBoardGameProps {
  gameCode: string;
  userId: number;
}

/**
 * useBoardGame Hook
 * Maneja el estado y eventos del modo tablero
 */
export function useBoardGame({ gameCode, userId }: UseBoardGameProps) {
  const socket = getSocket();
  
  const [boardState, setBoardState] = useState<BoardGameState | null>(null);
  const [players, setPlayers] = useState<BoardPlayerState[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Tirar dado
  const rollDice = useCallback(() => {
    if (!socket || !isMyTurn || isRolling) return;

    setIsRolling(true);
    
    socket.emit('board:roll-dice', { gameCode }, (response: any) => {
      if (response.success) {
        toast.success(`¡Sacaste un ${response.result.diceValue}!`);
      } else {
        toast.error(response.message || 'Error al tirar el dado');
        setIsRolling(false);
      }
    });
  }, [socket, gameCode, isMyTurn, isRolling]);

  // Obtener estado del tablero
  const fetchBoardState = useCallback(() => {
    if (!socket) return;

    socket.emit('board:get-state', { gameCode }, (response: any) => {
      if (response.success) {
        setBoardState(response.board_state);
        setPlayers(response.players);
      }
    });
  }, [socket, gameCode]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // **IMPORTANTE**: Al montar, intentar recuperar el estado del tablero si ya existe
    fetchBoardState();

    // Tablero inicializado
    socket.on('board:initialized', (data: BoardInitializedPayload) => {
      console.log('[BoardGame] Board initialized:', data);
      setBoardState(data.board_state);
      setPlayers(data.players);
      setIsMyTurn(data.current_player_id === userId);
    });

    // Jugador se movió
    socket.on('board:player-moved', (data: BoardPlayerMovedPayload) => {
      console.log('[BoardGame] Player moved:', data);
      
      setLastDiceRoll({
        userId: data.user_id,
        diceValue: data.dice_value,
        oldPosition: data.old_position,
        newPosition: data.new_position,
        event: data.event,
        timestamp: Date.now(),
      });

      // Actualizar posición del jugador
      setPlayers(prev => 
        prev.map(p => 
          p.userId === data.user_id 
            ? { ...p, board_position: data.new_position }
            : p
        )
      );

      setIsRolling(false);
    });

    // Evento activado
    socket.on('board:event-triggered', (data: BoardEventTriggeredPayload) => {
      console.log('[BoardGame] Event triggered:', data);
      
      const { event } = data;
      
      // Mostrar notificación
      if (event.effects.coin_change && event.effects.coin_change > 0) {
        toast.success(event.message, { icon: '💰' });
      } else if (event.effects.coin_change && event.effects.coin_change < 0) {
        toast.error(event.message, { icon: '⚠️' });
      } else if (event.effects.xp_change) {
        toast.success(event.message, { icon: '📚' });
      } else if (event.effects.gem_change) {
        toast.success(event.message, { icon: '💎' });
      } else if (event.effects.position_change) {
        toast(event.message, { icon: '🌀' });
      } else {
        toast(event.message);
      }

      // Actualizar coins del jugador
      if (event.effects.coin_change) {
        setPlayers(prev =>
          prev.map(p =>
            p.userId === data.user_id
              ? { ...p, coins_collected: p.coins_collected + event.effects.coin_change! }
              : p
          )
        );
      }

      // Actualizar shields
      if (event.effects.shield_granted) {
        setPlayers(prev =>
          prev.map(p =>
            p.userId === data.user_id
              ? { ...p, shields: p.shields + 1 }
              : p
          )
        );
      }

      // Actualizar powerups
      if (event.effects.powerup_granted) {
        setPlayers(prev =>
          prev.map(p =>
            p.userId === data.user_id
              ? { ...p, powerups: [...p.powerups, event.effects.powerup_granted!] }
              : p
          )
        );
      }
    });

    // Cambio de turno
    socket.on('board:turn-change', (data: BoardTurnChangePayload) => {
      console.log('[BoardGame] Turn changed:', data);
      
      // Actualizar quién tiene el turno
      setPlayers(prev => {
        const updated = prev.map(p => ({
          ...p,
          is_turn: p.userId === data.current_player_id,
        }));
        
        // Notificar fuera del render
        const currentPlayer = updated.find(p => p.userId === data.current_player_id);
        if (data.current_player_id === userId) {
          setTimeout(() => toast.success('¡Es tu turno!', { icon: '🎯', duration: 3000 }), 0);
        } else if (currentPlayer) {
          setTimeout(() => toast(`Turno de ${currentPlayer.nickname}`, { icon: '⏳' }), 0);
        }
        
        return updated;
      });

      setIsMyTurn(data.current_player_id === userId);

      // Actualizar board state
      setBoardState(prev => prev ? {
        ...prev,
        current_turn: data.turn_number,
        turn_timeout_at: data.timeout_at,
      } : null);
    });


    // Juego finalizado
    socket.on('board:game-finished', (data: BoardGameFinishedPayload) => {
      console.log('[BoardGame] Game finished:', data);
      setGameFinished(true);

      // Notificaciones fuera del render
      if (data.winner_id === userId) {
        setTimeout(() => toast.success('🎉 ¡GANASTE! 🏆', { duration: 5000 }), 0);
      } else {
        setPlayers(prev => {
          const winner = prev.find(p => p.userId === data.winner_id);
          setTimeout(() => toast(`🏁 Ganó ${winner?.nickname || 'otro jugador'}`, { duration: 5000 }), 0);
          return prev;
        });
      }
    });

    return () => {
      socket.off('board:initialized');
      socket.off('board:player-moved');
      socket.off('board:event-triggered');
      socket.off('board:turn-change');
      socket.off('board:game-finished');
    };
  }, [socket, userId, fetchBoardState]);

  return {
    boardState,
    players,
    isMyTurn,
    lastDiceRoll,
    isRolling,
    gameFinished,
    rollDice,
    fetchBoardState,
  };
}
