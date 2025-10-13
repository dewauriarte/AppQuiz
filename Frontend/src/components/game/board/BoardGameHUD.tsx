import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Trophy, Coins as CoinsIcon, Gem } from 'lucide-react';
import { DiceRoller, DiceHistory } from './DiceRoller';
import type { BoardPlayerState } from '@/types/board-game';
import { useEffect, useState } from 'react';

interface BoardGameHUDProps {
  players: BoardPlayerState[];
  currentUserId: number;
  turnTimeoutAt?: number;
  isMyTurn: boolean;
  isRolling: boolean;
  onRollDice: () => void;
  diceHistory?: number[];
  currentPlayerName?: string;
}

/**
 * BoardGameHUD - HUD completo del juego de tablero
 */
export function BoardGameHUD({
  players,
  currentUserId,
  turnTimeoutAt,
  isMyTurn,
  isRolling,
  onRollDice,
  diceHistory = [],
  currentPlayerName,
}: BoardGameHUDProps) {
  const currentPlayer = players.find(p => p.userId === currentUserId);
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.board_position !== a.board_position) {
      return b.board_position - a.board_position;
    }
    return b.coins_collected - a.coins_collected;
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Panel Izquierdo */}
      <div className="absolute top-4 left-4 space-y-4 pointer-events-auto">
        <TurnIndicatorPanel
          turnTimeoutAt={turnTimeoutAt}
          isMyTurn={isMyTurn}
          currentPlayerName={currentPlayerName}
        />
        
        {diceHistory.length > 0 && (
          <DiceHistory history={diceHistory} maxItems={5} />
        )}
      </div>

      {/* Panel Derecho */}
      <div className="absolute top-4 right-4 space-y-4 pointer-events-auto">
        <LeaderboardPanel
          players={sortedPlayers}
          currentUserId={currentUserId}
        />
        
        {currentPlayer && (
          <PlayerStatsPanel player={currentPlayer} />
        )}
      </div>

      {/* Centro - Botón de Dado */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
        <DiceRoller
          onRoll={onRollDice}
          isMyTurn={isMyTurn}
          isRolling={isRolling}
          lastDiceValue={diceHistory[diceHistory.length - 1]}
          autoRollTimeoutAt={turnTimeoutAt}
        />
      </div>

      {/* Message Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <MessageCenter
          isMyTurn={isMyTurn}
          currentPlayerName={currentPlayerName}
          isRolling={isRolling}
        />
      </div>
    </div>
  );
}

/**
 * TurnIndicatorPanel - Panel de turno actual con timer
 */
interface TurnIndicatorPanelProps {
  turnTimeoutAt?: number;
  isMyTurn: boolean;
  currentPlayerName?: string;
}

function TurnIndicatorPanel({
  turnTimeoutAt,
  isMyTurn,
  currentPlayerName,
}: TurnIndicatorPanelProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!turnTimeoutAt) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, turnTimeoutAt - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [turnTimeoutAt]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#2D2C3E]/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 min-w-[250px] border-2 border-[#3B3A5A]"
      style={{
        boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`
          w-3 h-3 rounded-full animate-pulse
          ${isMyTurn ? 'bg-[#FFD966]' : 'bg-[#38BDF8]'}
        `} />
        <h3 className="font-bold text-[#F8F9FA] text-sm" style={{ fontFamily: "'Press Start 2P', monospace" }}>Turno</h3>
      </div>

      {/* Current Player */}
      <div className={`
        p-3 rounded-xl mb-3 border-2
        ${isMyTurn ? 'bg-[#FFD966]/20 border-[#FFD966]' : 'bg-[#3B3A5A] border-[#5B21B6]'}
      `}>
        <div className="text-xs text-[#F8F9FA]/70 mb-1">
          {isMyTurn ? '¡Es tu turno!' : 'Jugando:'}
        </div>
        <div className="font-bold text-base text-[#F8F9FA]">
          {isMyTurn ? 'TÚ' : currentPlayerName || 'Esperando...'}
        </div>
      </div>

      {/* Timer */}
      {turnTimeoutAt && timeLeft > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 bg-[#1B1A2A] rounded-lg p-2"
        >
          <Clock className={`
            w-5 h-5
            ${timeLeft <= 3 ? 'text-[#C43E3E] animate-bounce' : 'text-[#38BDF8]'}
          `} />
          <div className={`
            flex-1 text-center font-bold text-2xl
            ${timeLeft <= 3 ? 'text-[#C43E3E] animate-pulse' : 'text-[#F8F9FA]'}
          `}>
            {timeLeft}s
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * LeaderboardPanel - Mini leaderboard
 */
interface LeaderboardPanelProps {
  players: BoardPlayerState[];
  currentUserId: number;
}

function LeaderboardPanel({ players, currentUserId }: LeaderboardPanelProps) {
  const topPlayers = players.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#2D2C3E]/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 min-w-[280px] border-2 border-[#3B3A5A]"
      style={{
        boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1)'
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-[#FFD966]" />
        <h3 className="font-bold text-[#F8F9FA] text-sm" style={{ fontFamily: "'Press Start 2P', monospace" }}>Ranking</h3>
      </div>

      <div className="space-y-2">
        {topPlayers.map((player, index) => (
          <motion.div
            key={player.userId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center gap-3 p-2 rounded-xl transition-colors border-2
              ${player.userId === currentUserId 
                ? 'bg-[#5B21B6]/30 border-[#FFD966]' 
                : 'bg-[#1B1A2A] border-[#3B3A5A] hover:border-[#5B21B6]'
              }
            `}
          >
            {/* Rank */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2
              ${index === 0 ? 'bg-[#FFD966] text-[#1B1A2A] border-[#FACC15]' :
                index === 1 ? 'bg-[#C0C0C0] text-[#1B1A2A] border-[#A0A0A0]' :
                index === 2 ? 'bg-[#CD7F32] text-[#1B1A2A] border-[#B8860B]' :
                'bg-[#3B3A5A] text-[#F8F9FA] border-[#2D2C3E]'
              }
            `}>
              {index + 1}
            </div>

            {/* Avatar */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-[#F8F9FA] text-sm font-bold
              bg-gradient-to-br from-[#5B21B6] to-[#38BDF8]
              ${player.is_turn ? 'ring-2 ring-[#FFD966]' : ''}
            `}>
              {player.nickname.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate text-[#F8F9FA]">
                {player.nickname}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#F8F9FA]/70">
                <span>📍{player.board_position}</span>
                <span className="text-[#FFD966]">💰{player.coins_collected}</span>
              </div>
            </div>

            {/* Turn indicator */}
            {player.is_turn && (
              <div className="w-2 h-2 bg-[#FFD966] rounded-full animate-pulse" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * PlayerStatsPanel - Estadísticas del jugador actual
 */
interface PlayerStatsPanelProps {
  player: BoardPlayerState;
}

function PlayerStatsPanel({ player }: PlayerStatsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[#2D2C3E]/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 min-w-[280px] border-2 border-[#3B3A5A]"
      style={{
        boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.1)'
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-[#38BDF8]" />
        <h3 className="font-bold text-[#F8F9FA] text-sm" style={{ fontFamily: "'Press Start 2P', monospace" }}>Tu Progreso</h3>
      </div>

      <div className="space-y-3">
        {/* Position */}
        <div className="flex items-center justify-between bg-[#1B1A2A] p-2 rounded-xl border-2 border-[#3B3A5A]">
          <span className="text-xs text-[#F8F9FA]/70">Posición</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#38BDF8]">
              {player.board_position}
            </span>
            <span className="text-xs text-[#F8F9FA]/50">casilla</span>
          </div>
        </div>

        {/* Coins */}
        <div className="flex items-center justify-between p-2 bg-[#FFD966]/20 rounded-xl border-2 border-[#FFD966]">
          <div className="flex items-center gap-2">
            <CoinsIcon className="w-4 h-4 text-[#FFD966]" />
            <span className="text-xs font-medium text-[#F8F9FA]">Monedas</span>
          </div>
          <span className="text-xl font-bold text-[#FFD966]">
            {player.coins_collected}
          </span>
        </div>

        {/* Shields */}
        {player.shields > 0 && (
          <div className="flex items-center justify-between p-2 bg-[#10B981]/20 rounded-xl border-2 border-[#10B981]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <span className="text-xs font-medium text-[#F8F9FA]">Escudos</span>
            </div>
            <span className="text-xl font-bold text-[#10B981]">
              {player.shields}
            </span>
          </div>
        )}

        {/* Powerups */}
        {player.powerups.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-[#EC4899]/20 rounded-xl border-2 border-[#EC4899]">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="text-xs font-medium text-[#F8F9FA]">Powerups</span>
            </div>
            <span className="text-xl font-bold text-[#EC4899]">
              {player.powerups.length}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * MessageCenter - Centro de mensajes
 */
interface MessageCenterProps {
  isMyTurn: boolean;
  currentPlayerName?: string;
  isRolling: boolean;
}

function MessageCenter({
  isMyTurn,
  currentPlayerName,
  isRolling,
}: MessageCenterProps) {
  return (
    <AnimatePresence mode="wait">
      {isRolling && (
        <motion.div
          key="rolling"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-[#5B21B6] text-[#F8F9FA] px-8 py-4 rounded-2xl shadow-2xl font-bold text-xl border-4 border-[#FFD966]"
          style={{
            boxShadow: '0 0 30px rgba(255, 217, 102, 0.6), 0 10px 40px rgba(0,0,0,0.8)'
          }}
        >
          🎲 Tirando el dado...
        </motion.div>
      )}

      {!isRolling && !isMyTurn && currentPlayerName && (
        <motion.div
          key="waiting"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-[#2D2C3E] text-[#F8F9FA] px-8 py-4 rounded-2xl shadow-2xl font-medium text-lg border-2 border-[#38BDF8]"
          style={{
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}
        >
          ⏳ Esperando a {currentPlayerName}...
        </motion.div>
      )}
    </AnimatePresence>
  );
}
