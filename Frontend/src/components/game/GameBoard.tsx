import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuestionCard } from './QuestionCard';
import { Trophy, Users, Clock } from 'lucide-react';

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
}

interface GameBoardProps {
  gameState: GameState;
  currentQuestion?: {
    id: string;
    text: string;
    type: 'multiple_choice' | 'true_false';
    options?: { id: string; text: string; isCorrect?: boolean }[];
    difficulty: number;
    timeLimit: number;
    points: number;
  };
  onAnswerSelect?: (optionId: string) => void;
  onStartGame?: () => void;
  onLeaveGame?: () => void;
  className?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentQuestion,
  onAnswerSelect,
  onStartGame,
  onLeaveGame,
  className = '',
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'starting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'finished': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Esperando jugadores...';
      case 'starting': return '¡El juego comienza!';
      case 'active': return 'En juego';
      case 'finished': return 'Juego terminado';
      default: return 'Estado desconocido';
    }
  };

  const progressPercentage = gameState.totalQuestions > 0
    ? ((gameState.currentQuestionIndex) / gameState.totalQuestions) * 100
    : 0;

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header del juego */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Estado del juego */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(gameState.status)}>
                {getStatusText(gameState.status)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Pregunta {gameState.currentQuestionIndex + 1} de {gameState.totalQuestions}
            </div>
          </CardContent>
        </Card>

        {/* Progreso */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Progreso</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Jugadores */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Jugadores</span>
            </div>
            <div className="text-2xl font-bold">
              {gameState.players.length}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Área principal del juego */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel lateral izquierdo - Leaderboard */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gameState.players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      player.isCurrentPlayer
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${
                        player.isCurrentPlayer ? 'text-primary' : ''
                      }`}>
                        {player.nickname}
                        {player.isCurrentPlayer && ' (Tú)'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {player.score} pts
                      </div>
                    </div>
                  </motion.div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Área central - Pregunta */}
        <div className="lg:col-span-3">
          {gameState.status === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Card className="border-dashed border-2">
                <CardContent className="p-12">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Esperando jugadores...</h3>
                    <p className="text-muted-foreground">
                      El juego comenzará cuando haya suficientes jugadores
                    </p>
                    <Button
                      onClick={onStartGame}
                      className="mt-4"
                      disabled={gameState.players.length < 2}
                    >
                      Comenzar Juego
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameState.status === 'active' && currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              onAnswerSelect={onAnswerSelect}
              onTimeUp={() => console.log('Tiempo agotado')}
            />
          )}

          {gameState.status === 'finished' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Card>
                <CardContent className="p-12">
                  <div className="space-y-6">
                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold">¡Juego Terminado!</h2>
                    <div className="space-y-2">
                      <p className="text-lg">
                        ¡Felicidades! Has completado todas las preguntas.
                      </p>
                      <p className="text-muted-foreground">
                        Revisa el leaderboard para ver tu posición final.
                      </p>
                    </div>
                    <Button onClick={onLeaveGame} className="mt-6">
                      Salir del Juego
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
