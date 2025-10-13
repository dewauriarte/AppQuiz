/**
 * Board Mode Components - Sprint 11
 * Modo tablero tipo Mario Party
 */

export { BoardGameCanvas } from './BoardGameCanvas';
export {
  PlayerToken,
  AnimatedPlayerToken,
  PlayerTokenHTML
} from './PlayerToken';
export { BoardGameScreen } from './BoardGameScreen';
export { BoardFinalResultsScreen } from './BoardFinalResultsScreen';
export { 
  DiceRoller,
  CompactDiceRoller,
  DiceHistory 
} from './DiceRoller';
export { 
  EventPopup,
  EventIndicator 
} from './EventPopup';
export { BoardGameHUD } from './BoardGameHUD';
export { 
  TurnIndicator,
  PlayerTurnArrow,
  TurnBadge,
  TurnTimeline 
} from './TurnIndicator';
export { 
  CheckpointShop,
  CompactShopButton 
} from './CheckpointShop';
export {
  PlayerMovementAnimation,
  CoinCollectionAnimation,
  GemCollectionAnimation,
  ScreenShakeEffect,
  FloatingText,
  ParticleExplosion,
  PulseRing,
  PathTracer,
  PopIn,
  SlideIn,
} from './BoardAnimations';

// Re-export types
export type {
  BoardGameState,
  BoardPlayerState,
  BoardEventAssignment,
  DiceRollResult,
  BoardEventTrigger,
  EventEffects,
  TurnResult,
  BoardGameEndResult,
  BoardLayout,
  BoardEventType,
} from '@/types/board-game';
